from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x1: float = Field(..., description="Top-left X coordinate")
    y1: float = Field(..., description="Top-left Y coordinate")
    x2: float = Field(..., description="Bottom-right X coordinate")
    y2: float = Field(..., description="Bottom-right Y coordinate")

class DetectionItem(BaseModel):
    class_name: str = Field(..., description="Detected visual civic issue class")
    class_id: int = Field(..., description="Model class integer ID")
    confidence: float = Field(..., description="Model confidence score between 0.0 and 1.0")
    bbox: BoundingBox = Field(..., description="Bounding box pixel coordinates")
    suggested_department: str = Field(..., description="Recommended government department")
    visual_issue: Optional[str] = Field(None, description="Human-readable description of visual problem")

class ModelInfo(BaseModel):
    name: str = Field(..., description="Model architecture or checkpoint name")
    version: str = Field(..., description="Model version tag")
    device: str = Field(..., description="Compute hardware (cpu, cuda)")

class ImageInfo(BaseModel):
    width: int
    height: int
    format: str

class PredictionResponse(BaseModel):
    success: bool = True
    model: ModelInfo
    image: ImageInfo
    detections: List[DetectionItem] = Field(default_factory=list)
    status: str = Field(..., description="'completed', 'no_reliable_detection', or 'failed'")
    primary_department: Optional[str] = Field(None, description="Top recommended department based on highest detection")
    primary_confidence: Optional[float] = Field(None, description="Confidence of primary detected issue")
    ocr_text: Optional[str] = Field(None, description="Text extracted from image signboards or notices via OCR")
    message: Optional[str] = Field(None, description="Status notes or explanation")
    inference_time_ms: float = Field(..., description="Total processing latency in milliseconds")

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str
    device: str
    supported_classes: List[str]
    department_mapping_count: int
