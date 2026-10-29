"""
Standalone CLI Prediction Script for Testing Civic Issue YOLO Models
"""
import os
import sys
import argparse
import json
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services.detector import get_detector
from app.services.image_preprocessing import preprocess_image
from app.utils.logging_config import logger

def parse_args():
    parser = argparse.ArgumentParser(description="CLI Predictor for Civic Issue YOLO Models")
    parser.add_argument("image_path", type=str, help="Path to input image")
    parser.add_argument("--conf", type=float, default=0.35, help="Confidence threshold")
    parser.add_argument("--save-txt", action="store_true", help="Save predictions to JSON")
    return parser.parse_args()

def main():
    args = parse_args()
    if not os.path.exists(args.image_path):
        print(f"Error: Image file not found: {args.image_path}")
        sys.exit(1)

    print("=" * 60)
    print(f" RUNNING CLI INFERENCE ON: {args.image_path}")
    print("=" * 60)

    with open(args.image_path, "rb") as f:
        img_bytes = f.read()

    img_np, w, h = preprocess_image(img_bytes)
    detector = get_detector()
    detector.load_model()

    res = detector.predict(img_np, w, h, conf_threshold=args.conf)

    print(f"Status:               {res.status}")
    print(f"Primary Department:   {res.primary_department or 'N/A'}")
    print(f"Primary Confidence:   {res.primary_confidence or 0.0}")
    print(f"Inference Latency:    {res.inference_time_ms} ms")
    if res.ocr_text:
        print(f"Extracted OCR Text:   \"{res.ocr_text}\"")

    print("\nDETECTIONS:")
    if not res.detections:
        print("  (No civic issues detected with sufficient confidence)")
    else:
        for idx, d in enumerate(res.detections, 1):
            bbox = d.bbox
            print(f"  {idx}. Class: {d.class_name:<18} | Conf: {d.confidence:.4f} | Dept: {d.suggested_department}")
            print(f"     BBox: [{bbox.x1}, {bbox.y1}, {bbox.x2}, {bbox.y2}] | Issue: {d.visual_issue}")

    if args.save_txt:
        out_file = Path(args.image_path).with_suffix(".prediction.json")
        with open(out_file, "w") as f:
            f.write(res.model_dump_json(indent=2))
        print(f"\nSaved JSON results to: {out_file}")

if __name__ == "__main__":
    main()
