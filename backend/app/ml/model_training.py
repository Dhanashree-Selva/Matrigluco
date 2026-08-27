import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report


def train_and_save_model():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, "diabetes.csv")

    if not os.path.exists(dataset_path):
        # Fallback to root or other known locations
        fallback_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(current_dir))),
            "scratch_diabetes_ml",
            "diabetes.csv",
        )
        if os.path.exists(fallback_path):
            dataset_path = fallback_path
        else:
            raise FileNotFoundError(f"Could not find diabetes.csv at {dataset_path}")

    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f"Dataset shape: {df.shape}")

    # Features and Target
    # Expected columns: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age, Outcome
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

    # Train/Test Split (matches Diabetes_pred.ipynb)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Feature Scaling with StandardScaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Model Training with LogisticRegression
    model = LogisticRegression(random_state=42)
    model.fit(X_train_scaled, y_train)

    # Evaluation
    y_pred = model.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    print(f"[OK] Model Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Non-Diabetic", "Diabetic"]))

    # Save artifacts
    model_path = os.path.join(current_dir, "diabetes_model.pkl")
    scaler_path = os.path.join(current_dir, "scaler.pkl")

    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)

    print(f"[SUCCESS] Saved model to {model_path}")
    print(f"[SUCCESS] Saved scaler to {scaler_path}")


if __name__ == "__main__":
    train_and_save_model()
