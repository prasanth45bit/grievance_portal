import os
# Suppress TensorFlow / oneDNN noise
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import sys
import json
import argparse
import pandas as pd
import numpy as np
import torch

# Optimize PyTorch CPU thread count
if not torch.cuda.is_available():
    torch.set_num_threads(os.cpu_count() or 4)

from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding
)

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

def get_dataset_path() -> str:
    """Find the complaints dataset file in current or dataset directory."""
    candidates = [
        "complaints_dataset.csv",
        os.path.join("dataset", "complaints_dataset.csv"),
        os.path.join(os.path.dirname(__file__), "dataset", "complaints_dataset.csv"),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f"Could not find complaints_dataset.csv in candidate paths: {candidates}")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)

    accuracy = accuracy_score(labels, predictions)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels,
        predictions,
        average="weighted",
        zero_division=0
    )

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1
    }

def main():
    parser = argparse.ArgumentParser(description="Train BERT Department Classifier on Complaints Dataset")
    parser.add_argument("--quick-test", action="store_true", help="Run a quick smoke test with 20 samples and 1 epoch")
    args = parser.parse_args()


    CSV_FILE = get_dataset_path()
    MODEL_NAME = "bert-base-uncased"
    OUTPUT_DIR = "./grievance-bert-model"
    MAX_LENGTH = 128
    NUM_EPOCHS = 1 if args.quick_test else 3
    BATCH_SIZE = 4 if args.quick_test else 16
    LEARNING_RATE = 2e-5

    print(f"Loading data from: {CSV_FILE}")
    print(f"Base model: {MODEL_NAME}")
    print(f"Target output directory: {OUTPUT_DIR}")
    print(f"Epochs: {NUM_EPOCHS}, Batch Size: {BATCH_SIZE}, Learning Rate: {LEARNING_RATE}")
    if args.quick_test:
        print("[NOTICE] Running in QUICK-TEST mode for validation.")


    df = pd.read_csv(CSV_FILE)
    print("\nInitial dataset shape:", df.shape)
    print("\nInitial department distribution:")
    print(df["department"].value_counts())


    df = df.dropna(subset=["complaint_text", "department"])
    df["complaint_text"] = df["complaint_text"].astype(str)
    df["department"] = df["department"].astype(str)

    # Remove exact duplicate complaints
    df = df.drop_duplicates(subset=["complaint_text"]).reset_index(drop=True)
    print("\nDataset shape after cleaning:", df.shape)

    if args.quick_test:
        # Take a balanced small subset for dry run
        df = df.groupby("department", group_keys=False).apply(lambda x: x.head(2), include_groups=True).reset_index(drop=True)
        print(f"Quick-test subset shape: {df.shape}")


    departments = sorted(df["department"].unique())
    label2id = {department: i for i, department in enumerate(departments)}
    id2label = {i: department for department, i in label2id.items()}

    print("\nLabel Mapping:")
    for label_id, department in id2label.items():
        print(f"  {label_id} -> {department}")

    # Convert department names to integer labels
    df["label"] = df["department"].map(label2id)

    if args.quick_test:
        train_df = df.iloc[:16]
        val_df = df.iloc[16:20]
        test_df = df.iloc[20:]
        if len(test_df) == 0:
            test_df = val_df
    else:
        # First split: 80% training, 20% temporary
        train_df, temp_df = train_test_split(
            df,
            test_size=0.20,
            random_state=42,
            stratify=df["label"]
        )

        # Split temporary 50/50: 10% validation, 10% test
        val_df, test_df = train_test_split(
            temp_df,
            test_size=0.50,
            random_state=42,
            stratify=temp_df["label"]
        )

    print("\nDataset split sizes:")
    print(f"  Train:      {len(train_df)}")
    print(f"  Validation: {len(val_df)}")
    print(f"  Test:       {len(test_df)}")


    train_dataset = Dataset.from_pandas(
        train_df[["complaint_text", "label"]],
        preserve_index=False
    )
    val_dataset = Dataset.from_pandas(
        val_df[["complaint_text", "label"]],
        preserve_index=False
    )
    test_dataset = Dataset.from_pandas(
        test_df[["complaint_text", "label"]],
        preserve_index=False
    )



    print(f"\nLoading tokenizer for {MODEL_NAME}...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    def tokenize_function(examples):
        return tokenizer(
            examples["complaint_text"],
            truncation=True,
            max_length=MAX_LENGTH
        )

    print("Tokenizing datasets...")
    train_dataset = train_dataset.map(tokenize_function, batched=True)
    val_dataset = val_dataset.map(tokenize_function, batched=True)
    test_dataset = test_dataset.map(tokenize_function, batched=True)


    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)


    print(f"Initializing {MODEL_NAME} with {len(departments)} output classes...")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(departments),
        id2label=id2label,
        label2id=label2id
    )


    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs("./logs", exist_ok=True)

    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=LEARNING_RATE,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        num_train_epochs=NUM_EPOCHS,
        weight_decay=0.01,
        logging_dir="./logs",
        logging_steps=5 if args.quick_test else 100,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        save_total_limit=2,
        dataloader_pin_memory=False,
        report_to="none"
    )


    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        processing_class=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics
    )


    print("\nStarting training...")
    trainer.train()


    print("\nEvaluating on test dataset...")
    test_results = trainer.evaluate(test_dataset)
    print("\nTest Results:")
    for key, value in test_results.items():
        if isinstance(value, float):
            print(f"  {key}: {value:.4f}")
        else:
            print(f"  {key}: {value}")


    print(f"\nSaving model and tokenizer to: {OUTPUT_DIR}")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    label_mapping_file = os.path.join(OUTPUT_DIR, "label_mapping.json")
    with open(label_mapping_file, "w", encoding="utf-8") as f:
        json.dump(
            {
                "label2id": label2id,
                "id2label": id2label
            },
            f,
            indent=4
        )
    print(f"Label mapping saved to: {label_mapping_file}")

    print("\nTraining workflow completed successfully!")

if __name__ == "__main__":
    main()
