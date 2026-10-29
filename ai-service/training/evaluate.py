"""
Model Performance Evaluation Script for Civic Issue YOLO Detector
Computes Precision, Recall, mAP@50, mAP@50-95, Per-Class metrics, and latency.
"""
import os
import sys
import argparse
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.utils.logging_config import logger

def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate YOLO Civic Issue Detection Model")
    parser.add_argument(
        "--model",
        type=str,
        default="models/road_damage_yolov8n.pt",
        help="Path to trained weights file (.pt)"
    )
    parser.add_argument(
        "--data",
        type=str,
        default="dataset/data.yaml",
        help="Path to dataset configuration YAML file"
    )
    parser.add_argument("--imgsz", type=int, default=640, help="Image input dimension")
    parser.add_argument("--batch", type=int, default=16, help="Validation batch size")
    parser.add_argument("--device", type=str, default="", help="Compute device ('cpu', '0')")
    parser.add_argument("--split", type=str, default="val", help="Dataset split ('val' or 'test')")
    return parser.parse_args()

def main():
    args = parse_args()
    logger.info("==================================================")
    logger.info("STARTING CIVIC ISSUE MODEL EVALUATION PIPELINE")
    logger.info("==================================================")
    logger.info("Evaluating Model: %s", args.model)
    logger.info("Dataset Split: %s on %s", args.split, args.data)

    if not os.path.exists(args.model):
        logger.error("Model weights file not found: %s", args.model)
        sys.exit(1)

    try:
        from ultralytics import YOLO
    except ImportError:
        logger.error("ultralytics library is required. Install via: pip install ultralytics")
        sys.exit(1)

    model = YOLO(args.model)

    device = args.device
    if not device:
        import torch
        device = "0" if torch.cuda.is_available() else "cpu"

    logger.info("Running validation on split '%s'...", args.split)
    metrics = model.val(
        data=args.data,
        imgsz=args.imgsz,
        batch=args.batch,
        device=device,
        split=args.split,
        verbose=True
    )

    print("\n" + "=" * 60)
    print(" MODEL PERFORMANCE EVALUATION SUMMARY")
    print("=" * 60)
    print(f"Model:           {Path(args.model).name}")
    print(f"Device:          {device}")
    print(f"Precision (P):   {metrics.box.mp:.4f} ({metrics.box.mp * 100:.2f}%)")
    print(f"Recall (R):      {metrics.box.mr:.4f} ({metrics.box.mr * 100:.2f}%)")
    print(f"mAP@50:          {metrics.box.map50:.4f} ({metrics.box.map50 * 100:.2f}%)")
    print(f"mAP@50-95:       {metrics.box.map:.4f} ({metrics.box.map * 100:.2f}%)")
    print(f"Speed (Pre/Inf): {metrics.speed.get('preprocess', 0):.2f}ms / {metrics.speed.get('inference', 0):.2f}ms")
    print("-" * 60)
    print("PER-CLASS mAP@50 BREAKDOWN:")
    for idx, (cls_name, ap50) in enumerate(zip(metrics.names.values(), metrics.box.ap50)):
        print(f"  [{idx}] {cls_name:<25} : {ap50 * 100:>6.2f}%")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
