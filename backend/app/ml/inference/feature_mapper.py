"""
Explicit Feature Mapping and Lineage Tracking Engine.

Guarantees:
1. No silent defaults or fabricated model inputs.
2. gestational_diabetes_history is NEVER mapped into pregnancy count.
3. Unsupported health variables (e.g. HbA1c) are never injected into the active 8-feature contract.
4. Granular provenance is recorded for every feature (provided, derived, imputed).
"""

import logging
from typing import Dict, Any, Optional, Tuple, List, Union

from app.core.exceptions import MLFeatureIncompleteError
from app.ml.inference.feature_contract import (
    DiabetesRiskFeatures,
    MODEL_FEATURE_ORDER,
    FEATURE_UNITS,
    FeatureProvenance,
    PreparedFeature,
    PreparedInferenceInput,
    FeatureSourceType,
)
from app.ml.inference.imputation import ImputationEngine, DEFAULT_IMPUTATION_POLICY

logger = logging.getLogger("matrigluco.ml.mapper")

# Canonical aliases mapping strictly domain concepts to model features
CANONICAL_FEATURE_ALIASES: Dict[str, Tuple[str, ...]] = {
    "pregnancies": (
        "pregnancies",
        "pregnancy_count",
        "previous_pregnancies",
        "prior_pregnancies",
        "total_pregnancies",
        "Pregnancies",
    ),
    "glucose": (
        "glucose",
        "fasting_glucose",
        "plasma_glucose",
        "blood_sugar",
        "Glucose",
    ),
    "blood_pressure": (
        "blood_pressure",
        "bloodpressure",
        "diastolic_blood_pressure",
        "diastolic_bp",
        "bp",
        "BloodPressure",
    ),
    "skin_thickness": (
        "skin_thickness",
        "skinthickness",
        "triceps_skinfold",
        "triceps_skin_thickness",
        "SkinThickness",
    ),
    "insulin": (
        "insulin",
        "serum_insulin",
        "two_hour_insulin",
        "2_hour_insulin",
        "Insulin",
    ),
    "bmi": (
        "bmi",
        "body_mass_index",
        "maternal_bmi",
        "BMI",
    ),
    "diabetes_pedigree_function": (
        "diabetes_pedigree_function",
        "diabetes_pedigree",
        "pedigree_function",
        "dpf",
        "DiabetesPedigreeFunction",
    ),
    "age": (
        "age",
        "maternal_age",
        "patient_age",
        "Age",
    ),
}

# Forbidden keys that must NEVER be mapped into pregnancies
FORBIDDEN_PREGNANCY_PROXIES = {
    "gestational_diabetes_history",
    "has_gestational_diabetes",
    "gdm_history",
    "gestational_diabetes",
    "has_gdm",
}


def derive_bmi(domain_dict: Dict[str, Any]) -> Optional[Tuple[float, float, float]]:
    """
    Deterministically computes BMI = weight_kg / (height_m)².
    Returns (bmi, weight_kg, height_cm) or None if insufficient data.
    """
    weight = (
        domain_dict.get("weight_kg")
        or domain_dict.get("weight")
        or domain_dict.get("maternal_weight")
    )
    height_cm = (
        domain_dict.get("height_cm")
        or domain_dict.get("height")
        or domain_dict.get("maternal_height")
    )

    if weight is not None and height_cm is not None:
        try:
            w = float(weight)
            h_m = float(height_cm) / 100.0 if float(height_cm) > 3.0 else float(height_cm)
            if h_m > 0 and w > 0:
                bmi = round(w / (h_m * h_m), 2)
                return bmi, w, float(height_cm)
        except (ValueError, TypeError, ZeroDivisionError):
            return None
    return None


def _extract_feature_value(input_dict: Dict[str, Any], canonical_name: str) -> Optional[float]:
    """Extracts float value for a canonical feature using explicit alias table."""
    aliases = CANONICAL_FEATURE_ALIASES.get(canonical_name, (canonical_name,))
    for alias in aliases:
        if alias in input_dict and input_dict[alias] is not None:
            raw = input_dict[alias]
            try:
                val = float(raw)
                return val
            except (ValueError, TypeError):
                continue
    return None


