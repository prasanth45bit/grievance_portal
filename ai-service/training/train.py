"""
Reproducible YOLO Training and Fine-Tuning Pipeline for Civic Issue Detection
"""
import os
import sys
import argparse
import yaml
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.utils.logging_config import logger

def parse_args():
    parser = argparse.ArgumentParser(description="Train / Fine-Tune YOLO for Civic Issue Detection")
    parser.add_argument(
        "--data",
        type=str,
        default="dataset/data.yaml",
        help="Path to dataset configuration YAML file"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="models/yolov8n.pt",
        help="Initial model weights (e.g. yolov8n.pt or custom checkpoint)"
    )
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size (reduce to 8 or 4 for CPU / low memory)")
    parser.add_argument("--imgsz", type=int, default=640, help="Image input dimension (e.g. 640)")
    parser.add_argument("--device", type=str, default="", help="Device: '0' for GPU, 'cpu' for CPU (default: auto)")
    parser.add_argument("--lr0", type=float, default=0.01, help="Initial learning rate")
    parser.add_argument("--patience", type=int, default=15, help="Early stopping patience")
    parser.add_argument("--project", type=str, default="runs/detect", help="Project save directory")
    parser.add_argument("--name", type=str, default="civic_issue_model", help="Experiment run name")
    parser.add_argument("--seed", type=int, default=42, help="Reproducible random seed")
    return parser.parse_args()

def verify_dataset_yaml(data_path: str):
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset config file not found: {data_path}")
    with open(data_path, "r") as f:
        config = yaml.safe_load(f)
    if "nc" not in config or "names" not in config:
        raise ValueError("Invalid dataset yaml: 'nc' and 'names' keys are required.")
    logger.info("Dataset verified: %d classes -> %s", config["nc"], config["names"])
    return config

def main():
    args = parse_args()
    logger.info("==================================================")
    logger.info("STARTING CIVIC ISSUE YOLO TRAINING PIPELINE")
    logger.info("==================================================")
    logger.info("Base weights: %s", args.model)
    logger.info("Dataset config: %s", args.data)
    logger.info("Epochs: %d | Batch: %d | ImgSz: %d", args.epochs, args.batch, args.imgsz)

    try:
        from ultralytics import YOLO
    except ImportError:
        logger.error("ultralytics library is required. Install via: pip install ultralytics")
        sys.exit(1)

    # 1. Verify Dataset
    data_config = verify_dataset_yaml(args.data)

    # 2. Select compute device
    device = args.device
    if not device:
        import torch
        device = "0" if torch.cuda.is_available() else "cpu"
    logger.info("Using compute device: %s", device)

    # 3. Load base model
    logger.info("Loading base model: %s", args.model)
    model = YOLO(args.model)

    # 4. Train model
    logger.info("Commencing fine-tuning...")
    results = model.train(
        data=args.data,
        epochs=args.epochs,
        batch=args.batch,
        imgsz=args.imgsz,
        device=device,
        lr0=args.lr0,
        patience=args.patience,
        project=args.project,
        name=args.name,
        seed=args.seed,
        save=True,
        verbose=True
    )

    # 5. Locate best weights
    best_weights = Path(args.project) / args.name / "weights" / "best.pt"
    if best_weights.exists():
        logger.info("Training completed! Best weights saved to: %s", best_weights.resolve())
        # Copy to models/ directory
        dest_model = Path("models") / "grievance_model_best.pt"
        dest_model.parent.mkdir(parents=True, exist_ok=True)
        import shutil
        shutil.copyfile(best_weights, dest_model)
        logger.info("Copied validated weights to: %s", dest_model.resolve())
    else:
        logger.warning("Training finished but best.pt not found at expected location.")

if __name__ == "__main__":
    main()
