# pyrefly: ignore [missing-import]
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from fastapi import status
from app.api import app, get_classifier
from app.predict import DepartmentClassifier

client = TestClient(app)

@pytest.fixture
def mock_classifier():
    clf = MagicMock(spec=DepartmentClassifier)
    # Define mock response for single prediction
    clf.predict.return_value = {
        "department_id": 1,
        "department_name": "Water Supply",
        "confidence": 0.98,
        "is_confident": True,
        "top_departments": [
            {"rank": 1, "department_id": 1, "department_name": "Water Supply", "confidence": 0.98}
        ]
    }
    # Mock label encoder structure for health check
    clf.label_encoder = MagicMock()
    clf.label_encoder.idx_to_name = {1: "Water Supply"}
    
    # Mock ONNX model path for health check
    clf.onnx_model_path = MagicMock()
    clf.onnx_model_path.exists.return_value = True
    return clf

def test_health_endpoint_healthy(mock_classifier):
    """Test health check endpoint when classifier loads successfully."""
    # Patch get_classifier dependency
    app.dependency_overrides[get_classifier] = lambda: mock_classifier
    
    response = client.get("/health")
    app.dependency_overrides.clear()
    
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "healthy"

def test_health_endpoint_degraded():
    """Test health check endpoint when classifier loading fails (missing model)."""
    # Force get_classifier to raise 503 HTTP exception
    from fastapi import HTTPException
    def mock_raise():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model files not found"
        )
    app.dependency_overrides[get_classifier] = mock_raise
    
    response = client.get("/health")
    app.dependency_overrides.clear()
    
    assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
    assert "Model files not found" in response.json()["detail"]

def test_predict_single_endpoint_success(mock_classifier):
    """Test standard single prediction post request."""
    app.dependency_overrides[get_classifier] = lambda: mock_classifier
    
    payload = {"complaint": "Water pipeline is leaking near my house"}
    response = client.post("/predict", json=payload)
    app.dependency_overrides.clear()
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["department_id"] == 1
    assert data["department_name"] == "Water Supply"
    assert data["confidence"] == 0.98

def test_predict_single_endpoint_empty_error(mock_classifier):
    """Test validation on empty input complaint."""
    app.dependency_overrides[get_classifier] = lambda: mock_classifier
    
    payload = {"complaint": "   "}
    response = client.post("/predict", json=payload)
    app.dependency_overrides.clear()
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_predict_batch_endpoint_success(mock_classifier):
    """Test batch prediction list request."""
    app.dependency_overrides[get_classifier] = lambda: mock_classifier
    
    payload = {
        "complaints": [
            "Water is leaking",
            "Electricity is down"
        ]
    }
    response = client.post("/predict/batch", json=payload)
    app.dependency_overrides.clear()
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2
    assert data[0]["department_name"] == "Water Supply"
