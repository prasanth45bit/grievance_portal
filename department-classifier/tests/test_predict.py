# pyrefly: ignore [missing-import]
import pytest
import pandas as pd
from unittest.mock import MagicMock, patch
from app.predict import DepartmentClassifier
from app.preprocess import DepartmentLabelEncoder

@pytest.fixture
def mock_label_encoder():
    encoder = MagicMock(spec=DepartmentLabelEncoder)
    # Configure mock mappings
    encoder.idx_to_id = {0: 1, 1: 2}
    encoder.idx_to_name = {0: "Water Supply", 1: "Electricity"}
    encoder.id_to_name = {1: "Water Supply", 2: "Electricity"}
    
    # Mock inverse_transform
    def inv_trans(idx):
        if idx == 0:
            return 1, "Water Supply"
        elif idx == 1:
            return 2, "Electricity"
        raise KeyError()
    encoder.inverse_transform.side_effect = inv_trans
    
    # Mock transform
    def trans(ids):
        return [0 if i == 1 else 1 for i in ids]
    encoder.transform.side_effect = trans
    return encoder

@patch("app.predict.DepartmentClassifier._load_metadata")
@patch("app.predict.DepartmentClassifier._load_pytorch")
def test_classifier_predict_pytorch(mock_load_pytorch, mock_load_metadata, mock_label_encoder):
    """Test classifier predicts and formats correct response via PyTorch backend."""
    classifier = DepartmentClassifier()
    classifier.label_encoder = mock_label_encoder
    
    # Setup mock tokenizer
    mock_tokenizer = MagicMock()
    mock_tokenizer.return_value = {
        "input_ids": MagicMock(to=MagicMock(return_value=MagicMock())),
        "attention_mask": MagicMock(to=MagicMock(return_value=MagicMock()))
    }
    classifier.tokenizer = mock_tokenizer
    
    # Setup mock PyTorch model returning mock logits
    mock_model = MagicMock()
    mock_outputs = MagicMock()
    # Logits correspond to class index 0 (Water Supply) with higher value
    import numpy as np
    mock_logits = MagicMock()
    mock_logits.cpu.return_value.numpy.return_value = np.array([[5.0, -1.0]])
    mock_outputs.logits = mock_logits
    mock_model.return_value = mock_outputs
    classifier.model = mock_model
    
    # Call prediction
    result = classifier.predict("Water is leaking", use_onnx=False, confidence_threshold=0.5)
    
    # Assertions
    assert result["department_id"] == 1
    assert result["department_name"] == "Water Supply"
    assert result["confidence"] > 0.95
    assert result["is_confident"] is True
    assert len(result["top_departments"]) == 2
    assert result["top_departments"][0]["department_name"] == "Water Supply"

@patch("app.predict.DepartmentClassifier._load_metadata")
def test_predict_empty_text_error(mock_load_metadata):
    """Test that predicting on empty or space-only text raises a ValueError."""
    classifier = DepartmentClassifier()
    with pytest.raises(ValueError, match="text cannot be empty"):
        classifier.predict("")

@patch("app.predict.DepartmentClassifier._load_metadata")
@patch("app.predict.DepartmentClassifier.predict")
def test_predict_batch_csv(mock_predict, mock_load_metadata, tmp_path):
    """Test batch CSV prediction creates output file with prediction columns."""
    classifier = DepartmentClassifier()
    
    # Setup mock predict output
    mock_predict.return_value = {
        "department_id": 2,
        "department_name": "Electricity",
        "confidence": 0.99,
        "is_confident": True,
        "top_departments": []
    }
    
    # Write input CSV
    input_file = tmp_path / "input.csv"
    pd.DataFrame({"complaint": ["Lights out"]}).to_csv(input_file, index=False)
    
    output_file = tmp_path / "output.csv"
    
    classifier.predict_batch_csv(str(input_file), str(output_file))
    
    # Read output
    out_df = pd.read_csv(output_file)
    assert "predicted_department_id" in out_df.columns
    assert "predicted_department_name" in out_df.columns
    assert out_df.loc[0, "predicted_department_name"] == "Electricity"
    assert out_df.loc[0, "confidence"] == 0.99
