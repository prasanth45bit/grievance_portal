import os
from pathlib import Path
from dataclasses import dataclass, field

BASE_DIR = Path(__file__).resolve().parent.parent

def find_model_path() -> str:
    """Detects available trained model directory."""
    candidates = [
        os.getenv("MODEL_PATH", ""),
        str(BASE_DIR / "grievance-bert-model"),
        str(BASE_DIR / "model"),
        "./grievance-bert-model",
        "./model",
        "/app/grievance-bert-model",
        "/app/model"
    ]
    for c in candidates:
        if c and os.path.exists(c) and (
            os.path.exists(os.path.join(c, "config.json")) or 
            os.path.exists(os.path.join(c, "model.safetensors"))
        ):
            return str(Path(c).resolve())
    return str((BASE_DIR / "grievance-bert-model").resolve())

@dataclass
class Settings:
    app_name: str = "Citizen Grievance Department Classifier API"
    app_version: str = "1.0.0"
    app_description: str = (
        "Production REST API for automatically categorizing citizen grievance "
        "complaints into administrative departments using fine-tuned BERT."
    )
    host: str = field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    port: int = field(default_factory=lambda: int(os.getenv("PORT", "8000")))
    model_path: str = field(default_factory=find_model_path)
    max_length: int = field(default_factory=lambda: int(os.getenv("MAX_LENGTH", "128")))
    confidence_threshold: float = field(default_factory=lambda: float(os.getenv("CONFIDENCE_THRESHOLD", "0.60")))
    default_top_k: int = field(default_factory=lambda: int(os.getenv("DEFAULT_TOP_K", "3")))
    cors_origins: list[str] = field(default_factory=lambda: ["*"])

settings = Settings()
