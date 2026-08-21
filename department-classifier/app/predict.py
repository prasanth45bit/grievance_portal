import os
from pathlib import Path
from typing import Dict, List, Any, Union
import numpy as np
import pandas as pd
import torch
import torch.nn.functional as F
from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast
import onnxruntime as ort

from app.config import Config, logger
from app.preprocess import DepartmentLabelEncoder

class DepartmentClassifier:
    """Production-grade classifier for predicting grievance departments."""
    def __init__(self, model_dir: Path = Config.OUTPUT_MODEL_DIR):
        self.model_dir = model_dir
        self.label_encoder_path = model_dir / "label_encoder.pkl"
        
        # Paths for weights
        self.pytorch_model_path = model_dir
        self.onnx_model_path = model_dir / "model.onnx"
        
        # Placeholders
        self.label_encoder: DepartmentLabelEncoder = None
        self.tokenizer: DistilBertTokenizerFast = None
        self.model: DistilBertForSequenceClassification = None
        self.onnx_session: ort.InferenceSession = None
        
        self._load_metadata()

    def _load_metadata(self) -> None:
        """Loads label encoder. Tokenizer and models are loaded lazily on-demand."""
        if not self.label_encoder_path.exists():
            raise FileNotFoundError(
                f"Label encoder not found at {self.label_encoder_path}. Please run training first."
            )
        self.label_encoder = DepartmentLabelEncoder.load(str(self.label_encoder_path))

    def _load_pytorch(self) -> None:
        """Loads PyTorch model and tokenizer."""
        if self.model is not None and self.tokenizer is not None:
            return
            
        logger.info("Loading PyTorch model and tokenizer...")
        if not (self.model_dir / "config.json").exists():
            raise FileNotFoundError(
                f"PyTorch model files not found at {self.model_dir}. Please run training first."
            )
            
        self.tokenizer = DistilBertTokenizerFast.from_pretrained(str(self.model_dir))
        self.model = DistilBertForSequenceClassification.from_pretrained(str(self.model_dir))
        self.model.to(Config.DEVICE)
        self.model.eval()
        logger.info(f"PyTorch model loaded successfully on device: {Config.DEVICE}")

    def _load_onnx(self) -> None:
        """Loads ONNX runtime session and tokenizer."""
        if self.onnx_session is not None and self.tokenizer is not None:
            return
            
        logger.info("Loading ONNX model and tokenizer...")
        if not self.onnx_model_path.exists():
            raise FileNotFoundError(
                f"ONNX model not found at {self.onnx_model_path}. Please run training first."
            )
            
        self.tokenizer = DistilBertTokenizerFast.from_pretrained(str(self.model_dir))
        
        # Configure ONNX execution providers
        providers = ["CPUExecutionProvider"]
        if torch.cuda.is_available():
            providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
            
        self.onnx_session = ort.InferenceSession(str(self.onnx_model_path), providers=providers)
        logger.info(f"ONNX model loaded successfully with providers: {providers}")

    def _softmax(self, logits: np.ndarray) -> np.ndarray:
        """Helper to compute softmax probabilities from logits."""
        exp_logits = np.exp(logits - np.max(logits, axis=-1, keepdims=True))
        return exp_logits / np.sum(exp_logits, axis=-1, keepdims=True)

    def predict(
        self,
        complaint: str,
        use_onnx: bool = False,
        confidence_threshold: float = Config.CONFIDENCE_THRESHOLD
    ) -> Dict[str, Any]:
        """Classifies a single complaint and returns predictions, confidence, and top-3 classes."""
        if not complaint or not complaint.strip():
            raise ValueError("Complaint text cannot be empty.")
            
        if use_onnx:
            self._load_onnx()
            # Tokenize for ONNX input
            inputs = self.tokenizer(
                complaint,
                max_length=Config.MAX_LENGTH,
                padding="max_length",
                truncation=True,
                return_tensors="np"
            )
            onnx_inputs = {
                "input_ids": inputs["input_ids"].astype(np.int64),
                "attention_mask": inputs["attention_mask"].astype(np.int64)
            }
            outputs = self.onnx_session.run(None, onnx_inputs)
            logits = outputs[0][0]
            probs = self._softmax(logits)
        else:
            self._load_pytorch()
            # Tokenize for PyTorch input
            inputs = self.tokenizer(
                complaint,
                max_length=Config.MAX_LENGTH,
                padding="max_length",
                truncation=True,
                return_tensors="pt"
            )
            # Move to device
            input_ids = inputs["input_ids"].to(Config.DEVICE)
            attention_mask = inputs["attention_mask"].to(Config.DEVICE)
            
            with torch.no_grad():
                outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
                logits = outputs.logits.cpu().numpy()[0]
                
            probs = self._softmax(logits)

        # Get sorted predictions
        top_indices = np.argsort(probs)[::-1]
        
        # Build top-K list
        top_k_list = []
        for rank, idx in enumerate(top_indices[:Config.TOP_K]):
            dep_id, dep_name = self.label_encoder.inverse_transform(int(idx))
            conf = float(probs[idx])
            top_k_list.append({
                "rank": rank + 1,
                "department_id": dep_id,
                "department_name": dep_name,
                "confidence": round(conf, 4)
            })

        best_idx = int(top_indices[0])
        best_conf = float(probs[best_idx])
        dep_id, dep_name = self.label_encoder.inverse_transform(best_idx)
        
        # Handle confidence thresholding
        is_confident = best_conf >= confidence_threshold
        if not is_confident:
            logger.warning(
                f"Prediction confidence ({best_conf:.4f}) is below threshold ({confidence_threshold:.4f})."
            )
            # Modify name/id to flag unassigned/low-confidence if needed, or simply pass dynamic flag
            
        return {
            "department_id": dep_id,
            "department_name": dep_name,
            "confidence": round(best_conf, 4),
            "is_confident": is_confident,
            "top_departments": top_k_list
        }

    def predict_batch_csv(
        self,
        input_csv_path: str,
        output_csv_path: str,
        use_onnx: bool = False,
        confidence_threshold: float = Config.CONFIDENCE_THRESHOLD
    ) -> None:
        """Classifies a batch of complaints from an input CSV and writes results to an output CSV."""
        logger.info(f"Starting batch prediction for CSV: {input_csv_path}")
        
        try:
            df = pd.read_csv(input_csv_path)
        except Exception as e:
            logger.error(f"Failed to read batch CSV: {e}")
            raise ValueError(f"Could not read CSV file: {e}")
            
        if "complaint" not in df.columns:
            logger.error("Missing required column 'complaint' in input batch CSV.")
            raise ValueError("CSV file must contain a 'complaint' column.")

        pred_ids = []
        pred_names = []
        confidences = []
        is_confident_list = []

        for idx, row in df.iterrows():
            text = str(row["complaint"])
            if not text.strip():
                pred_ids.append(-1)
                pred_names.append("Empty Complaint")
                confidences.append(0.0)
                is_confident_list.append(False)
                continue
                
            try:
                res = self.predict(text, use_onnx=use_onnx, confidence_threshold=confidence_threshold)
                pred_ids.append(res["department_id"])
                pred_names.append(res["department_name"])
                confidences.append(res["confidence"])
                is_confident_list.append(res["is_confident"])
            except Exception as e:
                logger.error(f"Error predicting row {idx}: {e}")
                pred_ids.append(-1)
                pred_names.append("Error")
                confidences.append(0.0)
                is_confident_list.append(False)

        df["predicted_department_id"] = pred_ids
        df["predicted_department_name"] = pred_names
        df["confidence"] = confidences
        df["is_confident"] = is_confident_list

        df.to_csv(output_csv_path, index=False)
        logger.info(f"Batch prediction complete. Saved output to: {output_csv_path}")

# Standalone helper function for quick execution
def predict_department(complaint: str) -> Dict[str, Any]:
    """Helper function to load model and predict a single complaint."""
    classifier = DepartmentClassifier()
    # Check if ONNX model is available, default to ONNX for speed, fallback to PyTorch
    use_onnx = classifier.onnx_model_path.exists()
    return classifier.predict(complaint, use_onnx=use_onnx)
