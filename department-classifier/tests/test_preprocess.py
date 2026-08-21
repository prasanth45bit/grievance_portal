import pandas as pd
# pyrefly: ignore [missing-import]
import pytest
from app.preprocess import load_and_clean_data, split_dataset, DepartmentLabelEncoder

def test_label_encoder_bidirectional_mapping(tmp_path):
    """Test fitting, transforming, inverse transforming, and saving of DepartmentLabelEncoder."""
    df = pd.DataFrame({
        "complaint": ["Text 1", "Text 2", "Text 3"],
        "department_id": [10, 20, 10],
        "department_name": ["Water Dept", "Electricity Dept", "Water Dept"]
    })
    
    encoder = DepartmentLabelEncoder()
    encoder.fit(df)
    
    # Verify mappings
    encoded = encoder.transform([10, 20])
    assert len(encoded) == 2
    assert encoded[0] != encoded[1]
    
    # Inverse mapping
    dep_id_1, dep_name_1 = encoder.inverse_transform(encoded[0])
    assert dep_id_1 == 10
    assert dep_name_1 == "Water Dept"
    
    dep_id_2, dep_name_2 = encoder.inverse_transform(encoded[1])
    assert dep_id_2 == 20
    assert dep_name_2 == "Electricity Dept"
    
    # Saving and Loading
    encoder_file = tmp_path / "label_encoder.pkl"
    encoder.save(str(encoder_file))
    
    loaded_encoder = DepartmentLabelEncoder.load(str(encoder_file))
    assert loaded_encoder.idx_to_id == encoder.idx_to_id
    assert loaded_encoder.idx_to_name == encoder.idx_to_name

def test_load_and_clean_data(tmp_path):
    """Test that null values and duplicates are removed, and data shuffles."""
    csv_file = tmp_path / "test_complaints.csv"
    
    # 5 rows: 1 duplicate complaint, 1 with null, 3 clean rows
    data = (
        "complaint,department_id,department_name\n"
        "Water leak,1,Water Supply\n"
        "Water leak,1,Water Supply\n"  # Duplicate
        ",2,Electricity\n"  # Null complaint
        "Garbage pile,3,Sanitation\n"
        "Damaged road,4,Roads\n"
    )
    csv_file.write_text(data, encoding="utf-8")
    
    df = load_and_clean_data(str(csv_file))
    
    # Should have exactly 3 clean rows left
    assert len(df) == 3
    assert set(df["complaint"]) == {"Water leak", "Garbage pile", "Damaged road"}
    assert "department_id" in df.columns
    assert "department_name" in df.columns

def test_split_dataset():
    """Test that data splits correctly into train, val, and test subsets."""
    # Build large enough dataset to split
    df = pd.DataFrame({
        "complaint": [f"Complaint {i}" for i in range(20)],
        "department_id": [i % 2 for i in range(20)],
        "department_name": [f"Dept {i % 2}" for i in range(20)]
    })
    
    train_df, val_df, test_df = split_dataset(df, seed=42)
    
    # Assert proportions
    assert len(train_df) == 16  # 80% of 20
    assert len(val_df) == 2     # 10% of 20
    assert len(test_df) == 2    # 10% of 20
