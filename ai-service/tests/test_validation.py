import io
from PIL import Image
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.department_mapping import map_issue_to_department, VALID_DEPARTMENTS

client = TestClient(app)

def test_department_mapping():
    dept, desc = map_issue_to_department("pothole")
    assert dept == "Roads and Highways"

    dept, desc = map_issue_to_department("alligator crack")
    assert dept == "Roads and Highways"

    dept, desc = map_issue_to_department("garbage")
    assert dept == "Sanitation"

    dept, desc = map_issue_to_department("water_leakage")
    assert dept == "Water Supply"

    dept, desc = map_issue_to_department("sewage_overflow")
    assert dept == "Drainage and Sewerage"

    dept, desc = map_issue_to_department("damaged_electric_pole")
    assert dept == "Electricity"

    dept, desc = map_issue_to_department("damaged_streetlight")
    assert dept == "Street Lighting"

    dept, desc = map_issue_to_department("stray_animal")
    assert dept == "Animal Control"

    dept, desc = map_issue_to_department("damaged_park_equipment")
    assert dept == "Parks and Recreation"

def test_unsupported_file_extension():
    fake_file = io.BytesIO(b"Hello world this is not an image")
    response = client.post(
        "/predict",
        files={"file": ("document.pdf", fake_file, "application/pdf")}
    )
    assert response.status_code == 415
    assert "Unsupported image extension" in response.json()["detail"]

def test_corrupted_image_file():
    fake_file = io.BytesIO(b"corrupted image binary content")
    response = client.post(
        "/predict",
        files={"file": ("bad_image.png", fake_file, "image/png")}
    )
    assert response.status_code == 400
    assert "valid image" in response.json()["detail"].lower()

def test_empty_image_file():
    empty_file = io.BytesIO(b"")
    response = client.post(
        "/predict",
        files={"file": ("empty.jpg", empty_file, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()
