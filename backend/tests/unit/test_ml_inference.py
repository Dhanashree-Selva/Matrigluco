import pytest
from app.ml.inference.predictor import MLInferenceService, model_registry
from app.core.config import get_settings

settings = get_settings()


def test_ml_inference_low_risk():
    service = MLInferenceService(registry=model_registry)
    # Healthy maternal profile inputs
    healthy_inputs = {
        "Pregnancies": 1,
        "Glucose": 85.0,
        "BloodPressure": 68.0,
        "SkinThickness": 20.0,
        "Insulin": 79.0,
        "BMI": 22.5,
        "DiabetesPedigreeFunction": 0.15,
        "Age": 26,
    }

    result = service.predict_diabetes_risk(healthy_inputs)
    assert "prediction_result" in result
    assert "risk_level" in result
    assert "probability_score" in result
    assert "model_version" in result
    assert result["model_version"] in ["1.0.0", "v1", settings.ML_MODEL_VERSION]
    assert result["prediction_result"] == "Non-Diabetic"
    assert result["risk_level"] in ["Low Risk", "Moderate Risk"]
    assert 0.0 <= result["probability_score"] <= 100.0


def test_ml_inference_high_risk():
    service = MLInferenceService(registry=model_registry)
    # High risk maternal profile inputs
    high_risk_inputs = {
        "Pregnancies": 5,
        "Glucose": 190.0,
        "BloodPressure": 90.0,
        "SkinThickness": 35.0,
        "Insulin": 250.0,
        "BMI": 38.5,
        "DiabetesPedigreeFunction": 0.85,
        "Age": 42,
    }

    result = service.predict_diabetes_risk(high_risk_inputs)
    assert result["prediction_result"] == "Diabetic"
    assert result["risk_level"] == "High Risk"
    assert result["probability_score"] > 60.0
