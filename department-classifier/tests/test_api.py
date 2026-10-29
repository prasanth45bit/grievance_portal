import pytest
from fastapi.testclient import TestClient
from app.api import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["department_count"] == 12

def test_departments_endpoint(client):
    response = client.get("/departments")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 12
    assert len(data["departments"]) == 12
    dept_names = [d["name"] for d in data["departments"]]
    assert "Roads and Highways" in dept_names
    assert "Water Supply" in dept_names

def test_predict_single_endpoint(client):
    response = client.post(
        "/predict",
        json={
            "complaint": "There are big potholes on the road near my home.",
            "top_k": 3
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["predicted_department"] == "Roads and Highways"
    assert data["confidence"] > 0.8
    assert len(data["top_predictions"]) == 3

def test_predict_batch_endpoint(client):
    response = client.post(
        "/predict/batch",
        json={
            "complaints": [
                "Water supply is contaminated and dirty in our colony.",
                "Street lights are not working on main junction."
            ],
            "top_k": 2
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total"] == 2
    assert len(data["predictions"]) == 2
    assert data["predictions"][0]["predicted_department"] == "Water Supply"
    assert data["predictions"][1]["predicted_department"] == "Street Lighting"

def test_predict_empty_validation(client):
    response = client.post("/predict", json={"complaint": "ab"})
    assert response.status_code == 422
