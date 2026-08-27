import pytest
from app.ml.inference.imputation import (
    ImputationPolicy,
    ImputationEngine,
    DEFAULT_IMPUTATION_POLICY,
)
from app.core.exceptions import MLFeatureIncompleteError


def test_default_imputation_policy_is_disabled():
    """Default policy for diabetes-risk:1.0.0 strictly disables imputation."""
    assert DEFAULT_IMPUTATION_POLICY.enabled is False
    assert DEFAULT_IMPUTATION_POLICY.policy_version is None

    engine = ImputationEngine(DEFAULT_IMPUTATION_POLICY)
    present = {"glucose": 130.0, "bmi": 26.0}
    missing = ["insulin", "skin_thickness"]

    with pytest.raises(MLFeatureIncompleteError) as exc_info:
        engine.handle_missing_features(present, missing)

    assert "insulin" in exc_info.value.details["missing_features"]


def test_custom_approved_imputation_policy():
    """Explicit versioned imputation policy imputes approved features and records metadata."""
    custom_policy = ImputationPolicy(
        enabled=True,
        policy_version="1.0-test",
        strategy="training_median",
        imputed_features={
            "insulin": 79.0,
            "skin_thickness": 23.0,
        },
    )

    engine = ImputationEngine(custom_policy)
    present = {"glucose": 125.0, "bmi": 24.5}
    missing = ["insulin", "skin_thickness"]

    resolved, metadata = engine.handle_missing_features(present, missing)

    assert resolved["insulin"] == 79.0
    assert resolved["skin_thickness"] == 23.0
    assert metadata["insulin"]["is_imputed"] is True
    assert metadata["insulin"]["imputation_strategy"] == "training_median"
    assert metadata["insulin"]["imputation_policy_version"] == "1.0-test"
