from pathlib import Path
from typing import Tuple
import pandas as pd
from sklearn.model_selection import train_test_split
from app.ml.inference.feature_contract import FEATURE_NAMES


def load_diabetes_dataset(csv_path: Path) -> Tuple[pd.DataFrame, pd.Series]:
    """Loads dataset and extracts feature matrix and target column."""
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset not found at {csv_path}")
    df = pd.read_csv(csv_path)
    X = df[FEATURE_NAMES]
    y = df["Outcome"]
    return X, y


def split_data(
    X: pd.DataFrame, y: pd.Series, test_size: float = 0.2, random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """Splits features and target into train and test sets."""
    return train_test_split(X, y, test_size=test_size, random_state=random_state)
