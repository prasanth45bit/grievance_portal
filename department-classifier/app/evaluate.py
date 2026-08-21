import numpy as np
import torch
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix
from transformers import PreTrainedModel, PreTrainedTokenizer
from app.config import Config, logger
from app.preprocess import DepartmentLabelEncoder

def compute_metrics(eval_pred) -> dict:
    """Computes evaluation metrics (accuracy, f1, precision, recall) for Trainer."""
    predictions, labels = eval_pred
    preds = np.argmax(predictions, axis=1)
    
    # Calculate metrics
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average="weighted", zero_division=0
    )
    acc = accuracy_score(labels, preds)
    
    return {
        "accuracy": acc,
        "f1": f1,
        "precision": precision,
        "recall": recall
    }

def print_evaluation_report(y_true: list, y_pred: list, label_encoder: DepartmentLabelEncoder) -> None:
    """Prints a detailed classification report and confusion matrix."""
    # Build unique labels and target names matching the indices present in the dataset
    unique_labels = sorted(list(set(y_true + y_pred)))
    target_names = [label_encoder.idx_to_name.get(lbl, f"Class {lbl}") for lbl in unique_labels]

    logger.info("=== EVALUATION REPORT ===")
    
    acc = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average="weighted", zero_division=0
    )
    
    logger.info(f"Accuracy:  {acc:.4f}")
    logger.info(f"Precision: {precision:.4f}")
    logger.info(f"Recall:    {recall:.4f}")
    logger.info(f"F1 Score:  {f1:.4f}")
    
    logger.info("\nClassification Report:")
    report = classification_report(
        y_true, y_pred, labels=unique_labels, target_names=target_names, zero_division=0
    )
    print(report)
    
    logger.info("\nConfusion Matrix:")
    matrix = confusion_matrix(y_true, y_pred, labels=unique_labels)
    print(matrix)

def export_to_onnx(model: PreTrainedModel, tokenizer: PreTrainedTokenizer, output_path: str) -> None:
    """Exports a fine-tuned PyTorch model to ONNX format."""
    logger.info(f"Exporting model to ONNX format at {output_path}...")
    try:
        model.eval()
        model.to("cpu")
        
        # Create dummy input
        dummy_text = "This is a test complaint for ONNX export validation."
        inputs = tokenizer(
            dummy_text,
            max_length=Config.MAX_LENGTH,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )
        
        # Export inputs
        input_names = ["input_ids", "attention_mask"]
        output_names = ["logits"]
        
        # Define dynamic axes for batch size and sequence length
        dynamic_axes = {
            "input_ids": {0: "batch_size", 1: "sequence_length"},
            "attention_mask": {0: "batch_size", 1: "sequence_length"},
            "logits": {0: "batch_size"}
        }
        
        torch.onnx.export(
            model,
            args=(inputs["input_ids"], inputs["attention_mask"]),
            f=output_path,
            input_names=input_names,
            output_names=output_names,
            dynamic_axes=dynamic_axes,
            opset_version=14
        )
        logger.info("Model exported to ONNX successfully.")
    except Exception as e:
        logger.error(f"Failed to export model to ONNX: {e}", exc_info=True)
