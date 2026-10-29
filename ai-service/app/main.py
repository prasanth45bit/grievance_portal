import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from app.config import settings
from app.utils.logging_config import logger
from app.api.health import router as health_router
from app.api.prediction import router as prediction_router
from app.services.detector import get_detector

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up %s v%s...", settings.app_name, settings.app_version)
    detector = get_detector()
    try:
        detector.load_model()
    except Exception as e:
        logger.warning("Model could not be preloaded at startup: %s. Will load on first request.", e)
    yield
    logger.info("Shutting down %s...", settings.app_name)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.app_description,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health_router)
app.include_router(prediction_router)

@app.get("/", response_class=HTMLResponse, tags=["Web Portal"])
@app.get("/ui", response_class=HTMLResponse, tags=["Web Portal"])
async def visual_portal():
    """Interactive visual portal to test civic issue image detection live in the browser."""
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Civic Issue AI Vision - Object Detection Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card: rgba(22, 30, 49, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --primary: #3b82f6;
      --accent: #10b981;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.15), transparent 40%),
                  radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.12), transparent 40%),
                  var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(12px);
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo { font-size: 1.2rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
    .badge { background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; }
    main { max-width: 1200px; margin: 30px auto; padding: 0 20px; flex: 1; width: 100%; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media(max-width: 800px) { .grid { grid-template-columns: 1fr; } }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
    .upload-area {
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .upload-area:hover { border-color: var(--primary); background: rgba(59, 130, 246, 0.05); }
    .preview-container { position: relative; margin-top: 20px; text-align: center; max-height: 400px; overflow: hidden; border-radius: 8px; }
    .preview-container img { max-width: 100%; max-height: 400px; border-radius: 8px; }
    canvas { position: absolute; top: 0; left: 0; }
    button {
      background: var(--primary); color: white; border: none; padding: 12px 24px;
      border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 16px; width: 100%;
    }
    button:disabled { opacity: 0.5; }
    .det-box { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-top: 10px; }
    .det-title { font-weight: 700; font-size: 1.1rem; color: #fff; display: flex; justify-content: space-between; }
    .conf-tag { color: var(--accent); font-family: 'JetBrains Mono', monospace; }
    .dept-tag { color: #93c5fd; font-size: 0.85rem; margin-top: 4px; }
  </style>
</head>
<body>
  <header>
    <div class="logo">
      <span>📷 Civic Issue Vision AI</span>
      <span class="badge">YOLO Detection + Routing</span>
    </div>
    <div>
      <a href="/docs" target="_blank" style="color: var(--text-muted); text-decoration: none; font-size: 0.9rem;">Swagger API Docs</a>
    </div>
  </header>
  <main>
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="font-size: 2rem; font-weight: 800;">Civic Image Issue Detector</h2>
      <p style="color: var(--text-muted); margin-top: 6px;">Upload a photograph of a road pothole, road damage, or garbage to detect visual anomalies and determine the responsible municipal department.</p>
    </div>
    <div class="grid">
      <div class="card">
        <h3 style="margin-bottom: 16px;">1. Select Civic Complaint Image</h3>
        <div class="upload-area" onclick="document.getElementById('fileInput').click()">
          <p id="uploadPrompt">📁 Click to choose an image (JPG, PNG, WEBP)</p>
          <input type="file" id="fileInput" accept="image/*" style="display: none;" onchange="handleFileSelect(event)">
        </div>
        <div class="preview-container" id="previewContainer" style="display: none;">
          <img id="imagePreview" alt="Preview">
          <canvas id="overlayCanvas"></canvas>
        </div>
        <button id="detectBtn" onclick="runDetection()" disabled>Detect Civic Issues</button>
      </div>

      <div class="card">
        <h3 style="margin-bottom: 16px;">2. AI Vision Analysis Results</h3>
        <div id="resultsContainer">
          <p style="color: var(--text-muted);">Awaiting image upload and detection run...</p>
        </div>
      </div>
    </div>
  </main>

  <script>
    let selectedFile = null;

    function handleFileSelect(e) {
      const file = e.target.files[0];
      if (!file) return;
      selectedFile = file;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const preview = document.getElementById('imagePreview');
        preview.src = evt.target.result;
        preview.onload = function() {
          const canvas = document.getElementById('overlayCanvas');
          canvas.width = preview.clientWidth;
          canvas.height = preview.clientHeight;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        document.getElementById('previewContainer').style.display = 'block';
        document.getElementById('detectBtn').disabled = false;
        document.getElementById('uploadPrompt').innerText = file.name;
      };
      reader.readAsDataURL(file);
    }

    async function runDetection() {
      if (!selectedFile) return;
      const btn = document.getElementById('detectBtn');
      const resultsDiv = document.getElementById('resultsContainer');
      btn.disabled = true;
      btn.innerText = 'Analyzing Image...';
      resultsDiv.innerHTML = '<p>Running YOLO inference and department taxonomy mapping...</p>';

      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const res = await fetch('/predict', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.detail || 'Inference error');

        renderResults(data);
      } catch (err) {
        resultsDiv.innerHTML = `<p style="color: #ef4444;">Error: ${err.message}</p>`;
      } finally {
        btn.disabled = false;
        btn.innerText = 'Detect Civic Issues';
      }
    }

    function renderResults(data) {
      const resultsDiv = document.getElementById('resultsContainer');
      const preview = document.getElementById('imagePreview');
      const canvas = document.getElementById('overlayCanvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaleX = preview.clientWidth / data.image.width;
      const scaleY = preview.clientHeight / data.image.height;

      if (!data.detections || data.detections.length === 0) {
        resultsDiv.innerHTML = `
          <div class="det-box" style="border-color: #f59e0b;">
            <div class="det-title" style="color: #f59e0b;">No Reliable Visual Issue Detected</div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 6px;">${data.message || 'The photograph did not show supported civic anomalies with sufficient confidence.'}</p>
          </div>
        `;
        return;
      }

      let html = `<p style="color: var(--text-muted); margin-bottom: 10px;">Primary Recommended Department: <strong style="color: #60a5fa;">${data.primary_department}</strong> (Status: ${data.status})</p>`;

      data.detections.forEach((d, idx) => {
        // Draw bounding box
        const x = d.bbox.x1 * scaleX;
        const y = d.bbox.y1 * scaleY;
        const w = (d.bbox.x2 - d.bbox.x1) * scaleX;
        const h = (d.bbox.y2 - d.bbox.y1) * scaleY;

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(x, Math.max(0, y - 22), Math.min(w, 160), 22);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`${d.class_name} (${Math.round(d.confidence * 100)}%)`, x + 4, Math.max(16, y - 6));

        html += `
          <div class="det-box">
            <div class="det-title">
              <span>#${idx + 1} ${d.class_name}</span>
              <span class="conf-tag">${(d.confidence * 100).toFixed(1)}%</span>
            </div>
            <div class="dept-tag">🏛️ Department: <strong>${d.suggested_department}</strong></div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">${d.visual_issue || ''}</div>
          </div>
        `;
      });

      if (data.ocr_text) {
        html += `
          <div class="det-box" style="margin-top: 14px; border-color: rgba(59, 130, 246, 0.4);">
            <div class="det-title" style="font-size: 0.95rem;">Extracted Signage OCR</div>
            <p style="font-size: 0.85rem; color: #93c5fd; margin-top: 4px;">"${data.ocr_text}"</p>
          </div>
        `;
      }

      resultsDiv.innerHTML = html;
    }
  </script>
</body>
</html>"""
    return HTMLResponse(content=html_content)

def main():
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=False)

if __name__ == "__main__":
    main()
