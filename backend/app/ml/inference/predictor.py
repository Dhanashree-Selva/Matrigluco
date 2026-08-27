import logging
from dataclasses import dataclass
from typing import Dict, Any, Optional, Union
import pandas as pd
import numpy as np

from app.core.config import get_settings
from app.core.exceptions import MLInferenceError
from app.ml.inference.feature_contract import (
    DiabetesRiskFeatures,
    FEATURE_NAMES_PASCAL,
    MODEL_FEATURE_ORDER,
    PreparedInferenceInput,
)
from app.ml.inference.feature_mapper import prepare_inference_input, map_input_features
from app.ml.inference.feature_validator import validate_canonical_features
from app.ml.inference.risk_classifier import classify_risk_band
from app.ml.inference.model_loader import ml_model_loader, MLModelLoader, LoadedModelBundle

logger = logging.getLogger("matrigluco.ml.predictor")
settings = get_settings()

model_registry = ml_model_loader


@dataclass(frozen=True)
class RawPrediction:
    """Typed result of raw clinical ML model inference."""

    model_key: str
    model_version: str
    positive_class: int
    probability: float
    risk_band: str
    prediction_result: str
    canonical_features: DiabetesRiskFeatures
    provenance: Dict[str, str]
    algorithm: str
    prepared_input: Optional[PreparedInferenceInput] = None
    explainability: Optional[Dict[str, Any]] = None

    @property
    def probability_score(self) -> float:
        """Percentage score rounded to 2 decimal places (e.g. 73.12)."""
        return round(self.probability * 100.0, 2)


class MLInferenceService:
    """
    Clinical Machine Learning Inference Engine.
    Executes explicit mapping, range validation, preprocessor scaling, and probabilistic evaluation.
    Completely decoupled from HTTP and database persistence layers.
    """

    def __init__(
        self,
        loader: Optional[MLModelLoader] = None,
        registry: Optional[Any] = None,
        default_version: Optional[str] = None,
    ):
        self.loader = loader or registry or ml_model_loader
        self.default_version = default_version or settings.DIABETES_MODEL_VERSION

    def evaluate_prepared(
        self,
        prepared_input: PreparedInferenceInput,
        version: Optional[str] = None,
    ) -> RawPrediction:
        """
        Executes inference directly on a pre-validated, immutable PreparedInferenceInput.
        Used for production persistence and exact historical prediction reproduction.
        """
        target_version = version or self.default_version
        bundle: LoadedModelBundle = self.loader.get_bundle("diabetes-risk", target_version)

        # 1. Convert prepared features to canonical dataclass and validate bounds
        can_dict = prepared_input.to_canonical_dict()
        canonical_features = DiabetesRiskFeatures(**can_dict)
        validated_features = validate_canonical_features(canonical_features)

        # 2. Construct exact ordered model DataFrame matching preprocessor columns
        model_dict = validated_features.to_model_dict()
        input_df = pd.DataFrame([model_dict], columns=list(FEATURE_NAMES_PASCAL))

        try:
            # 3. Feature scaling via versioned preprocessor
            scaled_features = bundle.preprocessor.transform(input_df)

            # 4. Model probabilistic inference
            probabilities = bundle.model.predict_proba(scaled_features)
            raw_prob = float(probabilities[0][bundle.positive_class_idx])

            if not (0.0 <= raw_prob <= 1.0):
                raise MLInferenceError(
                    message=f"Model returned invalid probability value: {raw_prob}"
                )

            # 5. Versioned risk classification
            thresholds = bundle.metadata.get("risk_thresholds")
            pred_result, risk_band = classify_risk_band(raw_prob, thresholds=thresholds)

            provenance_map = {f.name: f.provenance.source_type for f in prepared_input.features}

            # 6. Model Explainability / Feature Contribution Analysis
            explainability_data = None
            if hasattr(bundle.model, "coef_"):
                try:
                    coefs = bundle.model.coef_[0]
                    scaled_vals = scaled_features[0]
                    feature_labels = {
                        "Age": ("Maternal Age", "years"),
                        "Pregnancies": ("Pregnancies", "count"),
                        "Glucose": ("Fasting Glucose", "mg/dL"),
                        "BloodPressure": ("Blood Pressure", "mmHg"),
                        "SkinThickness": ("Skinfold Thickness", "mm"),
                        "Insulin": ("Serum Insulin", "µU/mL"),
                        "BMI": ("Body Mass Index", "kg/m²"),
                        "DiabetesPedigreeFunction": ("Diabetes Pedigree", "score"),
                    }

                    raw_effects = []
                    for idx, col_name in enumerate(FEATURE_NAMES_PASCAL):
                        effect = float(coefs[idx] * scaled_vals[idx])
                        raw_effects.append((col_name, effect))

                    total_abs = sum(abs(eff) for _, eff in raw_effects) or 1.0
                    contributions = []
                    for col_name, effect in raw_effects:
                        label, unit = feature_labels.get(col_name, (col_name, ""))
                        val = float(model_dict.get(col_name, 0.0))
                        direction = "higher" if effect >= 0 else "lower"
                        magnitude = round(abs(effect) / total_abs, 3)
                        contributions.append({
                            "feature": col_name,
                            "label": label,
                            "value": val,
                            "direction": direction,
                            "magnitude": max(0.05, magnitude),
                            "unit": unit,
                        })
                    contributions.sort(key=lambda x: x["magnitude"], reverse=True)
                    explainability_data = {
                        "method": "Linear Log-Odds Attribution",
                        "version": bundle.version,
                        "contributions": contributions,
                    }
                except Exception as ex_err:
                    logger.warning(f"Feature contribution computation skipped: {ex_err}")

            return RawPrediction(
                model_key=bundle.model_key,
                model_version=bundle.version,
                positive_class=bundle.metadata.get("positive_class", 1),
                probability=raw_prob,
                risk_band=risk_band,
                prediction_result=pred_result,
                canonical_features=validated_features,
                provenance=provenance_map,
                algorithm=bundle.metadata.get("algorithm", "LogisticRegression"),
                prepared_input=prepared_input,
                explainability=explainability_data,
            )
        except Exception as e:
            logger.error(f"Inference execution failed: {e}")
            raise MLInferenceError(message=f"Clinical ML inference execution failed: {e}")

    def evaluate(
        self,
        raw_features: Union[Dict[str, Any], DiabetesRiskFeatures],
        version: Optional[str] = None,
        source_type: str = "manual",
    ) -> RawPrediction:
        """
        Executes full deterministic ML inference sequence on domain features.
        """
        prepared = prepare_inference_input(
            raw_features=raw_features,
            source_type=source_type,
        )
        return self.evaluate_prepared(prepared, version=version)

    # Backward compatibility method for legacy callers returning Dict
    def predict_diabetes_risk(
        self, features: Union[Dict[str, Any], DiabetesRiskFeatures], version: Optional[str] = None
    ) -> Dict[str, Any]:
        res = self.evaluate(features, version=version)
        return {
            "prediction_result": res.prediction_result,
            "risk_level": "High Risk"
            if res.risk_band == "high"
            else ("Moderate Risk" if res.risk_band == "moderate" else "Low Risk"),
            "risk_band": res.risk_band,
            "probability_score": res.probability_score,
            "prediction_score": res.probability_score,
            "probability": res.probability,
            "model_version": res.model_version,
            "algorithm": res.algorithm,
            "features_snapshot": res.canonical_features.to_canonical_dict(),
        }
