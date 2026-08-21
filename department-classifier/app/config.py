import logging
import os
import random
from pathlib import Path
import numpy as np
import torch

# Base Directory Setup
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "dataset"
MODEL_DIR = BASE_DIR / "model"

# Ensure directories exist
DATASET_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR.mkdir(parents=True, exist_ok=True)

class Config:
    # Reproducibility
    SEED: int = 42

    # Dataset paths
    CSV_PATH: Path = DATASET_DIR / "complaints.csv"
    
    # Model parameters
    MODEL_NAME: str = "distilbert-base-uncased"
    MAX_LENGTH: int = 128
    
    # Hyperparameters
    LEARNING_RATE: float = 2e-5
    EPOCHS: int = 5
    BATCH_SIZE: int = 16
    WEIGHT_DECAY: float = 0.01
    
    # Savings & Output Paths
    OUTPUT_MODEL_DIR: Path = MODEL_DIR
    LABEL_ENCODER_PATH: Path = MODEL_DIR / "label_encoder.pkl"
    ONNX_MODEL_PATH: Path = MODEL_DIR / "model.onnx"
    
    # Threshold & inference settings
    CONFIDENCE_THRESHOLD: float = 0.40
    TOP_K: int = 3
    
    # Hardware acceleration
    DEVICE: str = "cuda" if torch.cuda.is_available() else "cpu"

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(BASE_DIR / "service.log", encoding="utf-8")
    ]
)
logger = logging.getLogger("DepartmentClassifier")

def set_seed(seed: int = Config.SEED) -> None:
    """Set random seed for reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    logger.info(f"Random seed set to {seed}")
