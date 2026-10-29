import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import sys
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

from app.config import settings
from app.classifier import get_classifier
from app.schemas import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    DepartmentListResponse,
    HealthResponse
)

# Startup & Shutdown Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Preload the model once during application boot
    classifier = get_classifier()
    try:
        classifier.load_model()
    except Exception as e:
        print(f"[WARNING] Model could not be preloaded at startup: {e}")
    yield
    # Cleanup if needed on shutdown

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.app_description,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse, tags=["System Health"])
async def health_check():
    """Returns the operational status of the service, model state, and active device."""
    classifier = get_classifier()
    return HealthResponse(
        status="healthy" if classifier.is_loaded else "initializing",
        app_name=settings.app_name,
        version=settings.app_version,
        model_loaded=classifier.is_loaded,
        model_path=classifier.model_path,
        device=str(classifier.device),
        department_count=len(classifier.id2label)
    )

@app.get("/departments", response_model=DepartmentListResponse, tags=["Departments"])
async def list_departments():
    """Returns the catalog of all administrative departments recognized by the classifier."""
    classifier = get_classifier()
    if not classifier.is_loaded:
        classifier.load_model()
    depts = classifier.get_departments()
    return DepartmentListResponse(total=len(depts), departments=depts)

@app.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Predictions"],
    summary="Classify a single grievance complaint"
)
async def predict_complaint(request: PredictionRequest):
    """
    Submits a grievance text to BERT classifier and returns:
    - Primary assigned department
    - Department internal ID
    - Confidence score
    - Top-K ranked probability breakdown
    - Inference latency in milliseconds
    """
    if not request.complaint or len(request.complaint.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Complaint text must be at least 3 characters long."
        )

    try:
        classifier = get_classifier()
        response = classifier.predict_single(request.complaint, top_k=request.top_k or settings.default_top_k)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

@app.post(
    "/predict/batch",
    response_model=BatchPredictionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Predictions"],
    summary="Classify multiple grievance complaints in a single request"
)
async def predict_batch_complaints(request: BatchPredictionRequest):
    """
    Submits a batch of grievance texts (up to 100) for parallel vectorized inference.
    Ideal for bulk ingestion, batch triage, or queue processing.
    """
    if not request.complaints:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="List of complaints cannot be empty."
        )

    try:
        classifier = get_classifier()
        response = classifier.predict_batch(request.complaints, top_k=request.top_k or settings.default_top_k)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch inference error: {str(e)}"
        )

