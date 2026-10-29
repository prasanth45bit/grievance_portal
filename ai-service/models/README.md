# Civic Vision Models Directory

This folder stores model weights and checkpoints for the Computer Vision module.

## Available Models & Checkpoints

1. **`road_damage_yolov8n.pt`**:
   - Architecture: Ultralytics YOLOv8 Nano (approx. 6.2 MB)
   - Source: Pretrained on Road Damage Dataset (RDD2022 India/Global subsets).
   - Classes recognized:
     - `Pothole`
     - `alligator crack`
     - `transverse crack`
     - `longitudinal crack`
     - `other corruption`
   - Mapping: Automatically routed to **Roads and Highways** department.

2. **`garbage_yolov8n.pt`** (Optional secondary):
   - Architecture: YOLOv8 Nano (approx. 6.2 MB)
   - Classes recognized: `garbage`, `litter`, `waste`.
   - Mapping: Automatically routed to **Sanitation** department.

3. **`yolov8n.pt`**:
   - Base COCO 80-class model used as fallback and baseline transfer learning anchor.

## Loading and Reproducibility

Weights are loaded by `app/services/detector.py`. If a specific weight file is missing locally, the service automatically downloads verified weights from Hugging Face (`ozair23/yolov8-road-damage-detector`) or initializes standard YOLOv8n base weights.
