import os
import json
import numpy as np
import pandas as pd
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    DataCollatorWithPadding
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

MODEL_PATH = "./grievance-bert-model"
CSV_FILE = "dataset/complaints_dataset.csv"

def main():
    print("Loading test dataset...")
    df = pd.read_csv(CSV_FILE).dropna(subset=["complaint_text", "department"])
    df = df.drop_duplicates(subset=["complaint_text"]).reset_index(drop=True)

    with open(f"{MODEL_PATH}/label_mapping.json", "r", encoding="utf-8") as f:
        mapping = json.load(f)
    label2id = mapping["label2id"]
    id2label = {int(k): v for k, v in mapping["id2label"].items()}

    df["label"] = df["department"].map(label2id)

    # Recreate the exact test split (10% stratified)
    _, temp_df = train_test_split(df, test_size=0.20, random_state=42, stratify=df["label"])
    _, test_df = train_test_split(temp_df, test_size=0.50, random_state=42, stratify=temp_df["label"])

    print(f"Test samples count: {len(test_df)}")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    model.eval()

    test_dataset = Dataset.from_pandas(test_df[["complaint_text", "label"]], preserve_index=False)
    test_dataset = test_dataset.map(
        lambda ex: tokenizer(ex["complaint_text"], truncation=True, max_length=128),
        batched=True
    )

    trainer = Trainer(
        model=model,
        data_collator=DataCollatorWithPadding(tokenizer=tokenizer)
    )

    print("Running predictions on test set...")
    raw_preds = trainer.predict(test_dataset)
    y_preds = np.argmax(raw_preds.predictions, axis=1)
    y_true = test_df["label"].values

    acc = accuracy_score(y_true, y_preds)
    p, r, f1, _ = precision_recall_fscore_support(y_true, y_preds, average="weighted", zero_division=0)

    print("\n" + "=" * 50)
    print("TEST SET EVALUATION RESULTS")
    print("=" * 50)
    print(f"Test Accuracy:  {acc * 100:.2f}%")
    print(f"Weighted F1:    {f1:.4f}")
    print(f"Precision:      {p:.4f}")
    print(f"Recall:         {r:.4f}")

    target_names = [id2label[i] for i in range(len(id2label))]
    print("\nClassification Report:")
    print(classification_report(y_true, y_preds, target_names=target_names, digits=4))

if __name__ == "__main__":
    main()
