import os
import time
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import torch

from app.config import settings, BASE_DIR
from app.utils.logging_config import logger
from app.schemas.prediction import (
    BoundingBox,
    DetectionItem,
    ModelInfo,
    ImageInfo,
    PredictionResponse
)
from app.services.department_mapping import map_issue_to_department
from app.services.ocr_service import ocr_service

class CivicIssueDetector:
    _instance = None

    def __init__(self):
        self.primary_model = None
        self.garbage_model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.is_loaded = False
        self.model_name = "YOLOv8-Civic"
        self.model_version = "1.0.0"
        self.supported_classes: List[str] = []

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _ensure_model_file(self) -> str:
        """
        Locates or downloads validated civic detection weights.
        1. Checks settings.model_path
        2. Checks local models/ directory
        3. Downloads pretrained road damage & pothole weights from Hugging Face if needed
        4. Falls back to base ultralytics yolov8n.pt
        """
        models_dir = BASE_DIR / "models"
        models_dir.mkdir(parents=True, exist_ok=True)

        # 1. Configured path
        if settings.model_path and os.path.exists(settings.model_path):
            logger.info("Using configured model at: %s", settings.model_path)
            return settings.model_path

        local_road_damage = str(models_dir / "road_damage_yolov8n.pt")
        if os.path.exists(local_road_damage):
            logger.info("Found local road damage model at: %s", local_road_damage)
            return local_road_damage

        # 2. Attempt download of verified Hugging Face road damage weights (ozair23/yolov8-road-damage-detector)
        try:
            from huggingface_hub import hf_hub_download
            logger.info("Downloading pretrained road damage weights (ozair23/yolov8-road-damage-detector)...")
            downloaded_path = hf_hub_download(
                repo_id="ozair23/yolov8-road-damage-detector",
                filename="best.pt",
                local_dir=str(models_dir)
            )
            # Rename or alias
            target_path = models_dir / "road_damage_yolov8n.pt"
            if os.path.exists(downloaded_path) and not target_path.exists():
                import shutil
                shutil.copyfile(downloaded_path, target_path)
            logger.info("Road damage model successfully downloaded to: %s", target_path)
            return str(target_path)
        except Exception as e:
            logger.warning("Could not download HuggingFace road damage weights: %s. Using fallback base YOLOv8.", e)

        # 3. Fallback to yolov8n.pt
        fallback_path = str(models_dir / "yolov8n.pt")
        return fallback_path

    def load_model(self):
        """Loads YOLO models into memory."""
        try:
            from ultralytics import YOLO

            weight_path = self._ensure_model_file()
            logger.info("Loading YOLO detection model from %s on device: %s", weight_path, self.device)
            self.primary_model = YOLO(weight_path)
            
            # Extract supported classes
            if hasattr(self.primary_model, "names") and self.primary_model.names:
                self.supported_classes = list(self.primary_model.names.values())
            
            # Optionally attempt to load garbage model
            garbage_weights = BASE_DIR / "models" / "garbage_yolov8n.pt"
            if garbage_weights.exists():
                try:
                    self.garbage_model = YOLO(str(garbage_weights))
                    logger.info("Secondary garbage model loaded successfully.")
                except Exception as ge:
                    logger.warning("Could not load secondary garbage model: %s", ge)

            self.is_loaded = True
            self.model_name = Path(weight_path).stem
            logger.info("CivicIssueDetector successfully initialized with %d classes.", len(self.supported_classes))
        except Exception as e:
            logger.error("Failed to load YOLO model: %s", str(e), exc_info=True)
            self.is_loaded = False
            raise RuntimeError(f"Detector initialization failed: {str(e)}")

    def predict(
        self,
        image_np: np.ndarray,
        orig_width: int,
        orig_height: int,
        conf_threshold: Optional[float] = None
    ) -> PredictionResponse:
        """
        Runs object detection and optional OCR.
        Returns a complete, validated PredictionResponse.
        """
        if not self.is_loaded or self.primary_model is None:
            self.load_model()

        threshold = conf_threshold if conf_threshold is not None else settings.confidence_threshold
        start_time = time.perf_counter()

        detections: List[DetectionItem] = []

        try:
            # 1. Primary Model Inference
            results = self.primary_model(
                image_np,
                conf=threshold,
                iou=settings.iou_threshold,
                device=self.device,
                verbose=False
            )

            if results and len(results) > 0:
                result = results[0]
                boxes = result.boxes

                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    cls_name = self.primary_model.names.get(cls_id, f"class_{cls_id}")
                    conf = float(box.conf[0].item())
                    xyxy = box.xyxy[0].tolist()

                    dept, issue_desc = map_issue_to_department(cls_name)

                    detections.append(
                        DetectionItem(
                            class_name=cls_name,
                            class_id=cls_id,
                            confidence=round(conf, 4),
                            bbox=BoundingBox(
                                x1=round(xyxy[0], 1),
                                y1=round(xyxy[1], 1),
                                x2=round(xyxy[2], 1),
                                y2=round(xyxy[3], 1)
                            ),
                            suggested_department=dept,
                            visual_issue=issue_desc
                        )
                    )

            # 2. Secondary Garbage Model Inference (if loaded)
            if self.garbage_model is not None:
                g_results = self.garbage_model(
                    image_np,
                    conf=threshold,
                    iou=settings.iou_threshold,
                    device=self.device,
                    verbose=False
                )
                if g_results and len(g_results) > 0:
                    for box in g_results[0].boxes:
                        cls_id = int(box.cls[0].item())
                        cls_name = self.garbage_model.names.get(cls_id, "garbage")
                        conf = float(box.conf[0].item())
                        xyxy = box.xyxy[0].tolist()
                        dept, issue_desc = map_issue_to_department(cls_name)
                        detections.append(
                            DetectionItem(
                                class_name=cls_name,
                                class_id=cls_id,
                                confidence=round(conf, 4),
                                bbox=BoundingBox(
                                    x1=round(xyxy[0], 1),
                                    y1=round(xyxy[1], 1),
                                    x2=round(xyxy[2], 1),
                                    y2=round(xyxy[3], 1)
                                ),
                                suggested_department=dept,
                                visual_issue=issue_desc
                            )
                        )

            # 3. Optional OCR Extraction
            extracted_ocr = ""
            if settings.enable_ocr:
                extracted_ocr = ocr_service.extract_text(image_np)

            # Sort detections by confidence descending
            detections.sort(key=lambda d: d.confidence, reverse=True)

            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

            if len(detections) > 0:
                top_det = detections[0]
                status_str = "completed"
                message_str = f"Detected {len(detections)} civic visual issue(s)."
                primary_dept = top_det.suggested_department
                primary_conf = top_det.confidence
            else:
                status_str = "no_reliable_detection"
                message_str = "No supported civic issue was detected with sufficient confidence."
                primary_dept = None
                primary_conf = None

            return PredictionResponse(
                success=True,
                model=ModelInfo(
                    name=self.model_name,
                    version=self.model_version,
                    device=self.device
                ),
                image=ImageInfo(
                    width=orig_width,
                    height=orig_height,
                    format="RGB"
                ),
                detections=detections,
                status=status_str,
                primary_department=primary_dept,
                primary_confidence=primary_conf,
                ocr_text=extracted_ocr if extracted_ocr else None,
                message=message_str,
                inference_time_ms=latency_ms
            )

        except Exception as e:
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error("Inference failure during image detection: %s", str(e), exc_info=True)
            return PredictionResponse(
                success=False,
                model=ModelInfo(
                    name=self.model_name,
                    version=self.model_version,
                    device=self.device
                ),
                image=ImageInfo(
                    width=orig_width,
                    height=orig_height,
                    format="RGB"
                ),
                detections=[],
                status="failed",
                primary_department=None,
                primary_confidence=None,
                ocr_text=None,
                message=f"Image inference error: {str(e)}",
                inference_time_ms=latency_ms
            )

def get_detector() -> CivicIssueDetector:
    return CivicIssueDetector.get_instance()
