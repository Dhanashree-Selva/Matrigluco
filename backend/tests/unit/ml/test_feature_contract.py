import pytest
from app.ml.inference.feature_contract import (
    DiabetesRiskFeatures,
    MODEL_FEATURE_ORDER,
    FEATURE_NAMES_PASCAL,
    FEATURE_RANGES,
    FEATURE_UNITS,
)


def test_feature_contract_ordering_and_length():
    """Enforces exact eight canonical features and sequence."""
    assert len(MODEL_FEATURE_ORDER) == 8
    assert MODEL_FEATURE_ORDER == (
        "pregnancies",
        "glucose",
        "blood_pressure",
        "skin_thickness",
        "insulin",
        "bmi",
        "diabetes_pedigree_function",
        "age",
    )
    assert len(FEATURE_NAMES_PASCAL) == 8


def test_feature_contract_serialization():
    """Verifies canonical snake_case and model PascalCase serialization."""
    features = DiabetesRiskFeatures(
        pregnancies=2.0,
        glucose=120.0,
        blood_pressure=75.0,
        skin_thickness=22.0,
        insulin=85.0,
        bmi=26.4,
        diabetes_pedigree_function=0.35,
        age=29.0,
    )

    can_dict = features.to_canonical_dict()
    assert can_dict["glucose"] == 120.0
    assert can_dict["diabetes_pedigree_function"] == 0.35

    model_dict = features.to_model_dict()
    assert model_dict["Glucose"] == 120.0
    assert model_dict["DiabetesPedigreeFunction"] == 0.35
    assert "Glucose" in model_dict

    ordered_list = features.to_ordered_list()
    assert len(ordered_list) == 8
    assert ordered_list[0] == 2.0
    assert ordered_list[1] == 120.0


def test_feature_units_defined_for_all():
    """All 8 canonical features must have defined clinical units."""
    for feat in MODEL_FEATURE_ORDER:
        assert feat in FEATURE_UNITS
        assert isinstance(FEATURE_UNITS[feat], str)
