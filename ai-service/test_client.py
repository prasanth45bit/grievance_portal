"""
End-to-End Client Test Script for Civic Issue Detection Service
Tests:
1. GET /health
2. POST /predict with a synthetic road sample image
"""
import io
import sys
import json
import urllib.request
import urllib.error
from PIL import Image

BASE_URL = "http://localhost:8001"

def create_sample_image_bytes():
    img = Image.new("RGB", (640, 480), color=(110, 110, 110))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_health():
    url = f"{BASE_URL}/health"
    print(f"\n[1] Testing Health Endpoint: GET {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "CivicVisionTest/1.0"})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode("utf-8"))
            print(f"Status: {response.status}")
            print(json.dumps(data, indent=2))
            assert response.status == 200
            assert data["status"] in ("healthy", "initializing")
            return True
    except Exception as e:
        print(f"[FAIL] Health check failed: {e}")
        return False

def test_predict():
    url = f"{BASE_URL}/predict"
    print(f"\n[2] Testing Prediction Endpoint: POST {url}")
    
    img_bytes = create_sample_image_bytes()
    boundary = "----WebKitFormBoundaryCivicTest7MA4YWxkTrZu0gW"
    
    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="file"; filename="sample_road.jpg"\r\n')
    body.extend(b"Content-Type: image/jpeg\r\n\r\n")
    body.extend(img_bytes)
    body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "User-Agent": "CivicVisionTest/1.0"
        }
    )
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode("utf-8"))
            print(f"Status: {response.status}")
            print(f"Success:              {data.get('success')}")
            print(f"Model:                {data.get('model', {}).get('name')}")
            print(f"Processing Status:    {data.get('status')}")
            print(f"Primary Department:   {data.get('primary_department') or 'None (Clean/no issue)'}")
            print(f"Detections Count:     {len(data.get('detections', []))}")
            print(f"Inference Latency:    {data.get('inference_time_ms')} ms")
            assert response.status == 200
            assert data["success"] is True
            return True
    except Exception as e:
        print(f"[FAIL] Prediction failed: {e}")
        return False

def main():
    print("=" * 60)
    print(" TESTING CIVIC ISSUE IMAGE DETECTION MICROSERVICE")
    print("=" * 60)

    h_ok = test_health()
    if not h_ok:
        print("\nNote: Microservice is not running. Start with: py -3.13 run_service.py")
        sys.exit(1)

    p_ok = test_predict()
    if p_ok:
        print("\n" + "=" * 60)
        print(" ALL ENDPOINTS VERIFIED SUCCESSFULLY!")
        print("=" * 60)

if __name__ == "__main__":
    main()
