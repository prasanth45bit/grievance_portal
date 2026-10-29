# Citizen Grievance Department Classifier - API & Service

A production-ready NLP microservice designed to automatically classify citizen grievances into 12 municipal and administrative departments using a fine-tuned BERT transformer model (`bert-base-uncased`).

Includes a **FastAPI REST API**, an **Interactive Web Portal**, automated health checks, batch prediction, and ready-to-deploy **Docker** & **Windows Service** configurations.

---

## ⚡ Quick Start

### Option 1: Double-Click Launcher (Windows)
Double-click [`start_service.bat`](file:///d:/MY_PROJECTS/S7%20PROJECT/department-classifier/start_service.bat) in the project directory.

### Option 2: Command Line
```powershell
# Run using Python
py -3.13 run_service.py --host 0.0.0.0 --port 8000
```

### Option 3: Run as a Background Service (Windows)
```powershell
# Start silent background daemon (saves PID & logs to logs/service.log)
.\start_background_service.ps1

# Stop background daemon
.\stop_background_service.ps1
```

### Option 4: Deploy with Docker Compose
```bash
docker compose up --build -d
```

Once running, navigate to:
- 🌐 **Interactive Web Portal**: [http://localhost:8000](http://localhost:8000) or [http://localhost:8000/ui](http://localhost:8000/ui)
- 📖 **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 📑 **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- ❤️ **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 📂 Project Architecture

```
department-classifier/
├── app/
│   ├── __init__.py            # Application package
│   ├── api.py                 # FastAPI REST API & Web UI dashboard
│   ├── classifier.py          # Singleton BERT inference engine
│   ├── config.py              # Configuration & environment settings
│   └── schemas.py             # Pydantic request & response models
├── dataset/
│   └── complaints_dataset.csv # Training complaints dataset
├── grievance-bert-model/       # Fine-tuned BERT model weights & vocab
│   ├── config.json
│   ├── label_mapping.json
│   ├── model.safetensors
│   └── vocab.txt
├── tests/
│   └── test_api.py            # Automated pytest test suite
├── Dockerfile                 # Multi-stage CPU-optimized Docker build
├── docker-compose.yml         # Container orchestration with volume mount
├── run_service.py             # CLI runner script
├── start_service.bat          # 1-click Windows runner
├── start_background_service.ps1 # Background service daemon launcher
├── stop_background_service.ps1  # Daemon stopper
├── test_client.py             # Comprehensive test script
├── requirements.txt           # Python dependencies
└── README.md
```

---

## 🏛️ Supported Administrative Departments (12 Classes)

| ID | Department | Example Complaints |
|:---|:---|:---|
| `0` | **Animal Control** | Stray dogs roaming, cattle blocking roads, animal menace |
| `1` | **Drainage and Sewerage** | Clogged manholes, sewage overflow, foul drainage smell |
| `2` | **Electricity** | Voltage fluctuations, power outages, damaged transformer |
| `3` | **Environment** | Factory smoke, tree cutting, chemical fumes, noise pollution |
| `4` | **Municipal Administration**| Delays in birth certificate, property tax errors, office permits |
| `5` | **Parks and Recreation** | Damaged swing equipment, unmaintained public garden, walking tracks |
| `6` | **Public Health** | Mosquito breeding, stagnant water, hospital cleanliness |
| `7` | **Roads and Highways** | Potholes, broken tar, missing speed breakers, uneven paving |
| `8` | **Sanitation** | Overflowing garbage bins, missed trash collection, litter |
| `9` | **Street Lighting** | Broken sodium lamps, dark alleys, flickering streetlights |
| `10`| **Transport** | Irregular bus frequencies, rash driving, bus stop shed damages |
| `11`| **Water Supply** | Broken supply pipe, low water pressure, contaminated tap water |

---

## 🔌 API Endpoints Reference

### 1. Health Status
- **Method**: `GET`
- **Path**: `/health`
- **Response**:
```json
{
  "status": "healthy",
  "app_name": "Citizen Grievance Department Classifier API",
  "version": "1.0.0",
  "model_loaded": true,
  "model_path": "D:\\MY_PROJECTS\\S7 PROJECT\\department-classifier\\grievance-bert-model",
  "device": "cpu",
  "department_count": 12
}
```

---

### 2. Get Department Catalog
- **Method**: `GET`
- **Path**: `/departments`
- **Response**:
```json
{
  "total": 12,
  "departments": [
    { "department_id": 0, "name": "Animal Control" },
    { "department_id": 1, "name": "Drainage and Sewerage" },
    { "department_id": 2, "name": "Electricity" },
    { "department_id": 7, "name": "Roads and Highways" },
    { "department_id": 11, "name": "Water Supply" }
  ]
}
```

---

### 3. Single Complaint Classification
- **Method**: `POST`
- **Path**: `/predict`
- **Request Body**:
```json
{
  "complaint": "There are several deep potholes on the main highway near the school causing major traffic hazards.",
  "top_k": 3
}
```
- **Response**:
```json
{
  "success": true,
  "complaint": "There are several deep potholes on the main highway near the school causing major traffic hazards.",
  "predicted_department": "Roads and Highways",
  "department_id": 7,
  "confidence": 0.9988,
  "confidence_pct": 99.88,
  "is_confident": true,
  "top_predictions": [
    {
      "rank": 1,
      "department_id": 7,
      "department": "Roads and Highways",
      "confidence": 0.9988,
      "confidence_pct": 99.88
    },
    {
      "rank": 2,
      "department_id": 8,
      "department": "Sanitation",
      "confidence": 0.0002,
      "confidence_pct": 0.02
    },
    {
      "rank": 3,
      "department_id": 0,
      "department": "Animal Control",
      "confidence": 0.0002,
      "confidence_pct": 0.02
    }
  ],
  "inference_time_ms": 285.55
}
```

---

### 4. Batch Complaints Classification
- **Method**: `POST`
- **Path**: `/predict/batch`
- **Request Body**:
```json
{
  "complaints": [
    "A main drinking water pipe is broken and clean water is flooding the street.",
    "Street lights are dark and broken on 5th cross road for three nights.",
    "Garbage bins are overflowing and not cleared by municipal workers for a week."
  ],
  "top_k": 2
}
```
- **Response**:
```json
{
  "success": true,
  "total": 3,
  "predictions": [
    {
      "predicted_department": "Water Supply",
      "department_id": 11,
      "confidence_pct": 99.86
    },
    {
      "predicted_department": "Street Lighting",
      "department_id": 9,
      "confidence_pct": 99.90
    },
    {
      "predicted_department": "Sanitation",
      "department_id": 8,
      "confidence_pct": 99.90
    }
  ],
  "total_time_ms": 294.03
}
```

---

## 💻 Integration Code Snippets

### Frontend Integration (JavaScript / Fetch)
```javascript
async function routeGrievance(complaintText) {
  const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ complaint: complaintText, top_k: 3 })
  });

  const result = await response.json();
  console.log('Assigned Department:', result.predicted_department);
  console.log('Confidence:', result.confidence_pct + '%');
  return result;
}
```

### Python Integration
```python
import requests

res = requests.post(
    "http://localhost:8000/predict",
    json={"complaint": "Water pipeline burst on 2nd avenue", "top_k": 3}
)
data = res.json()
print(f"Department: {data['predicted_department']} ({data['confidence_pct']}%)")
```

---

## 🧪 Running Automated Tests

Run the test suite with pytest:
```bash
py -3.13 -m pytest tests/test_api.py -v
```

Or run the live integration test client:
```bash
py -3.13 test_client.py
```
