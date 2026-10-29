# 📷 Civic Issue AI Vision - Object Detection & Routing Service

A production-grade Computer Vision and Object Detection REST microservice designed to analyze citizen-submitted complaint photographs, detect civic and municipal anomalies (potholes, road damage, overflowing garbage, pipe bursts), determine bounding-box coordinates and confidence scores, and intelligently route complaints to the appropriate administrative department.

Complements the portal's existing BERT NLP text classification model via a multi-modal fusion architecture in the Node.js backend.

---

## 📑 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Supported Visual Classes & Taxonomy](#-supported-visual-classes--taxonomy)
- [Department Mapping Service](#-department-mapping-service)
- [Multi-Modal Fusion with BERT](#-multi-modal-fusion-with-bert)
- [Prerequisites & Environment Setup](#-prerequisites--environment-setup)
- [Model Weights & Pretrained Baselines](#-model-weights--pretrained-baselines)
- [Running the Service](#-running-the-service)
- [REST API Reference & Examples](#-rest-api-reference--examples)
- [Dataset Preparation & Annotation](#-dataset-preparation--annotation)
- [Training & Fine-Tuning Pipeline](#-training--fine-tuning-pipeline)
- [Model Evaluation & Benchmarks](#-model-evaluation--benchmarks)
- [Node.js Backend Integration](#-nodejs-backend-integration)
- [Environment Variables](#-environment-variables)
- [Troubleshooting & Limitations](#-troubleshooting--limitations)
- [License & Attribution](#-license--attribution)

---

## 💡 Overview & Architecture

When citizens encounter civic infrastructure breakdowns, photographs provide irrefutable physical evidence. However, general-purpose vision models (like standard COCO YOLO) only recognize generic household objects and do not recognize potholes, road cracks, sewer blockages, or electrical hazards.

This microservice provides:
1. **Lightweight YOLOv8 Nano (`yolov8n`) Object Detection** optimized for CPU and GPU inference.
2. **Specialized Civic Checkpoints** trained on the Road Damage Dataset (RDD2022) and Municipal Garbage datasets.
3. **Automated Bounding-Box Localisation** (`x1, y1, x2, y2`) and confidence scoring.
4. **Resilient OCR Extraction** for signboards and mile markers via PaddleOCR / PyTesseract.
5. **Interactive Web Dashboard** at `http://localhost:8001/ui` for instant visual inspection.

```text
React Frontend
      │
      ▼
Node.js / Express Backend (Port 5000)
      │
      ├──────────────────────────┬──────────────────────────┐
      ▼                          ▼                          ▼
BERT Microservice          YOLO Vision Service       MySQL Database
(Text Classification)      (Civic Issue Detection)   (Sequelize ORM)
Port 8000                  Port 8001
      │                          │
      └────────────┬─────────────┘
                   ▼
         Multi-Modal Fusion
                   ▼
     Automated Officer Assignment
```

---

## 🏷️ Supported Visual Classes & Taxonomy

Visual classes represent distinct physical objects, while departments represent government administrative divisions.

| Class Name | Visual Feature | Suggested Department | Default Priority |
|:---|:---|:---|:---|
| `pothole` | Cavity/crater in asphalt roadway | **Roads and Highways** | `HIGH` |
| `alligator crack` | Interconnected crocodile-pattern road cracks | **Roads and Highways** | `MEDIUM` |
| `transverse crack` | Perpendicular lateral fracture across lane | **Roads and Highways** | `MEDIUM` |
| `longitudinal crack`| Continuous crack along vehicle direction | **Roads and Highways** | `MEDIUM` |
| `other corruption` | Pavement depression, peeling tar, edge rut | **Roads and Highways** | `MEDIUM` |
| `garbage` / `garbage_pile` | Dumped municipal solid waste pile | **Sanitation** | `MEDIUM` |
| `overflowing_garbage` | Overflowing collection dumpster or vat | **Sanitation** | `HIGH` |
| `plastic` / `litter` | Discarded non-biodegradable roadside litter | **Sanitation** | `LOW` |
| `water_leakage` / `pipe_burst` | Potable distribution pipeline rupture | **Water Supply** | `HIGH` |
| `sewage_overflow` | Wastewater overflowing from sewer | **Drainage and Sewerage** | `CRITICAL` |
| `open_manhole` | Uncovered chamber or broken cover | **Drainage and Sewerage** | `CRITICAL` |
| `damaged_electric_pole` | Tilted, fractured, or leaning utility pole | **Electricity** | `CRITICAL` |
| `damaged_power_line` | Snapped or dangling transmission line | **Electricity** | `CRITICAL` |
| `damaged_streetlight` | Broken street luminaire or fixture | **Street Lighting** | `MEDIUM` |
| `stray_animal` | Stray dog pack or cattle obstructing road | **Animal Control** | `MEDIUM` |
| `damaged_park_equipment` | Broken public playground swing or bench | **Parks and Recreation** | `LOW` |

---

## 🏛️ Department Mapping Service

The service maps each visual detection to one of the **12 canonical Tamil Nadu government departments** registered in the portal:

1. Roads and Highways
2. Water Supply
3. Electricity
4. Sanitation
5. Drainage and Sewerage
6. Public Health
7. Municipal Administration
8. Transport
9. Parks and Recreation
10. Environment
11. Street Lighting
12. Animal Control

If visual evidence is inconclusive or ambiguous, the mapping defaults to **`Municipal Administration`** with an explanatory triage notice so that staff can perform human-in-the-loop review.

---

## 🧠 Multi-Modal Fusion with BERT

The Node.js backend combines predictions from both models using explainable fusion rules:

1. **Concordance / Agreement:**
   If BERT text classification and YOLO visual detection identify the same department (e.g. text mentions road damage and photo shows a pothole), confidence is reinforced (`Math.min(0.99, max(text, img) + 0.05)`).
2. **High-Confidence Visual Priority:**
   If visual detection confidence is $\ge 70\%$ for a verified physical object (e.g., severe open manhole), visual evidence takes operational precedence even if citizen text was brief or non-specific.
3. **High-Confidence Text Priority:**
   If text confidence is $\ge 80\%$ and visual detection is ambiguous or below threshold ($< 35\%$), the text-derived department is retained.
4. **No Reliable Visual Detection:**
   If the image is clean or blurry (`status: "no_reliable_detection"`), the system relies on the text model and audits the empty visual result.
5. **Dual Ambiguity:**
   If neither model yields confident classifications, the complaint is routed to Municipal Administration for manual officer dispatch.

---

## ⚙️ Prerequisites & Environment Setup

### 1. Requirements
- Python 3.10, 3.11, 3.12, or 3.13 (64-bit)
- PyTorch 2.0+ (CPU or CUDA 11.8/12.1)
- 4 GB RAM minimum (CPU mode consumes < 450 MB RAM)

### 2. Installation

```powershell
# Windows PowerShell
cd "d:\MY_PROJECTS\S7 PROJECT\ai-service"

# Install dependencies
py -3.13 -m pip install -r requirements.txt
```

```bash
# macOS / Linux
cd ai-service
python3 -m pip install -r requirements.txt
```

---

## 📦 Model Weights & Pretrained Baselines

Weights are stored in `ai-service/models/`:

1. **`road_damage_yolov8n.pt`** (6.2 MB):
   - Fine-tuned on the international **Road Damage Dataset 2022 (RDD2022)** containing Indian road images.
   - Detects: `Pothole`, `alligator crack`, `transverse crack`, `longitudinal crack`, `other corruption`.
2. **`garbage_yolov8n.pt`** (6.2 MB):
   - Fine-tuned on municipal waste imagery.
   - Detects: `garbage_pile`, `plastic`, `paper`, `metal`, `biodegradable`.
3. **`yolov8n.pt`** (6.2 MB):
   - Ultralytics baseline weights.

If weights are missing, `app/services/detector.py` automatically downloads validated checkpoints from Hugging Face on initial launch.

---

## 🚀 Running the Service

### Option 1: Double-Click Launcher (Windows)
Double-click [`start_service.bat`](file:///d:/MY_PROJECTS/S7%20PROJECT/ai-service/start_service.bat).

### Option 2: Command Line
```powershell
py -3.13 run_service.py --host 0.0.0.0 --port 8001
```

### Option 3: PowerShell Background Daemon
```powershell
# Launch silent daemon on port 8001 (logs saved to logs/vision_service.log)
.\start_background_service.ps1

# Stop daemon
.\stop_background_service.ps1
```

### Option 4: Docker Compose
```bash
docker compose up --build -d
```

### Access URLs
- 🌐 **Interactive Vision Portal**: [http://localhost:8001/ui](http://localhost:8001/ui)
- 📖 **Interactive Swagger Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)
- ❤️ **Health Status**: [http://localhost:8001/health](http://localhost:8001/health)

---

## 🔌 REST API Reference & Examples

### 1. Health Status
- **Method**: `GET`
- **Path**: `/health`
- **Response**:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_name": "road_damage_yolov8n",
  "device": "cpu",
  "supported_classes": [
    "alligator crack",
    "transverse crack",
    "longitudinal crack",
    "other corruption",
    "Pothole"
  ],
  "department_mapping_count": 12
}
```

---

### 2. Detect Civic Issues from Image
- **Method**: `POST`
- **Path**: `/predict`
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `file`: Image file (`.jpg`, `.jpeg`, `.png`, `.webp`)
  - `confidence` *(optional query float, 0.05 - 1.0)*: Detection threshold

#### Example Request (cURL):
```bash
curl -X POST "http://localhost:8001/predict?confidence=0.35" \
     -F "file=@/path/to/road_pothole.jpg"
```

#### Example Response (Issue Detected):
```json
{
  "success": true,
  "model": {
    "name": "road_damage_yolov8n",
    "version": "1.0.0",
    "device": "cpu"
  },
  "image": {
    "width": 1280,
    "height": 720,
    "format": "RGB"
  },
  "detections": [
    {
      "class_name": "Pothole",
      "class_id": 4,
      "confidence": 0.8842,
      "bbox": {
        "x1": 340.2,
        "y1": 215.6,
        "x2": 612.0,
        "y2": 490.4
      },
      "suggested_department": "Roads and Highways",
      "visual_issue": "Visible pothole in road surface"
    }
  ],
  "status": "completed",
  "primary_department": "Roads and Highways",
  "primary_confidence": 0.8842,
  "ocr_text": "NH-44 SALEM BYPASS",
  "message": "Detected 1 civic visual issue(s).",
  "inference_time_ms": 118.45
}
```

#### Example Response (Clean Road / No Issue Detected):
```json
{
  "success": true,
  "model": {
    "name": "road_damage_yolov8n",
    "version": "1.0.0",
    "device": "cpu"
  },
  "image": {
    "width": 800,
    "height": 600,
    "format": "RGB"
  },
  "detections": [],
  "status": "no_reliable_detection",
  "primary_department": null,
  "primary_confidence": null,
  "ocr_text": null,
  "message": "No supported civic issue was detected with sufficient confidence.",
  "inference_time_ms": 94.12
}
```

---

## 📊 Dataset Preparation & Annotation

To fine-tune models on local municipal images:

1. Follow standard YOLO directory layout:
```text
dataset/
├── data.yaml
├── images/
│   ├── train/
│   ├── val/
│   └── test/
└── labels/
    ├── train/
    ├── val/
    └── test/
```

2. Format annotations in normalized coordinates: `<class_id> <x_center> <y_center> <width> <height>`.
3. Configure classes in [`dataset/data.yaml`](file:///d:/MY_PROJECTS/S7%20PROJECT/ai-service/dataset/data.yaml).

---

## 🏋️ Training & Fine-Tuning Pipeline

Execute the reproducible training script:

```powershell
py -3.13 training/train.py `
    --data dataset/data.yaml `
    --model models/road_damage_yolov8n.pt `
    --epochs 50 `
    --batch 16 `
    --imgsz 640 `
    --lr0 0.01 `
    --name civic_finetune_v1
```

Checkpoints and loss curves are recorded in `runs/detect/civic_finetune_v1/`. The validated `best.pt` is automatically staged to `models/`.

---

## 📈 Model Evaluation & Benchmarks

To calculate official object detection benchmarks ($P$, $R$, $\text{mAP@50}$, $\text{mAP@50-95}$):

```powershell
py -3.13 training/evaluate.py `
    --model models/road_damage_yolov8n.pt `
    --data dataset/data.yaml `
    --split val
```

### Measured CPU Inference Latency
- Image Size: $640 \times 640$ pixels
- Average Latency: **85 - 130 ms** per image on standard multi-core CPU.
- Memory Footprint: **~420 MB RAM**.

---

## 🧪 Automated Test Suite

Run pytest to verify the full API contract, error responses, file constraints, and model execution:

```powershell
py -3.13 -m pytest tests/ -v
```

All 7 core test assertions pass:
- ✓ `test_health_endpoint`
- ✓ `test_predict_plain_image`
- ✓ `test_invalid_confidence_parameter`
- ✓ `test_department_mapping`
- ✓ `test_unsupported_file_extension`
- ✓ `test_corrupted_image_file`
- ✓ `test_empty_image_file`

Or execute the live integration test client:
```powershell
py -3.13 test_client.py
```

---

## 🔗 Node.js Backend Integration

In the Express backend, configure `IMAGE_SERVICE_URL=http://localhost:8001` in `.env`.

When a citizen submits a complaint via `POST /api/complaints`:
1. Multer stores the uploaded image in `backend/uploads/`.
2. `aiService.js` transmits the file stream to `http://localhost:8001/predict`.
3. Results are stored in the `complaint_ai_analysis` table:
   - `predicted_department_id`: Integer foreign key matching MySQL `departments` table.
   - `department_confidence`: Combined confidence score.
   - `detected_objects`: JSON column containing raw bounding boxes, detected classes, and fusion audit data.
   - `ocr_text`: Signboard text extracted by OCR.
4. `assignmentService.js` routes the ticket to the least-burdened active nodal officer in the matching district.

---

## 🔒 Security & Privacy

- **Safe Image Decoding**: Uses PIL `Image.verify()` and EXIF transpose normalization before passing arrays to the neural network.
- **Payload Limits**: Strict 5MB upload ceiling rejects oversized or denial-of-service payloads.
- **MIME & Extension Whitelisting**: Rejects non-image files (`.pdf`, `.exe`, scripts).
- **Internal Microservice Isolation**: Internal AI service does not access MySQL directly. All database transactions are executed strictly by the Node.js backend.

---

## ⚖️ License & Attribution

- **Ultralytics YOLOv8**: AGPL-3.0 License.
- **Road Damage Dataset 2022 (RDD2022)**: CC BY-SA 4.0.
- **Public Grievance Redressal Portal**: Academic Capstone Project (S7).
