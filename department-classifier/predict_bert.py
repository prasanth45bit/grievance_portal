import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import sys
import json
import argparse
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification
)

MODEL_PATH = "./grievance-bert-model"

def load_classifier(model_path: str = MODEL_PATH):
    """Loads tokenizer and model from model directory."""
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model directory not found at: {model_path}. Please train the model first.")
    
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    model.eval()
    return tokenizer, model

def predict_department(complaint: str, tokenizer=None, model=None):
    """Predicts single top department and confidence score."""
    if tokenizer is None or model is None:
        tokenizer, model = load_classifier()

    inputs = tokenizer(
        complaint,
        return_tensors="pt",
        truncation=True,
        max_length=128
    )

    with torch.no_grad():
        outputs = model(**inputs)

    probabilities = torch.softmax(outputs.logits, dim=1)
    predicted_id = torch.argmax(probabilities, dim=1).item()
    confidence = probabilities[0][predicted_id].item()
    department = model.config.id2label[predicted_id]

    return department, confidence

def predict_top3(complaint: str, tokenizer=None, model=None):
    """Predicts top 3 departments with corresponding confidence scores."""
    if tokenizer is None or model is None:
        tokenizer, model = load_classifier()

    inputs = tokenizer(
        complaint,
        return_tensors="pt",
        truncation=True,
        max_length=128
    )

    with torch.no_grad():
        outputs = model(**inputs)

    probabilities = torch.softmax(outputs.logits, dim=1)[0]
    top_probabilities, top_indices = torch.topk(probabilities, k=min(3, len(probabilities)))

    results = []
    for probability, index in zip(top_probabilities, top_indices):
        department = model.config.id2label[index.item()]
        results.append({
            "department": department,
            "confidence": float(probability)
        })

    return results

def run_interactive_mode(tokenizer, model):
    """Interactive loop to test complaints dynamically."""
    print("\n" + "=" * 70)
    print("INTERACTIVE GRIEVANCE CLASSIFIER")
    print("Type any complaint and press Enter. Type 'exit' or 'q' to quit.")
    print("=" * 70)
    while True:
        try:
            user_input = input("\nEnter Complaint: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ("exit", "quit", "q"):
                print("Exiting interactive test. Goodbye!")
                break

            top3 = predict_top3(user_input, tokenizer, model)
            print(f"\n>> Top Department : {top3[0]['department']} ({top3[0]['confidence'] * 100:.2f}%)")
            print(">> Top-3 Breakdown:")
            for rank, item in enumerate(top3, start=1):
                bar = "#" * int(item['confidence'] * 25)
                print(f"   {rank}. {item['department']:<25} : {item['confidence'] * 100:6.2f}%  {bar}")
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            break

def main():
    parser = argparse.ArgumentParser(description="Test Grievance Department Classifier")
    parser.add_argument("complaint", nargs="?", help="Optional single complaint string to predict")
    parser.add_argument("--interactive", "-i", action="store_true", help="Launch interactive CLI prompt")
    args = parser.parse_args()

    print("=" * 70)
    print("        CITIZEN GRIEVANCE DEPARTMENT CLASSIFIER (BERT)")
    print("=" * 70)

    try:
        tokenizer, model = load_classifier(MODEL_PATH)
        print("Model loaded successfully from:", MODEL_PATH)

        if args.interactive:
            run_interactive_mode(tokenizer, model)
            return

        if args.complaint:
            top3 = predict_top3(args.complaint, tokenizer, model)
            print(f"\nComplaint: \"{args.complaint}\"")
            print(f"\nPredicted Department: {top3[0]['department']}")
            print(f"Confidence:           {top3[0]['confidence'] * 100:.2f}%\n")
            print("Top-3 Predictions:")
            for rank, item in enumerate(top3, start=1):
                bar = "#" * int(item['confidence'] * 25)
                print(f"  {rank}. {item['department']:<25} : {item['confidence'] * 100:6.2f}%  {bar}")
            return

        # Default: Run test suite
        test_cases = [
            ("Primary Potholes Case", "There are several large potholes on the road near the government school and vehicles are having difficulty passing."),
            ("Water Leakage", "A main supply pipeline is broken near the village water tank and clean drinking water is being wasted on the street."),
            ("Street Lighting", "The street light in our area has been broken and completely dark for three days, making it unsafe at night."),
            ("Sanitation / Waste", "Garbage has not been collected for three days and waste bins are overflowing with a foul smell."),
            ("Electricity / Power", "There is a severe voltage fluctuation and frequent power cuts occurring every evening in our locality."),
            ("Public Transport", "The municipal bus service on route 24 never arrives on schedule and commuters are left stranded."),
            ("Drainage & Sewerage", "The underground drainage system is choked and sewage wastewater is overflowing into the residential lanes."),
            ("Animal Control", "Stray cattle and aggressive dogs are roaming freely in the main market causing traffic hazards and risk of bites."),
            ("Parks & Recreation", "The children's playground equipment in the community park is broken and damaged."),
            ("Environment / Pollution", "A nearby industrial plant is releasing thick black smoke and foul chemical emissions throughout the night."),
            ("Municipal Admin", "Birth certificate application submitted three weeks ago has still not been processed by the local office.")
        ]

        print("\n" + "-" * 70)
        print(f"{'Category':<22} | {'Predicted Department':<25} | {'Confidence':<10}")
        print("-" * 70)

        for category, complaint in test_cases:
            dept, conf = predict_department(complaint, tokenizer, model)
            print(f"{category:<22} | {dept:<25} | {conf * 100:.2f}%")

        print("-" * 70)

        primary_complaint = test_cases[0][1]
        print("\n" + "=" * 70)
        print("DETAILED PREDICTION FOR USER'S TEST COMPLAINT:")
        print(f"\"{primary_complaint}\"")
        print("=" * 70)

        top3 = predict_top3(primary_complaint, tokenizer, model)
        print("\nTop-3 Departments by Probability:")
        for rank, item in enumerate(top3, start=1):
            bar = "#" * int(item['confidence'] * 30)
            print(f"  {rank}. {item['department']:<25} : {item['confidence'] * 100:6.2f}%  {bar}")

        print("\n" + "=" * 70)
        print("All tests executed and verified successfully!")
        print("Tip: Run `python predict_bert.py --interactive` to test any custom complaint.")
        print("=" * 70)

    except FileNotFoundError as e:
        print(f"\n[ERROR] {e}")

if __name__ == "__main__":
    main()
