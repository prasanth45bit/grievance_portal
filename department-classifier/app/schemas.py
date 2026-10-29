from typing import List, Optional
from pydantic import BaseModel, Field

class DepartmentScore(BaseModel):
    rank: int = Field(..., description="Rank of prediction (1 being highest)")
    department_id: int = Field(..., description="Internal integer department ID")
    department: str = Field(..., description="Department name")
    confidence: float = Field(..., description="Probability score between 0.0 and 1.0")
    confidence_pct: float = Field(..., description="Probability as percentage (0 - 100%)")

class PredictionRequest(BaseModel):
    complaint: str = Field(
        ...,
        min_length=3,
        max_length=5000,
        description="Text description of the grievance complaint",
        json_schema_extra={"example": "There are deep potholes on the main road causing severe traffic congestion and accidents."}
    )
    top_k: Optional[int] = Field(
        default=3,
        ge=1,
        le=12,
        description="Number of top department candidates to return"
    )

class PredictionResponse(BaseModel):
    success: bool = True
    complaint: str
    predicted_department: str = Field(..., description="Primary assigned department")
    department_id: int = Field(..., description="Internal integer ID for the predicted department")
    confidence: float = Field(..., description="Confidence score for top department (0.0 to 1.0)")
    confidence_pct: float = Field(..., description="Confidence percentage")
    is_confident: bool = Field(..., description="True if confidence exceeds service threshold")
    top_predictions: List[DepartmentScore] = Field(..., description="Ranked top department probabilities")
    inference_time_ms: float = Field(..., description="Time taken for inference in milliseconds")

class BatchPredictionRequest(BaseModel):
    complaints: List[str] = Field(
        ...,
        min_length=1,
        max_length=100,
        description="List of complaint texts to classify",
        json_schema_extra={
            "example": [
                "Water supply pipeline has burst and clean drinking water is flooded on the street.",
                "Street lights on 4th cross road are not functioning for a week.",
                "Garbage bins are overflowing and not cleared by municipal workers."
            ]
        }
    )
    top_k: Optional[int] = Field(default=3, ge=1, le=12)

class BatchPredictionResponse(BaseModel):
    success: bool = True
    total: int
    predictions: List[PredictionResponse]
    total_time_ms: float

class DepartmentItem(BaseModel):
    department_id: int
    name: str

class DepartmentListResponse(BaseModel):
    total: int
    departments: List[DepartmentItem]

class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    model_loaded: bool
    model_path: str
    device: str
    department_count: int
