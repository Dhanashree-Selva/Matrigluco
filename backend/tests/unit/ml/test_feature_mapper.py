import pytest
from app.ml.inference.feature_mapper import map_input_features, derive_bmi
from app.ml.inference.feature_contract import DiabetesRiskFeatures
from app.core.exceptions import MLFeatureIncompleteError


def test_map_input_features_with_valid_aliases():
    """Maps domain dictionary with common aliases to canonical contract."""
    raw = {
        "pregnancy_count": 2,
        "fasting_glucose": 130.0,
        "bp": 78.0,
        "skinthickness": 24.0,
        "serum_insulin": 90.0,
        "maternal_bmi": 27.5,
        "dpf": 0.42,
        "maternal_age": 30,
    }

    features, provenance = map_input_features(raw)

    assert isinstance(features, DiabetesRiskFeatures)
    assert features.pregnancies == 2.0
    assert features.glucose == 130.0
    assert features.blood_pressure == 78.0
    assert features.skin_thickness == 24.0
    assert features.insulin == 90.0
    assert features.bmi == 27.5
    assert features.diabetes_pedigree_function == 0.42
    assert features.age == 30.0
    assert provenance["glucose"] in ["manual", "provided"]


def test_map_input_features_derived_bmi():
    """Deterministically calculates BMI when weight and height are supplied."""
    raw = {
        "pregnancies": 1,
        "glucose": 110.0,
        "blood_pressure": 70.0,
        "skin_thickness": 18.0,
        "insulin": 60.0,
        "weight_kg": 68.0,
        "height_cm": 165.0,
        "diabetes_pedigree_function": 0.3,
        "age": 26,
    }

    features, provenance = map_input_features(raw)
    expected_bmi = round(68.0 / (1.65 * 1.65), 2)  # ~24.98

    assert features.bmi == expected_bmi
    assert provenance["bmi"] == "derived"


def test_map_input_features_rejects_missing_without_fabrication():
    """Missing required features must raise MLFeatureIncompleteError and NEVER default to 0."""
    incomplete = {
        "glucose": 140.0,
        "bmi": 30.0,
        # Missing pregnancies, blood_pressure, skin_thickness, insulin, dpf, age
    }

    with pytest.raises(MLFeatureIncompleteError) as exc_info:
        map_input_features(incomplete)

    err_details = exc_info.value.details
    assert "missing_features" in err_details
    assert "insulin" in err_details["missing_features"]
    assert "skin_thickness" in err_details["missing_features"]
