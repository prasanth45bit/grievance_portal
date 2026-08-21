# Automated Department Assignment Classifier for Public Grievance Portal

A production-ready NLP service designed to automatically classify citizen grievance complaints into the correct government department. Built using Hugging Face Transformers (`distilbert-base-uncased`), PyTorch, FastAPI, and ONNX Runtime.

---

## Features
- **Dynamic Multi-Class Classification**: Automatic category learning and class count detection from dataset labels.
- **ONNX Model Export**: Speed up CPU inference time by up to 5x with automated export to ONNX runtime.
- **FastAPI Web Service**: High-performance REST endpoints for single, batch JSON, and batch CSV predictions.
- **Early Stopping & Checkpoints**: Automatic saving of training checkpoints and early termination when validation loss plateaus.
- **Reproducibility**: Explicit seed alignment for all random processes (PyTorch, NumPy, Python).
- **Unit Tests**: Full mock-based and environment unit test coverage.
- **Docker Support**: Containerized deployment setup using multi-stage builds.

---

## Folder Structure
```
department-classifier/
├── dataset/
│   └── complaints.csv         # Grievance training dataset
├── model/
│   ├── config.json            # Model config metadata
│   ├── model.safetensors      # Fine-tuned PyTorch weights
│   ├── tokenizer_config.json  # Tokenizer configurations
│   ├── tokenizer.json         # Tokenizer vocabulary mapping
│   ├── label_encoder.pkl      # Bidirectional label mappings
│   └── model.onnx             # Model exported to ONNX format
├── app/
│   ├── config.py              # Configuration & Hyperparameters
│   ├── preprocess.py          # Data cleaning & splits
│   ├── train.py               # Model training script
│   ├── evaluate.py            # Evaluation & ONNX export logic
│   ├── predict.py             # Inference pipeline (PyTorch + ONNX)
│   └── api.py                 # FastAPI REST API wrapper
├── tests/
│   ├── test_preprocess.py     # Unit tests for preprocessing
│   ├── test_predict.py        # Unit tests for predictions
│   └── test_api.py            # Unit tests for API endpoints
├── Dockerfile                 # Production Docker build file
├── docker-compose.yml         # Local Docker compose runner
├── requirements.txt           # Main dependency pins
└── README.md                  # System manual and documentation
```

---

## Installation & Setup

### 1. Prerequisites
Ensure you have Python 3.12+ installed.

### 2. Local Environment Setup
Clone or navigate to the workspace, create a virtual environment, and install dependencies:
```bash
# Navigate to project folder
cd department-classifier

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

---

## Dataset Format
The training pipeline requires a CSV dataset containing three columns:
- `complaint`: The plain text grievance description.
- `department_id`: Unique integer assigned to the department.
- `department_name`: Human-readable name of the department.

Example `dataset/complaints.csv`:
```csv
complaint,department_id,department_name
Street light is not working,3,Electricity
Garbage has not been collected for three days,5,Sanitation
Water pipeline is leaking,1,Water Supply
```

---

## Model Training

### 1. Execute Training
To run the full training pipeline with the default parameters (Learning Rate: `2e-5`, Epochs: `5`, Batch Size: `16`, Weight Decay: `0.01`):
```bash
python app/train.py
```
This script will clean the dataset, encode labels dynamically, perform an 80/10/10 stratified split, fine-tune the model, evaluate metrics (Accuracy, F1, Precision, Recall), save the best model weights to `model/`, and export the model to `model/model.onnx`.

### 2. Resume Training
If the training was interrupted, you can resume from the last saved epoch checkpoint:
```bash
python app/train.py --resume
```

### 3. Quick Verification
To run a fast validation check of the training pipeline on a small subset of data (for debugging purposes):
```bash
python app/train.py --quick-test
```

---

## Running the API

Start the FastAPI REST server:
```bash
python app/api.py
```
The server will boot on `http://127.0.0.1:8000`.

### Interactive Documentation
Open your browser and navigate to `http://127.0.0.1:8000/docs` to view the interactive **Swagger UI** for testing endpoints.

---

## API Usage Examples

### 1. Single Complaint Prediction
- **Endpoint**: `POST /predict`
- **Payload**:
```json
{
  "complaint": "There is a huge leak in the water pipe outside my building",
  "use_onnx": true
}
```
- **Response**:
```json
{
  "department_id": 1,
  "department_name": "Water Supply",
  "confidence": 0.9925,
  "is_confident": true,
  "top_departments": [
    {
      "rank": 1,
      "department_id": 1,
      "department_name": "Water Supply",
      "confidence": 0.9925
    },
    {
      "rank": 2,
      "department_id": 5,
      "department_name": "Drainage",
      "confidence": 0.0051
    },
    {
      "rank": 3,
      "department_id": 3,
      "department_name": "Sanitation",
      "confidence": 0.0012
    }
  ]
}
```

### 2. Batch Prediction (JSON)
- **Endpoint**: `POST /predict/batch`
- **Payload**:
```json
{
  "complaints": [
    "The street lamp has been broken for a week",
    "Gravel is spilled all over the road causing skid risks"
  ],
  "use_onnx": false
}
```

---

## Running Tests
Run all unit tests using pytest from the `department-classifier` root folder:
```bash
python -m pytest tests/
```

---

## Production Deployment via Docker

Build and run the service inside a container:
```bash
# Build the image
docker build -t grievance-classifier .

# Run the container
docker run -p 8000:8000 grievance-classifier
```
Alternatively, spin it up using docker-compose:
```bash
docker-compose up --build
```
The application will automatically initialize the prediction engine using the volumes mounted at `/app/model`.
