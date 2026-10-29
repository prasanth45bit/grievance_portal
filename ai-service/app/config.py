import os
from pathlib import Path
from dataclasses import dataclass, field
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent

@dataclass
class Settings:
    app_name: str = "Civic Issue Image Detection API"
    app_version: str = "1.0.0"
    app_description: str = (
        "AI-Based Computer Vision and Object Detection service for identifying "
        "civic infrastructure issues (potholes, road damage, garbage, water leaks) "
        "and recommending administrative redressal departments."
    )
    host: str = field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    port: int = field(default_factory=lambda: int(os.getenv("PORT", "8001")))
    
    # Path to primary YOLO weights
    model_path: str = field(
        default_factory=lambda: os.getenv(
            "MODEL_PATH",
            str(BASE_DIR / "models" / "road_damage_yolov8n.pt")
        )
    )
    
    # Optional secondary model (e.g. specialized garbage detector)
    garbage_model_path: str = field(
        default_factory=lambda: os.getenv(
            "GARBAGE_MODEL_PATH",
            str(BASE_DIR / "models" / "garbage_yolov8n.pt")
        )
    )
    
    # Fallback base YOLOv8 model
    fallback_model_path: str = field(
        default_factory=lambda: os.getenv(
            "FALLBACK_MODEL_PATH",
            str(BASE_DIR / "models" / "yolov8n.pt")
        )
    )
    
    confidence_threshold: float = field(
        default_factory=lambda: float(os.getenv("CONFIDENCE_THRESHOLD", "0.35"))
    )
    iou_threshold: float = field(
        default_factory=lambda: float(os.getenv("IOU_THRESHOLD", "0.45"))
    )
    
    max_image_size_mb: int = field(
        default_factory=lambda: int(os.getenv("MAX_IMAGE_SIZE_MB", "5"))
    )
    allowed_extensions: List[str] = field(
        default_factory=lambda: ["jpg", "jpeg", "png", "webp"]
    )
    
    enable_ocr: bool = field(
        default_factory=lambda: os.getenv("ENABLE_OCR", "true").lower() in ("true", "1", "yes")
    )
    
    cors_origins: List[str] = field(default_factory=lambda: ["*"])

settings = Settings()
