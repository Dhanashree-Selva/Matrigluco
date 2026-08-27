import os
import pickle
from pathlib import Path
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


def train_and_save_model() -> None:
    """
    Trains standard diabetes logistic regression model and serializes
    artifacts to app/ml/artifacts/diabetes/v1/.
    """
    ml_root = Path(__file__).resolve().parent.parent
    dataset_path = ml_root / "diabetes.csv"

    if not dataset_path.exists():
        raise FileNotFoundError(f"Could not find diabetes.csv dataset at {dataset_path}")

    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f"Dataset shape: {df.shape}")

    feature_columns = [
        "Pregnancies",
        "Glucose",
        "BloodPressure",
        "SkinThickness",
        "Insulin",
        "BMI",
        "DiabetesPedigreeFunction",
        "Age",
    ]

    X = df[feature_columns]
    y = df["Outcome"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = LogisticRegression(random_state=42)
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    print(f"[OK] Model Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Non-Diabetic", "Diabetic"]))

    # Save artifacts into versioned directory and root for backwards compatibility
    artifact_v1_dir = ml_root / "artifacts" / "diabetes" / "v1"
    artifact_v1_dir.mkdir(parents=True, exist_ok=True)

    with open(artifact_v1_dir / "model.pkl", "wb") as f:
        pickle.dump(model, f)
    with open(artifact_v1_dir / "scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

    # Also save to ml root for fallback
    with open(ml_root / "diabetes_model.pkl", "wb") as f:
        pickle.dump(model, f)
    with open(ml_root / "scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

    print(f"[SUCCESS] Saved model and scaler to {artifact_v1_dir}")


if __name__ == "__main__":
    train_and_save_model()
