# Civic Issue Detection Dataset

This directory contains the dataset configuration and instructions for training and evaluating YOLO models on civic problem imagery.

## Directory Structure

```text
dataset/
├── data.yaml              # YOLO dataset configuration
├── README.md              # Dataset documentation & licensing
├── images/
│   ├── train/             # 70% Training images
│   ├── val/               # 20% Validation images
│   └── test/              # 10% Independent evaluation test images
└── labels/
    ├── train/             # YOLO format normalized bounding boxes
    ├── val/
    └── test/
```

## Bounding Box Label Format (YOLO standard)

Each `.txt` label file corresponding to an image contains rows of:
```text
<class_id> <x_center> <y_center> <width> <height>
```
Where coordinates are normalized between `0.0` and `1.0`.

## Supported Visual Classes & Taxonomy

| Class ID | Class Name | Visual Anomaly | Department Target |
|:---|:---|:---|:---|
| `0` | `pothole` | Visible crater or pothole in asphalt road | Roads and Highways |
| `1` | `damaged_road` | Visible surface cracking, erosion, or depression | Roads and Highways |
| `2` | `garbage` | Dumped roadside solid waste or debris | Sanitation |
| `3` | `overflowing_garbage`| Municipal bin filled beyond capacity | Sanitation |
| `4` | `water_leakage` | Water bubbling or leaking from distribution line | Water Supply |
| `5` | `sewage_overflow` | Wastewater overflowing from drain or sewer | Drainage and Sewerage |
| `6` | `open_manhole` | Uncovered, broken, or missing manhole cover | Drainage and Sewerage |
| `7` | `damaged_electric_pole` | Tilted, cracked, or fallen utility pole | Electricity |
| `8` | `damaged_power_line` | Snapped or low-hanging electrical power cable | Electricity |
| `9` | `damaged_streetlight` | Broken street light casing, post, or bulb | Street Lighting |
| `10`| `stray_animal` | Stray cattle, dog pack blocking public way | Animal Control |
| `11`| `damaged_park_equipment`| Broken public playground swing, slide, or bench | Parks and Recreation |

## Recommended Open Source Datasets

1. **Road Damage Dataset (RDD2022)**:
   - Sourced from Crowdsensing Road Damage Detection Challenge.
   - Contains 47,000+ images from India, Japan, Czech Republic, and China.
   - License: CC BY-SA 4.0.
2. **TACO (Trash Annotations in Context)**:
   - Open image dataset of litter in context.
   - License: CC BY 4.0.
3. **Roboflow Universe Civic Collections**:
   - Pothole and road cracks subsets (YOLO format).
