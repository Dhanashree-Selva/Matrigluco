import pytest
from app.ml.inference.predictor import MLInferenceService, RawPrediction
from app.ml.inference.feature_contract import DiabetesRiskFeatures


def test_predictor_deterministic_evaluation():
    """Predictor generates deterministic probability output for the same input."""
    service = MLInferenceService()

    input_data = {
        "pregnancies": 2,
        "glucose": 130.0,
        "blood_pressure": 80.0,
        "skin_thickness": 25.0,
        "insulin": 95.0,
        "bmi": 28.0,
        "diabetes_pedigree_function": 0.40,
        "age": 30,
    }

    res1 = service.evaluate(input_data)
    res2 = service.evaluate(input_data)

    assert isinstance(res1, RawPrediction)
    assert res1.model_key == "diabetes-risk"
    assert res1.model_version == "1.0.0"
    assert 0.0 <= res1.probability <= 1.0
    assert res1.risk_band in ["low", "moderate", "high"]
    assert res1.prediction_result in ["Diabetic", "Non-Diabetic"]
    assert res1.probability == pytest.approx(res2.probability, abs=1e-6)
    assert res1.probability_score == res2.probability_score


def test_predictor_legacy_dict_interface():
    """Predictor provides backward compatibility predict_diabetes_risk returning Dict."""
    service = MLInferenceService()
    features = DiabetesRiskFeatures(
        pregnancies=1.0,
        glucose=100.0,
        blood_pressure=70.0,
        skin_thickness=20.0,
        insulin=60.0,
        bmi=23.0,
        diabetes_pedigree_function=0.25,
        age=25.0,
    )

    data = service.predict_diabetes_risk(features)
    assert "prediction_result" in data
    assert "risk_level" in data
    assert "probability_score" in data
    assert "features_snapshot" in data
