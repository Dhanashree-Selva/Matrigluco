import math
from typing import Dict, Any, Union
from app.ml.inference.feature_contract import (
    MODEL_FEATURE_ORDER,
    FEATURE_RANGES,
    DiabetesRiskFeatures,
)
from app.core.exceptions import (
    MLFeatureValidationError,
    MLFeatureIncompleteError,
)


def validate_canonical_features(
    features: Union[DiabetesRiskFeatures, Dict[str, Any]],
) -> DiabetesRiskFeatures:
    """
    Validates completeness, numeric types, finiteness, and physiological bounds
    for all eight canonical diabetes model features.

    Raises:
        MLFeatureIncompleteError: If any required feature is missing.
        MLFeatureValidationError: If any value is NaN, infinite, non-numeric, or outside valid bounds.
    """
    feat_dict: Dict[str, Any] = (
        features.to_canonical_dict() if isinstance(features, DiabetesRiskFeatures) else features
    )

    # 1. Verify completeness of all 8 canonical features
    missing_features = [
        name for name in MODEL_FEATURE_ORDER if name not in feat_dict or feat_dict[name] is None
    ]
    if missing_features:
        raise MLFeatureIncompleteError(
            missing_features=missing_features,
            message=f"Missing required clinical model features: {', '.join(missing_features)}",
        )

    # 2. Verify numeric types, finiteness, and physiological bounds
    validated_values: Dict[str, float] = {}

    for name in MODEL_FEATURE_ORDER:
        val = feat_dict[name]

        # Type conversion check
        try:
            num_val = float(val)
        except (ValueError, TypeError):
            raise MLFeatureValidationError(
                message=f"Feature '{name}' must be a valid numeric float, received: {type(val).__name__} ({val})",
                details={"feature": name, "value": str(val)},
            )

        # Finiteness check
        if math.isnan(num_val) or math.isinf(num_val):
            raise MLFeatureValidationError(
                message=f"Feature '{name}' contains non-finite numerical value (NaN or Infinity).",
                details={"feature": name, "value": str(val)},
            )

        # Physiological range validation
        min_bound, max_bound = FEATURE_RANGES[name]
        if not (min_bound <= num_val <= max_bound):
            raise MLFeatureValidationError(
                message=(
                    f"Feature '{name}' value {num_val} is outside acceptable physiological range "
                    f"[{min_bound}, {max_bound}]."
                ),
                details={"feature": name, "value": num_val, "bounds": [min_bound, max_bound]},
            )

        validated_values[name] = num_val

    if isinstance(features, DiabetesRiskFeatures):
        return features

    return DiabetesRiskFeatures(
        pregnancies=validated_values["pregnancies"],
        glucose=validated_values["glucose"],
        blood_pressure=validated_values["blood_pressure"],
        skin_thickness=validated_values["skin_thickness"],
        insulin=validated_values["insulin"],
        bmi=validated_values["bmi"],
        diabetes_pedigree_function=validated_values["diabetes_pedigree_function"],
        age=validated_values["age"],
    )


# Backward compatibility alias
def validate_feature_values(features: Union[DiabetesRiskFeatures, Dict[str, float]]) -> None:
    validate_canonical_features(features)
