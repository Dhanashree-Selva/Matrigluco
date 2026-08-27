from typing import Tuple
import pandas as pd
from sklearn.preprocessing import StandardScaler


def fit_and_transform_scaler(
    X_train: pd.DataFrame, X_test: pd.DataFrame
) -> Tuple[StandardScaler, pd.DataFrame, pd.DataFrame]:
    """Fits standard scaler on train set and scales train and test sets."""
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    return scaler, X_train_scaled, X_test_scaled