def prepare_inference_input(
    raw_features: Union[Dict[str, Any], DiabetesRiskFeatures],
    source_type: str = "manual",
    imputation_engine: Optional[ImputationEngine] = None,
    feature_contract_version: str = "1.0",
    mapping_version: str = "1.0",
) -> PreparedInferenceInput:
    """
    Authoritative mapper transforming domain input into immutable PreparedInferenceInput.
    Enforces governance invariants:
    - Never uses gestational_diabetes_history as pregnancy count.
    - Never injects unsupported health context (e.g. HbA1c) into model input.
    - Validates completeness and explicit provenance.
    """
    engine = imputation_engine or ImputationEngine(DEFAULT_IMPUTATION_POLICY)

    if isinstance(raw_features, DiabetesRiskFeatures):
        dict_val = raw_features.to_canonical_dict()
        prepared_list: List[PreparedFeature] = []
        for idx, name in enumerate(MODEL_FEATURE_ORDER):
            prepared_list.append(
                PreparedFeature(
                    name=name,
                    order=idx,
                    normalized_value=dict_val[name],
                    raw_value=dict_val[name],
                    unit=FEATURE_UNITS.get(name),
                    provenance=FeatureProvenance(source_type=source_type),
                )
            )
        return PreparedInferenceInput(
            features=tuple(prepared_list),
            feature_contract_version=feature_contract_version,
            mapping_version=mapping_version,
            input_snapshot=dict_val,
            contains_imputed_values=False,
        )

    input_dict = dict(raw_features)

    # Invariant Check: Verify no gestational diabetes boolean was submitted as pregnancies
    for forbidden_key in FORBIDDEN_PREGNANCY_PROXIES:
        if forbidden_key in input_dict and "pregnancies" not in input_dict:
            logger.warning(
                f"Domain key '{forbidden_key}' provided without explicit pregnancy count. "
                "Refusing to proxy gestational diabetes history as pregnancy count."
            )

    resolved_values: Dict[str, float] = {}
    raw_values: Dict[str, Optional[float]] = {}
    provenance_map: Dict[str, FeatureProvenance] = {}
    missing: List[str] = []

    for name in MODEL_FEATURE_ORDER:
        val = _extract_feature_value(input_dict, name)
        raw_values[name] = val

        # Handle derived BMI if direct BMI was not supplied
        if val is None and name == "bmi":
            bmi_derivation = derive_bmi(input_dict)
            if bmi_derivation is not None:
                derived_bmi, w_kg, h_cm = bmi_derivation
                resolved_values["bmi"] = derived_bmi
                provenance_map["bmi"] = FeatureProvenance(
                    source_type=FeatureSourceType.DERIVED.value,
                    is_derived=True,
                    derivation_method=f"weight_kg({w_kg})/height_m({h_cm / 100.0})²",
                )
                continue

        if val is not None:
            resolved_values[name] = val
            provenance_map[name] = FeatureProvenance(
                source_type=source_type,
                is_derived=False,
                is_imputed=False,
            )
        else:
            missing.append(name)

    # Evaluate missing features through ImputationEngine
    if missing:
        resolved_values, imputed_meta = engine.handle_missing_features(
            present_features=resolved_values,
            missing_features=missing,
        )
        for feat_name, meta in imputed_meta.items():
            provenance_map[feat_name] = FeatureProvenance(
                source_type=FeatureSourceType.IMPUTED.value,
                is_imputed=True,
                imputation_strategy=meta.get("imputation_strategy"),
                imputation_policy_version=meta.get("imputation_policy_version"),
            )

    # Construct ordered PreparedFeature tuple
    prepared_features: List[PreparedFeature] = []
    contains_imputed = False

    for idx, name in enumerate(MODEL_FEATURE_ORDER):
        prov = provenance_map.get(name, FeatureProvenance(source_type=source_type))
        if prov.is_imputed:
            contains_imputed = True
        prepared_features.append(
            PreparedFeature(
                name=name,
                order=idx,
                normalized_value=resolved_values[name],
                raw_value=raw_values.get(name),
                unit=FEATURE_UNITS.get(name),
                provenance=prov,
            )
        )

    # Build canonical input snapshot (exact pre-preprocessor dictionary)
    snapshot = {f.name: f.normalized_value for f in prepared_features}

    return PreparedInferenceInput(
        features=tuple(prepared_features),
        feature_contract_version=feature_contract_version,
        mapping_version=mapping_version,
        input_snapshot=snapshot,
        contains_imputed_values=contains_imputed,
    )


def map_input_features(
    raw_features: Union[Dict[str, Any], DiabetesRiskFeatures],
    mapping_version: str = "1.0",
) -> Tuple[DiabetesRiskFeatures, Dict[str, str]]:
    """
    Backward-compatible mapper returning canonical dataclass and simple provenance dict.
    """
    prepared = prepare_inference_input(
        raw_features=raw_features,
        mapping_version=mapping_version,
    )
    features_dict = prepared.to_canonical_dict()
    features = DiabetesRiskFeatures(**features_dict)
    provenance = {f.name: f.provenance.source_type for f in prepared.features}
    return features, provenance
