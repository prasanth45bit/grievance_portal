import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import time
import json
import logging
from typing import List, Dict, Tuple, Optional
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from app.config import settings
from app.schemas import (
    DepartmentScore,
    PredictionResponse,
    BatchPredictionResponse,
    DepartmentItem
)

logger = logging.getLogger("classifier")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

class DepartmentClassifierEngine:
    """
    Singleton BERT Inference Engine for Public Grievance Classification.
    Provides fast, thread-safe batch and single complaint predictions.
    """
    _instance: Optional["DepartmentClassifierEngine"] = None

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or settings.model_path
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = None
        self.model = None
        self.label2id: Dict[str, int] = {}
        self.id2label: Dict[int, str] = {}
        self.is_loaded = False
        
        # Optimize CPU threads if no GPU
        if self.device.type == "cpu":
            torch.set_num_threads(os.cpu_count() or 4)

    @classmethod
    def get_instance(cls, model_path: Optional[str] = None) -> "DepartmentClassifierEngine":
        if cls._instance is None:
            cls._instance = DepartmentClassifierEngine(model_path)
        return cls._instance

    def load_model(self):
        """Loads model weights, tokenizer, and label mappings into memory."""
        if self.is_loaded:
            logger.info("Model already loaded in memory.")
            return

        logger.info(f"Loading BERT Classifier from: {self.model_path} onto device: {self.device}")
        start_t = time.perf_counter()

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Model directory not found at '{self.model_path}'. "
                f"Please ensure grievance-bert-model exists or configure MODEL_PATH."
            )

        # 1. Load Tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)

        # 2. Load Model
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_path)
        self.model.to(self.device)
        self.model.eval()

        # 3. Load Label Mappings
        label_file = os.path.join(self.model_path, "label_mapping.json")
        if os.path.exists(label_file):
            with open(label_file, "r", encoding="utf-8") as f:
                mapping = json.load(f)
                self.label2id = mapping.get("label2id", {})
                self.id2label = {int(k): v for k, v in mapping.get("id2label", {}).items()}
        else:
            # Fallback to model config
            self.id2label = {int(k): v for k, v in self.model.config.id2label.items()}
            self.label2id = {v: k for k, v in self.id2label.items()}

        self.is_loaded = True
        elapsed = (time.perf_counter() - start_t) * 1000
        logger.info(
            f"Classifier loaded successfully in {elapsed:.1f}ms! "
            f"Configured with {len(self.id2label)} departments."
        )

    def get_departments(self) -> List[DepartmentItem]:
        """Returns all registered department names and their internal IDs."""
        return [
            DepartmentItem(department_id=dept_id, name=dept_name)
            for dept_id, dept_name in sorted(self.id2label.items(), key=lambda x: x[0])
        ]

    def predict_single(self, text: str, top_k: int = 3) -> PredictionResponse:
        """Runs inference on a single complaint text."""
        if not self.is_loaded:
            self.load_model()

        start_time = time.perf_counter()
        clean_text = text.strip()

        inputs = self.tokenizer(
            clean_text,
            truncation=True,
            max_length=settings.max_length,
            return_tensors="pt"
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)[0]

        top_k = min(top_k, len(probs))
        top_probs, top_indices = torch.topk(probs, k=top_k)

        top_predictions: List[DepartmentScore] = []
        for rank, (prob_tensor, idx_tensor) in enumerate(zip(top_probs, top_indices), start=1):
            idx = idx_tensor.item()
            prob = float(prob_tensor.item())
            dept_name = self.id2label.get(idx, f"Department_{idx}")
            top_predictions.append(
                DepartmentScore(
                    rank=rank,
                    department_id=idx,
                    department=dept_name,
                    confidence=round(prob, 4),
                    confidence_pct=round(prob * 100, 2)
                )
            )

        top_prediction = top_predictions[0]
        elapsed_ms = (time.perf_counter() - start_time) * 1000

        return PredictionResponse(
            success=True,
            complaint=clean_text,
            predicted_department=top_prediction.department,
            department_id=top_prediction.department_id,
            confidence=top_prediction.confidence,
            confidence_pct=top_prediction.confidence_pct,
            is_confident=top_prediction.confidence >= settings.confidence_threshold,
            top_predictions=top_predictions,
            inference_time_ms=round(elapsed_ms, 2)
        )

    def predict_batch(self, texts: List[str], top_k: int = 3) -> BatchPredictionResponse:
        """Runs vectorized batch inference on multiple complaints simultaneously."""
        if not self.is_loaded:
            self.load_model()

        start_time = time.perf_counter()
        cleaned_texts = [t.strip() for t in texts]

        inputs = self.tokenizer(
            cleaned_texts,
            padding=True,
            truncation=True,
            max_length=settings.max_length,
            return_tensors="pt"
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)

        predictions: List[PredictionResponse] = []
        effective_k = min(top_k, probs.size(1))

        for idx, (original_text, prob_row) in enumerate(zip(cleaned_texts, probs)):
            item_start = time.perf_counter()
            top_probs, top_indices = torch.topk(prob_row, k=effective_k)

            scores: List[DepartmentScore] = []
            for rank, (p, dept_id_t) in enumerate(zip(top_probs, top_indices), start=1):
                dept_id = dept_id_t.item()
                confidence = float(p.item())
                scores.append(
                    DepartmentScore(
                        rank=rank,
                        department_id=dept_id,
                        department=self.id2label.get(dept_id, f"Department_{dept_id}"),
                        confidence=round(confidence, 4),
                        confidence_pct=round(confidence * 100, 2)
                    )
                )

            item_top = scores[0]
            item_elapsed = (time.perf_counter() - item_start) * 1000

            predictions.append(
                PredictionResponse(
                    success=True,
                    complaint=original_text,
                    predicted_department=item_top.department,
                    department_id=item_top.department_id,
                    confidence=item_top.confidence,
                    confidence_pct=item_top.confidence_pct,
                    is_confident=item_top.confidence >= settings.confidence_threshold,
                    top_predictions=scores,
                    inference_time_ms=round(item_elapsed, 2)
                )
            )

        total_elapsed_ms = (time.perf_counter() - start_time) * 1000

        return BatchPredictionResponse(
            success=True,
            total=len(predictions),
            predictions=predictions,
            total_time_ms=round(total_elapsed_ms, 2)
        )

# Module-level accessor
def get_classifier() -> DepartmentClassifierEngine:
    return DepartmentClassifierEngine.get_instance()
