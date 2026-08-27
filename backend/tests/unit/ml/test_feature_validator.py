import pytest
import math
from app.ml.inference.feature_validator import validate_canonical_features
from app.ml.inference.feature_contract import DiabetesRiskFeatures
from app.core.exceptions import MLFeatureValidationError, MLFeatureIncompleteError


def test_validate_valid_canonical_features():
    """Valid features pass without exception."""
    features = DiabetesRiskFeatures(
        pregnancies=1.0,
        glucose=120.0,
        blood_pressure=70.0,
        skin_thickness=20.0,
        insulin=80.0,
        bmi=25.0,
        diabetes_pedigree_function=0.35,
        age=28.0,
    )
    validated = validate_canonical_features(features)
    assert validated == features


def test_validate_rejects_nan_and_inf():
    """Rejects NaN and Infinite values strictly."""
    features = DiabetesRiskFeatures(
        pregnancies=1.0,
        glucose=float("nan"),
        blood_pressure=70.0,
        skin_thickness=20.0,
        insulin=80.0,
        bmi=25.0,
        diabetes_pedigree_function=0.35,
        age=28.0,
    )
    with pytest.raises(MLFeatureValidationError, match="non-finite"):
        validate_canonical_features(features)

    features_inf = DiabetesRiskFeatures(
        pregnancies=1.0,
        glucose=120.0,
        blood_pressure=float("inf"),
        skin_thickness=20.0,
        insulin=80.0,
        bmi=25.0,
        diabetes_pedigree_function=0.35,
        age=28.0,
    )
    with pytest.raises(MLFeatureValidationError, match="non-finite"):
        validate_canonical_features(features_inf)


def test_validate_rejects_out_of_bounds():
    """Rejects values outside acceptable physiological bounds."""
    # Glucose < 40 or > 500
    features_low_glucose = DiabetesRiskFeatures(
        pregnancies=1.0,
        glucose=20.0,  # Below 40.0
        blood_pressure=70.0,
        skin_thickness=20.0,
        insulin=80.0,
        bmi=25.0,
        diabetes_pedigree_function=0.35,
        age=28.0,
    )
    with pytest.raises(MLFeatureValidationError, match="outside acceptable physiological range"):
        validate_canonical_features(features_low_glucose)
