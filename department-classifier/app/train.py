import argparse
import os
import shutil
from pathlib import Path
from transformers import (
    DistilBertForSequenceClassification,
    DistilBertTokenizerFast,
    Trainer,
    TrainingArguments,
    EarlyStoppingCallback
)
from app.config import Config, logger, set_seed
from app.preprocess import load_and_clean_data, split_dataset, DepartmentLabelEncoder
from app.evaluate import compute_metrics, print_evaluation_report, export_to_onnx
import torch
from torch.utils.data import Dataset

class ComplaintDataset(Dataset):
    """PyTorch Dataset wrapper for Tokenized Text Complaints."""
    def __init__(self, texts, labels, tokenizer, max_len):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        inputs = self.tokenizer(
            text,
            max_length=self.max_len,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )
        item = {
            "input_ids": inputs["input_ids"].squeeze(0),
            "attention_mask": inputs["attention_mask"].squeeze(0)
        }
        if self.labels is not None:
            item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item

def get_latest_checkpoint(checkpoint_dir: Path) -> str | None:
    """Find the latest checkpoint path if it exists."""
    if not checkpoint_dir.exists():
        return None
    checkpoints = [
        str(d) for d in checkpoint_dir.glob("checkpoint-*") if d.is_dir()
    ]
    if not checkpoints:
        return None
    # Sort by modification time to find the newest checkpoint
    checkpoints.sort(key=os.path.getmtime)
    return checkpoints[-1]

def run_training(quick_test: bool = False, resume: bool = False) -> None:
    """Main training loop orchestrator."""
    logger.info("Initializing automated model training pipeline...")
    
    # 1. Set seed for reproducibility
    set_seed(Config.SEED)
    
    # 2. Load dataset
    df = load_and_clean_data(str(Config.CSV_PATH))
    
    # If quick_test, truncate dataset to speed up testing
    if quick_test:
        logger.info("Running in QUICK-TEST mode: truncating dataset & reducing epochs.")
        df = df.head(10)  # Just keep 10 samples
        epochs = 1
        batch_size = 2
    else:
        epochs = Config.EPOCHS
        batch_size = Config.BATCH_SIZE

    # 3. Label encoding
    label_encoder = DepartmentLabelEncoder()
    label_encoder.fit(df)
    
    # Save label encoder immediately
    label_encoder.save(str(Config.LABEL_ENCODER_PATH))
    
    # Transform labels in df
    df["encoded_label"] = label_encoder.transform(df["department_id"].tolist())
    
    # 4. Split dataset
    train_df, val_df, test_df = split_dataset(df, seed=Config.SEED)
    
    # 5. Tokenizer initialization
    logger.info(f"Loading tokenizer: {Config.MODEL_NAME}")
    tokenizer = DistilBertTokenizerFast.from_pretrained(Config.MODEL_NAME)
    
    # Create dataset objects
    train_dataset = ComplaintDataset(
        texts=train_df["complaint"].tolist(),
        labels=train_df["encoded_label"].tolist(),
        tokenizer=tokenizer,
        max_len=Config.MAX_LENGTH
    )
    val_dataset = ComplaintDataset(
        texts=val_df["complaint"].tolist(),
        labels=val_df["encoded_label"].tolist(),
        tokenizer=tokenizer,
        max_len=Config.MAX_LENGTH
    )
    test_dataset = ComplaintDataset(
        texts=test_df["complaint"].tolist(),
        labels=test_df["encoded_label"].tolist(),
        tokenizer=tokenizer,
        max_len=Config.MAX_LENGTH
    )
    
    # 6. Initialize Model
    num_classes = len(label_encoder.idx_to_id)
    id2label = {str(k): v for k, v in label_encoder.idx_to_name.items()}
    label2id = {v: k for k, v in label_encoder.idx_to_name.items()}
    
    logger.info(f"Initializing model {Config.MODEL_NAME} with {num_classes} classes.")
    model = DistilBertForSequenceClassification.from_pretrained(
        Config.MODEL_NAME,
        num_labels=num_classes,
        id2label=id2label,
        label2id=label2id
    )
    
    # 7. Training arguments
    checkpoint_dir = Config.OUTPUT_MODEL_DIR / "checkpoints"
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    
    training_args = TrainingArguments(
        output_dir=str(checkpoint_dir),
        evaluation_strategy="epoch",
        save_strategy="epoch",
        learning_rate=Config.LEARNING_RATE,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        num_train_epochs=epochs,
        weight_decay=Config.WEIGHT_DECAY,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        save_total_limit=2,
        logging_steps=5 if quick_test else 10,
        seed=Config.SEED,
        data_seed=Config.SEED,
        fp16=torch.cuda.is_available(), # Accelerate if using GPU
        report_to="none" # Disable W&B logging
    )
    
    # Callbacks
    callbacks = []
    # Only add early stopping callback if not in quick_test
    if not quick_test:
        callbacks.append(EarlyStoppingCallback(early_stopping_patience=2))
        
    # 8. Trainer initialization
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics,
        callbacks=callbacks
    )
    
    # Check for resuming training
    resume_path = None
    if resume:
        resume_path = get_latest_checkpoint(checkpoint_dir)
        if resume_path:
            logger.info(f"Resuming training from checkpoint: {resume_path}")
        else:
            logger.warning("No checkpoint found to resume. Starting fresh training.")
            
    # 9. Fine-tune
    trainer.train(resume_from_checkpoint=resume_path)
    
    # 10. Save best model and tokenizer
    logger.info(f"Saving best model and tokenizer to {Config.OUTPUT_MODEL_DIR}")
    trainer.save_model(str(Config.OUTPUT_MODEL_DIR))
    tokenizer.save_pretrained(str(Config.OUTPUT_MODEL_DIR))
    
    # Save labels mapping directly in model directory to make it self-contained
    label_encoder.save(str(Config.LABEL_ENCODER_PATH))
    
    # 11. Run evaluation on Test Set
    logger.info("Evaluating on hold-out Test Set...")
    predictions = trainer.predict(test_dataset)
    y_pred = np.argmax(predictions.predictions, axis=1).tolist()
    y_true = test_df["encoded_label"].tolist()
    
    print_evaluation_report(y_true, y_pred, label_encoder)
    
    # 12. ONNX Export
    onnx_path = str(Config.ONNX_MODEL_PATH)
    export_to_onnx(trainer.model, tokenizer, onnx_path)
    
    logger.info("Training pipeline completed successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fine-tune DistilBERT for Department Classification.")
    parser.add_argument("--quick-test", action="store_true", help="Run a fast, truncated training for debugging.")
    parser.add_argument("--resume", action="store_true", help="Resume training from latest checkpoint if available.")
    args = parser.parse_args()
    
    run_training(quick_test=args.quick_test, resume=args.resume)
