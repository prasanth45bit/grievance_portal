import pickle
from typing import Dict, Tuple, List
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from app.config import Config, logger

class DepartmentLabelEncoder:
    """Encoder to handle bidirectional mapping between department_id/name and model labels."""
    def __init__(self):
        self.label_encoder = LabelEncoder()
        self.idx_to_id: Dict[int, int] = {}
        self.idx_to_name: Dict[int, str] = {}
        self.id_to_name: Dict[int, str] = {}

    def fit(self, df: pd.DataFrame) -> "DepartmentLabelEncoder":
        """Fits the label encoder on unique department IDs and maps them to names."""
        # Standardize columns and drop duplicates
        pairs = df[["department_id", "department_name"]].drop_duplicates()
        
        # Fit on string representations of department IDs
        ids_str = pairs["department_id"].astype(str).tolist()
        self.label_encoder.fit(ids_str)
        
        for _, row in pairs.iterrows():
            dep_id = int(row["department_id"])
            dep_name = str(row["department_name"])
            encoded_idx = int(self.label_encoder.transform([str(dep_id)])[0])
            
            self.idx_to_id[encoded_idx] = dep_id
            self.idx_to_name[encoded_idx] = dep_name
            self.id_to_name[dep_id] = dep_name
            
        logger.info(f"Fitted label encoder with {len(self.idx_to_id)} classes.")
        return self

    def transform(self, ids: List[int]) -> List[int]:
        """Transform department IDs to class labels."""
        ids_str = [str(i) for i in ids]
        return self.label_encoder.transform(ids_str).tolist()

    def inverse_transform(self, label_idx: int) -> Tuple[int, str]:
        """Convert a class label back to (department_id, department_name)."""
        dep_id = self.idx_to_id.get(label_idx)
        dep_name = self.idx_to_name.get(label_idx)
        if dep_id is None or dep_name is None:
            raise KeyError(f"Encoded index {label_idx} not found in mappings.")
        return dep_id, dep_name

    def save(self, path: str) -> None:
        """Save the label encoder state to a pickle file."""
        with open(path, "wb") as f:
            pickle.dump(self, f)
        logger.info(f"Saved label encoder to {path}")

    @staticmethod
    def load(path: str) -> "DepartmentLabelEncoder":
        """Load the label encoder state from a pickle file."""
        with open(path, "rb") as f:
            encoder = pickle.load(f)
        logger.info(f"Loaded label encoder from {path}")
        return encoder

def load_and_clean_data(csv_path: str) -> pd.DataFrame:
    """Loads CSV, validates headers, removes nulls, duplicates, and shuffles."""
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        logger.error(f"CSV file not found at {csv_path}")
        raise
    except Exception as e:
        logger.error(f"Error reading CSV {csv_path}: {e}")
        raise ValueError(f"Invalid CSV format: {e}")

    # Validate columns
    required_cols = {"complaint", "department_id", "department_name"}
    if not required_cols.issubset(df.columns):
        missing = required_cols - set(df.columns)
        logger.error(f"Missing columns: {missing}")
        raise ValueError(f"CSV missing required columns: {missing}")

    initial_len = len(df)
    
    # Remove nulls
    df = df.dropna(subset=["complaint", "department_id", "department_name"])
    
    # Remove duplicates
    df = df.drop_duplicates(subset=["complaint"])
    
    cleaned_len = len(df)
    logger.info(f"Loaded {cleaned_len} complaints (Removed {initial_len - cleaned_len} duplicates/nulls).")
    
    # Shuffle dataset
    df = df.sample(frac=1.0, random_state=Config.SEED).reset_index(drop=True)
    return df

def split_dataset(df: pd.DataFrame, seed: int = Config.SEED) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Splits dataset into 80% train, 10% validation, and 10% test."""
    try:
        # Try stratified splits to keep class distributions matching
        train_df, temp_df = train_test_split(
            df, test_size=0.20, random_state=seed, stratify=df["department_id"]
        )
        val_df, test_df = train_test_split(
            temp_df, test_size=0.50, random_state=seed, stratify=temp_df["department_id"]
        )
        logger.info("Successfully split dataset using stratified splitting.")
    except Exception as e:
        logger.warning(f"Stratified split failed: {e}. Falling back to random splitting.")
        train_df, temp_df = train_test_split(df, test_size=0.20, random_state=seed)
        val_df, test_df = train_test_split(temp_df, test_size=0.50, random_state=seed)
        
    logger.info(f"Split sizes: Train={len(train_df)}, Val={len(val_df)}, Test={len(test_df)}")
    return train_df, val_df, test_df