@app.get("/", response_class=HTMLResponse, tags=["Web Portal"])
@app.get("/ui", response_class=HTMLResponse, tags=["Web Portal"])
async def web_portal():
    """Interactive Citizen Grievance Portal UI for testing predictions live in browser."""
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grievance AI - Citizen Department Classifier</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(22, 30, 49, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --card-hover-border: rgba(99, 102, 241, 0.4);
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --primary-glow: rgba(99, 102, 241, 0.25);
      --accent: #06b6d4;
      --success: #10b981;
      --warning: #f59e0b;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --text-dim: #6b7280;
      --input-bg: rgba(15, 23, 42, 0.85);
      --border-radius: 16px;
      --pill-bg: rgba(255, 255, 255, 0.05);
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.12), transparent 40%),
                  radial-gradient(circle at 85% 85%, rgba(6, 182, 212, 0.1), transparent 40%),
                  var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      border-bottom: 1px solid var(--card-border);
      backdrop-filter: blur(12px);
      background: rgba(11, 15, 25, 0.8);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
      color: #fff;
      box-shadow: 0 4px 14px var(--primary-glow);
    }
    .logo-text h1 {
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .logo-text span {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .nav-link {
      padding: 8px 16px;
      border-radius: 8px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
      background: var(--pill-bg);
      border: 1px solid var(--card-border);
    }
    .nav-link:hover {
      color: #fff;
      border-color: var(--card-hover-border);
      background: rgba(99, 102, 241, 0.1);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 20px;
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 8px var(--success);
    }
    main {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px 60px;
      width: 100%;
    }
    .hero {
      text-align: center;
      margin-bottom: 36px;
    }
    .hero-tag {
      display: inline-block;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 700;
      color: var(--accent);
      background: rgba(6, 182, 212, 0.1);
      padding: 4px 14px;
      border-radius: 20px;
      margin-bottom: 12px;
      border: 1px solid rgba(6, 182, 212, 0.2);
    }
    .hero h2 {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 10px;
      background: linear-gradient(135deg, #ffffff 40%, #9ca3af 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero p {
      color: var(--text-muted);
      font-size: 1rem;
      max-width: 650px;
      margin: 0 auto;
    }
    .grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 28px;
    }
    @media (max-width: 860px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--border-radius);
      padding: 28px;
      backdrop-filter: blur(16px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      transition: border-color 0.3s;
    }
    .card:hover {
      border-color: var(--card-hover-border);
    }
    .card-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .card-title svg {
      width: 22px;
      height: 22px;
      color: var(--primary);
    }
    .quick-examples {
      margin-bottom: 16px;
    }
    .quick-examples span {
      font-size: 0.75rem;
      color: var(--text-dim);
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .example-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .chip {
      background: var(--pill-bg);
      border: 1px solid var(--card-border);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
    }
    .chip:hover {
      background: rgba(99, 102, 241, 0.15);
      border-color: var(--primary);
      color: #fff;
    }
    .textarea-container {
      position: relative;
      margin-bottom: 18px;
    }
    textarea {
      width: 100%;
      height: 150px;
      background: var(--input-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      color: var(--text);
      font-size: 0.95rem;
      font-family: inherit;
      resize: vertical;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      line-height: 1.5;
    }
    textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-submit {
      background: linear-gradient(135deg, var(--primary), var(--primary-hover));
      color: white;
      border: none;
      padding: 12px 28px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.15s, box-shadow 0.2s;
      box-shadow: 0 4px 14px var(--primary-glow);
    }
    .btn-submit:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }
    .btn-submit:active {
      transform: translateY(0);
    }
    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .result-box {
      min-height: 260px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .empty-state {
      text-align: center;
      color: var(--text-dim);
      padding: 30px 10px;
    }
    .empty-state svg {
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      opacity: 0.4;
    }
    .prediction-card {
      background: rgba(15, 23, 42, 0.6);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 20px;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .prediction-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .predicted-dept {
      font-size: 1.35rem;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .dept-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(99, 102, 241, 0.2);
      color: var(--accent);
    }
    .confidence-score {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--success);
      font-family: 'JetBrains Mono', monospace;
    }
    .bars-section {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .bar-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .bar-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
    }
    .bar-name {
      color: var(--text);
      font-weight: 500;
    }
    .bar-pct {
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
    }
    .progress-track {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 6px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 6px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .progress-fill.secondary {
      background: rgba(156, 163, 175, 0.5);
    }
    .timing-badge {
      margin-top: 16px;
      font-size: 0.75rem;
      color: var(--text-dim);
      font-family: 'JetBrains Mono', monospace;
      display: flex;
      justify-content: space-between;
    }
    .api-preview {
      margin-top: 36px;
    }
    .code-block {
      background: #060911;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.825rem;
      color: #e2e8f0;
      overflow-x: auto;
      line-height: 1.5;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <header>
    <div class="nav-container">
      <div class="logo-area">
        <div class="logo-badge">G</div>
        <div class="logo-text">
          <h1>Grievance Department Classifier</h1>
          <span>Citizen Portal AI Service</span>
        </div>
      </div>
      <div class="nav-links">
        <span class="status-badge"><span class="status-dot"></span> Live Model Ready</span>
        <a href="/docs" target="_blank" class="nav-link">Swagger Docs</a>
        <a href="/redoc" target="_blank" class="nav-link">ReDoc API</a>
      </div>
    </div>
  </header>

  <main>
    <div class="hero">
      <div class="hero-tag">Automated Grievance Routing</div>
      <h2>Classify Citizen Complaints Instantly</h2>
      <p>Powered by fine-tuned BERT NLP architecture trained across 12 municipal & public departments with high-precision confidence scoring.</p>
    </div>

    <div class="grid">
      <!-- Input Card -->
      <div class="card">
        <div class="card-title">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Enter Grievance Complaint
        </div>

        <div class="quick-examples">
          <span>Click to try a sample complaint:</span>
          <div class="example-chips">
            <div class="chip" onclick="setComplaint('There are huge potholes on the highway near the toll gate causing flat tires and danger.')">Roads / Potholes</div>
            <div class="chip" onclick="setComplaint('Main water supply pipeline is fractured and clean drinking water is leaking everywhere.')">Water Leakage</div>
            <div class="chip" onclick="setComplaint('Street light poles on 5th main road have been completely dark for four days.')">Street Lighting</div>
            <div class="chip" onclick="setComplaint('Trash bin has not been cleared for over a week and waste is piling up on the footpath.')">Sanitation</div>
            <div class="chip" onclick="setComplaint('High voltage fluctuations and constant power tripping in residential block.')">Electricity</div>
            <div class="chip" onclick="setComplaint('Sewage drain is clogged and foul black water is flooding into our compound.')">Drainage</div>
          </div>
        </div>

        <div class="textarea-container">
          <textarea id="complaintInput" placeholder="Describe the citizen issue or grievance in detail... (e.g. 'Street lights are broken on Main Street...')">There are large potholes on the road near the government hospital and vehicles are having severe difficulty passing.</textarea>
        </div>

        <div class="action-row">
          <span style="font-size: 0.8rem; color: var(--text-dim);" id="charCount">0 characters</span>
          <button id="submitBtn" class="btn-submit" onclick="submitPrediction()">
            <span id="btnText">Classify Department</span>
            <span id="btnSpinner" class="spinner" style="display: none;"></span>
          </button>
        </div>
      </div>

      <!-- Results Card -->
      <div class="card">
        <div class="card-title">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Assignment Results
        </div>

        <div id="resultBox" class="result-box">
          <div class="empty-state">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <p>Click <strong>"Classify Department"</strong> to see AI assignment breakdown.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick API Integration Block -->
    <div class="card api-preview">
      <div class="card-title">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
        </svg>
        API Usage (cURL)
      </div>
      <div class="code-block">curl -X POST "http://localhost:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{"complaint": "Road has deep potholes near the bus terminal."}'</div>
    </div>
  </main>

  <script>
    const textarea = document.getElementById('complaintInput');
    const charCount = document.getElementById('charCount');

    function updateCount() {
      charCount.textContent = `${textarea.value.length} characters`;
    }
    textarea.addEventListener('input', updateCount);
    updateCount();

    function setComplaint(text) {
      textarea.value = text;
      updateCount();
      submitPrediction();
    }

    async function submitPrediction() {
      const text = textarea.value.trim();
      if (!text) {
        alert('Please enter a complaint description.');
        return;
      }

      const submitBtn = document.getElementById('submitBtn');
      const btnText = document.getElementById('btnText');
      const btnSpinner = document.getElementById('btnSpinner');
      const resultBox = document.getElementById('resultBox');

      submitBtn.disabled = true;
      btnText.textContent = 'Analyzing...';
      btnSpinner.style.display = 'inline-block';

      try {
        const response = await fetch('/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complaint: text, top_k: 3 })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || 'Classification failed');
        }

        const data = await response.json();
        renderResults(data);
      } catch (err) {
        resultBox.innerHTML = `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 16px; border-radius: 10px; color: #f87171;">
            <strong>Error:</strong> ${err.message}
          </div>
        `;
      } finally {
        submitBtn.disabled = false;
        btnText.textContent = 'Classify Department';
        btnSpinner.style.display = 'none';
      }
    }

    function renderResults(data) {
      const resultBox = document.getElementById('resultBox');
      const top = data.predicted_department;
      const confPct = data.confidence_pct;
      const latency = data.inference_time_ms;

      let barsHtml = '';
      data.top_predictions.forEach((item, index) => {
        const isPrimary = index === 0;
        barsHtml += `
          <div class="bar-item">
            <div class="bar-meta">
              <span class="bar-name">${index + 1}. ${item.department}</span>
              <span class="bar-pct">${item.confidence_pct.toFixed(2)}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill ${isPrimary ? '' : 'secondary'}" style="width: ${Math.max(item.confidence_pct, 2)}%"></div>
            </div>
          </div>
        `;
      });

      resultBox.innerHTML = `
        <div class="prediction-card">
          <div class="prediction-header">
            <div>
              <span class="dept-badge">Primary Department Assigned</span>
              <div class="predicted-dept">${top}</div>
            </div>
            <div class="confidence-score">${confPct.toFixed(1)}%</div>
          </div>

          <div class="bars-section">
            <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">
              Confidence Breakdown (Top 3)
            </div>
            ${barsHtml}
          </div>

          <div class="timing-badge">
            <span>Inference Latency: ${latency} ms</span>
            <span>Department ID: #${data.department_id}</span>
          </div>
        </div>
      `;
    }
  </script>
</body>
</html>"""
    return HTMLResponse(content=html_content)

def main():
    import uvicorn
    uvicorn.run("app.api:app", host=settings.host, port=settings.port, reload=False)

if __name__ == "__main__":
    main()
