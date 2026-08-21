import os
from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Query, status, Depends
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
import uvicorn
import shutil

from app.config import Config, logger
from app.predict import DepartmentClassifier

# Initialize FastAPI App
app = FastAPI(
    title="Public Grievance Department Classifier API",
    description="Production AI service to classify public complaints into relevant government departments.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Global Classifier instance
classifier = None

def get_classifier() -> DepartmentClassifier:
    """Lazy loader for classifier instance to handle missing model errors elegantly."""
    global classifier
    if classifier is None:
        try:
            classifier = DepartmentClassifier()
        except FileNotFoundError as e:
            logger.error(f"Failed to load classifier: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model or label encoder not found. Please train the model first by running `python app/train.py`."
            )
        except Exception as e:
            logger.error(f"Unexpected error loading classifier: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error initializing prediction engine: {str(e)}"
            )
    return classifier

# --- Pydantic Schemas ---
class PredictRequest(BaseModel):
    complaint: str = Field(
        ...,
        examples=["Water is leaking continuously on the road."],
        description="The citizen grievance complaint text."
    )
    use_onnx: bool = Field(
        default=False,
        description="Toggle to run inference using ONNX Runtime instead of PyTorch (ONNX is recommended for production)."
    )
    confidence_threshold: float = Field(
        default=Config.CONFIDENCE_THRESHOLD,
        description="Override default confidence threshold."
    )

class DepartmentInfo(BaseModel):
    rank: int = Field(..., description="Rank in prediction confidence order.")
    department_id: int = Field(..., description="The ID of the department.")
    department_name: str = Field(..., description="The Name of the department.")
    confidence: float = Field(..., description="Confidence score.")

class PredictResponse(BaseModel):
    department_id: int = Field(..., description="Predicted department ID.")
    department_name: str = Field(..., description="Predicted department name.")
    confidence: float = Field(..., description="Prediction confidence score.")
    is_confident: bool = Field(..., description="Flag indicating if confidence meets threshold.")
    top_departments: List[DepartmentInfo] = Field(..., description="Top-3 department predictions with confidence.")

class BatchPredictRequest(BaseModel):
    complaints: List[str] = Field(
        ...,
        examples=[["Water supply is disconnected", "Damaged road in front of market"]],
        description="List of complaints to predict in batch."
    )
    use_onnx: bool = Field(default=False, description="Toggle to use ONNX Runtime.")
    confidence_threshold: float = Field(default=Config.CONFIDENCE_THRESHOLD, description="Override default threshold.")

# --- Endpoints ---
@app.get("/health", status_code=status.HTTP_200_OK, tags=["System Health"])
def health_check(clf: DepartmentClassifier = Depends(get_classifier)) -> Dict[str, Any]:
    """Returns the service health status, model metadata, and available classes."""
    try:
        return {
            "status": "healthy",
            "model_engine": Config.MODEL_NAME,
            "classes_available": list(clf.label_encoder.idx_to_name.values()),
            "device": Config.DEVICE,
            "onnx_model_available": clf.onnx_model_path.exists()
        }
    except HTTPException as e:
        return {
            "status": "degraded",
            "reason": e.detail,
            "onnx_model_available": Path(Config.ONNX_MODEL_PATH).exists()
        }

@app.post(
    "/predict",
    response_model=PredictResponse,
    status_code=status.HTTP_200_OK,
    tags=["Predictions"]
)
def predict_single(payload: PredictRequest, clf: DepartmentClassifier = Depends(get_classifier)) -> Dict[str, Any]:
    """Classifies a single grievance complaint into the target department."""
    # Input validation
    text = payload.complaint.strip()
    if not text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Complaint text cannot be empty or whitespace only."
        )

    try:
        return clf.predict(
            complaint=text,
            use_onnx=payload.use_onnx,
            confidence_threshold=payload.confidence_threshold
        )
    except Exception as e:
        logger.error(f"Inference prediction error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during classification: {str(e)}"
        )

@app.post(
    "/predict/batch",
    response_model=List[PredictResponse],
    status_code=status.HTTP_200_OK,
    tags=["Predictions"]
)
def predict_batch(payload: BatchPredictRequest, clf: DepartmentClassifier = Depends(get_classifier)) -> List[Dict[str, Any]]:
    """Classifies a list of grievance complaints in batch."""
    if not payload.complaints:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Complaints list cannot be empty."
        )

    results = []
    for idx, complaint in enumerate(payload.complaints):
        text = complaint.strip()
        if not text:
            results.append({
                "department_id": -1,
                "department_name": "Invalid Input",
                "confidence": 0.0,
                "is_confident": False,
                "top_departments": []
            })
            continue
        try:
            res = clf.predict(
                complaint=text,
                use_onnx=payload.use_onnx,
                confidence_threshold=payload.confidence_threshold
            )
            results.append(res)
        except Exception as e:
            logger.error(f"Error predicting batch element {idx}: {e}")
            results.append({
                "department_id": -1,
                "department_name": f"Error: {str(e)}",
                "confidence": 0.0,
                "is_confident": False,
                "top_departments": []
            })
            continue
    return results

@app.post(
    "/predict/batch-csv",
    status_code=status.HTTP_200_OK,
    tags=["Predictions"]
)
def predict_batch_csv(
    file: UploadFile = File(..., description="CSV file with a 'complaint' column."),
    use_onnx: bool = Query(default=False, description="Toggle to use ONNX Runtime."),
    clf: DepartmentClassifier = Depends(get_classifier)
) -> FileResponse:
    """Accepts a CSV upload, appends prediction columns, and returns the annotated CSV."""
    if not file.filename.endswith(".csv"):
      raise HTTPException(
          status_code=status.HTTP_400_BAD_REQUEST,
          detail="Invalid file type. Only CSV files are supported."
      )

    # Setup temporary paths inside the workspace
    temp_dir = Config.OUTPUT_MODEL_DIR / "temp"
    temp_dir.mkdir(exist_ok=True)
    
    input_path = temp_dir / f"input_{file.filename}"
    output_path = temp_dir / f"output_{file.filename}"
    
    try:
        # Save uploaded file
        with input_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Run batch prediction
        clf.predict_batch_csv(
            input_csv_path=str(input_path),
            output_csv_path=str(output_path),
            use_onnx=use_onnx
        )
        
        return FileResponse(
            path=str(output_path),
            filename=f"classified_{file.filename}",
            media_type="text/csv"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed CSV batch processing: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch prediction from CSV failed: {str(e)}"
        )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting API service on port {port}...")
    uvicorn.run("app.api:app", host="0.0.0.0", port=port, reload=True)
