import pytest
from app.ml.inference.feature_mapper import prepare_inference_input, map_input_features
from app.ml.inference.predictor import MLInferenceService
from app.core.exceptions import MLFeatureIncompleteError


def test_gestational_diabetes_not_mapped_to_pregnancies():
    """
    Governance Rule #1: gestational_diabetes_history is a separate health flag
    and is NEVER mapped into pregnancy count.
    """
    domain_payload = {
        "gestational_diabetes_history": True,
        "glucose": 130.0,
        "blood_pressure": 75.0,
        "skin_thickness": 22.0,
        "insulin": 85.0,
        "bmi": 26.0,
        "diabetes_pedigree_function": 0.35,
        "age": 28.0,
    }

    # Missing pregnancies should NOT be filled by gestational_diabetes_history boolean
    with pytest.raises(MLFeatureIncompleteError) as exc_info:
        prepare_inference_input(domain_payload)

    assert "pregnancies" in exc_info.value.details["missing_features"]


def test_hba1c_context_does_not_alter_inference():
    """
    Governance Rule #6: HbA1c is not part of the 8-feature contract
    and must NOT alter the probability produced by active model 1.0.0.
    """
    service = MLInferenceService()

    base_features = {
        "pregnancies": 2,
        "glucose": 140.0,
        "blood_pressure": 80.0,
        "skin_thickness": 25.0,
        "insulin": 100.0,
        "bmi": 28.0,
        "diabetes_pedigree_function": 0.40,
        "age": 30.0,
    }

    features_with_hba1c = dict(base_features)
    features_with_hba1c["hba1c"] = 7.5
    features_with_hba1c["glycated_hemoglobin"] = 8.2

    res_base = service.evaluate(base_features)
    res_with_hba1c = service.evaluate(features_with_hba1c)

    # Probabilities must be mathematically identical
    assert res_base.probability == pytest.approx(res_with_hba1c.probability, abs=1e-7)
    assert res_base.risk_band == res_with_hba1c.risk_band
    assert res_base.prediction_result == res_with_hba1c.prediction_result


def test_missing_feature_rejected_without_hardcoded_defaults():
    """
    Governance Rule #2 & #9: Missing model features must NEVER be silently filled
    with hard-coded constants (e.g. 20, 80, 0).
    """
    incomplete_features = {
        "glucose": 120.0,
        "bmi": 25.0,
        # Missing pregnancies, bp, skin_thickness, insulin, dpf, age
    }

    with pytest.raises(MLFeatureIncompleteError) as exc_info:
        prepare_inference_input(incomplete_features)

    missing = exc_info.value.details["missing_features"]
    assert "pregnancies" in missing
    assert "blood_pressure" in missing
    assert "skin_thickness" in missing
    assert "insulin" in missing
    assert "diabetes_pedigree_function" in missing
    assert "age" in missing
