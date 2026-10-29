import io
from PIL import Image
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_test_image(width=300, height=300, color=(128, 128, 128)) -> io.BytesIO:
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf

def test_predict_plain_image():
    # A blank gray image has no potholes or garbage, so should return valid structure with no_reliable_detection
    test_img = create_test_image()
    response = client.post(
        "/predict",
        files={"file": ("road_sample.jpg", test_img, "image/jpeg")},
        params={"confidence": 0.5}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "model" in data
    assert "image" in data
    assert data["image"]["width"] == 300
    assert data["image"]["height"] == 300
    assert "detections" in data
    assert isinstance(data["detections"], list)
    assert data["status"] in ("completed", "no_reliable_detection")
    assert "inference_time_ms" in data

def test_invalid_confidence_parameter():
    test_img = create_test_image()
    response = client.post(
        "/predict",
        files={"file": ("test.jpg", test_img, "image/jpeg")},
        params={"confidence": 2.5} # Out of range [0.05, 1.0]
    )
    assert response.status_code == 422
