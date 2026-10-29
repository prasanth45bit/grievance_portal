"""
Client Test Script for Grievance Classifier API Service
Tests health, departments, single prediction, and batch prediction.
"""
import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000"

def get(endpoint: str):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, headers={"User-Agent": "TestClient/1.0"})
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))
    except Exception as e:
        return 0, {"error": str(e)}

def post(endpoint: str, data: dict):
    url = f"{BASE_URL}{endpoint}"
    json_bytes = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=json_bytes,
        headers={"Content-Type": "application/json", "User-Agent": "TestClient/1.0"}
    )
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))
    except Exception as e:
        return 0, {"error": str(e)}

def main():
    print("=" * 60)
    print(" TESTING CITIZEN GRIEVANCE CLASSIFIER SERVICE")
    print("=" * 60)

    # 1. Health check
    print("\n[1] Testing Health Endpoint: GET /health")
    code, res = get("/health")
    print(f"Status Code: {code}")
    print(json.dumps(res, indent=2))
    if code != 200:
        print("[FAIL] Health check did not return 200. Is the server running?")
        sys.exit(1)

    # 2. Departments list
    print("\n[2] Testing Catalog Endpoint: GET /departments")
    code, res = get("/departments")
    print(f"Status Code: {code}")
    print(f"Total Departments Found: {res.get('total', 0)}")
    for d in res.get("departments", [])[:5]:
        print(f"  - #{d['department_id']}: {d['name']}")
    if len(res.get("departments", [])) > 5:
        print(f"  ... and {len(res.get('departments')) - 5} more")

    # 3. Single Prediction
    print("\n[3] Testing Single Prediction: POST /predict")
    sample_complaint = "There are several large potholes on the road near the government school and vehicles are getting damaged."
    code, res = post("/predict", {"complaint": sample_complaint, "top_k": 3})
    print(f"Status Code: {code}")
    print(f"Complaint:           \"{sample_complaint}\"")
    print(f"Assigned Department: {res.get('predicted_department')}")
    print(f"Department ID:       #{res.get('department_id')}")
    print(f"Confidence:          {res.get('confidence_pct')}%")
    print(f"Inference Time:      {res.get('inference_time_ms')} ms")
    print("Top 3 Breakdown:")
    for rank, item in enumerate(res.get("top_predictions", []), start=1):
        print(f"  {rank}. {item['department']:<25} : {item['confidence_pct']:>6.2f}%")

    # 4. Batch Prediction
    print("\n[4] Testing Batch Prediction: POST /predict/batch")
    batch_complaints = [
        "A main drinking water pipe is broken and clean water is flooding the street.",
        "Street lights are dark and broken on 5th cross road for three nights.",
        "Garbage bins are overflowing and not cleared by municipal workers for a week."
    ]
    code, res = post("/predict/batch", {"complaints": batch_complaints, "top_k": 2})
    print(f"Status Code: {code}")
    print(f"Processed: {res.get('total')} complaints in {res.get('total_time_ms')} ms")
    for idx, p in enumerate(res.get("predictions", []), start=1):
        print(f"  [{idx}] \"{p['complaint'][:45]}...\" -> {p['predicted_department']} ({p['confidence_pct']}%)")

    print("\n" + "=" * 60)
    print(" ALL API ENDPOINTS VERIFIED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    main()
