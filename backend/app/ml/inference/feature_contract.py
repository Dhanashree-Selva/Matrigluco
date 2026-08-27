from dataclasses import dataclass
from typing import Dict, Tuple, List, Any, Optional
from enum import Enum

MODEL_FEATURE_ORDER: Tuple[str, ...] = (
    "pregnancies",
    "glucose",
    "blood_pressure",
    "skin_thickness",
    "insulin",
    "bmi",
    "diabetes_pedigree_function",
    "age",
)

FEATURE_NAMES_PASCAL: Tuple[str, ...] = (
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
)

# Physiological bounds [min, max] verified against clinical diabetes modeling bounds
FEATURE_RANGES: Dict[str, Tuple[float, float]] = {
    "pregnancies": (0.0, 25.0),
    "glucose": (40.0, 500.0),
    "blood_pressure": (40.0, 250.0),
    "skin_thickness": (5.0, 120.0),
    "insulin": (1.0, 1000.0),
    "bmi": (10.0, 80.0),
    "diabetes_pedigree_function": (0.05, 3.0),
    "age": (15.0, 110.0),
}

FEATURE_UNITS: Dict[str, str] = {
    "pregnancies": "count",
    "glucose": "mg/dL",
    "blood_pressure": "mmHg",
    "skin_thickness": "mm",
    "insulin": "µU/mL",
    "bmi": "kg/m²",
    "diabetes_pedigree_function": "score",
    "age": "years",
}


# ─── Feature Provenance & Governance Types ────────────────────────────────────


class FeatureSourceType(str, Enum):
    MANUAL = "manual"
    HEALTH_MEASUREMENT = "health_measurement"
    MEDICAL_REPORT = "medical_report"
    DERIVED = "derived"
    IMPUTED = "imputed"
    PROFILE = "profile"


@dataclass(frozen=True)
class FeatureProvenance:
    """Granular lineage tracking for a specific canonical feature."""

    source_type: str = "manual"
    source_reference: Optional[str] = None
    is_derived: bool = False
    derivation_method: Optional[str] = None
    is_imputed: bool = False
    imputation_strategy: Optional[str] = None
    imputation_policy_version: Optional[str] = None


@dataclass(frozen=True)
class PreparedFeature:
    """A fully validated canonical feature with complete provenance."""

    name: str
    order: int
    normalized_value: float
    raw_value: Optional[float] = None
    unit: Optional[str] = None
    provenance: FeatureProvenance = FeatureProvenance()


@dataclass(frozen=True)
class PreparedInferenceInput:
    """
    Immutable bundle passed to model preprocessor and database persistence.
    Contains the pre-preprocessor normalized snapshot and all feature provenance.
    """

    features: Tuple[PreparedFeature, ...]
    feature_contract_version: str = "1.0"
    mapping_version: str = "1.0"
    input_snapshot: Dict[str, float] = None  # type: ignore[assignment]
    contains_imputed_values: bool = False

    def to_canonical_dict(self) -> Dict[str, float]:
        return {f.name: f.normalized_value for f in self.features}

    def to_model_dict(self) -> Dict[str, float]:
        name_map = dict(zip(MODEL_FEATURE_ORDER, FEATURE_NAMES_PASCAL))
        return {name_map[f.name]: f.normalized_value for f in self.features}


@dataclass(frozen=True)
class DiabetesRiskFeatures:
    """
    Canonical ML Feature Contract for maternal diabetes risk prediction.
    Strictly isolated from frontend form semantics, raw HTTP inputs, and UI key variations.
    """

    pregnancies: float
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree_function: float
    age: float

    def to_canonical_dict(self) -> Dict[str, float]:
        """Returns dictionary keyed by canonical snake_case feature names in exact contract order."""
        return {
            "pregnancies": float(self.pregnancies),
            "glucose": float(self.glucose),
            "blood_pressure": float(self.blood_pressure),
            "skin_thickness": float(self.skin_thickness),
            "insulin": float(self.insulin),
            "bmi": float(self.bmi),
            "diabetes_pedigree_function": float(self.diabetes_pedigree_function),
            "age": float(self.age),
        }

    def to_model_dict(self) -> Dict[str, float]:
        """Returns dictionary matching the scikit-learn model's expected PascalCase column names."""
        return {
            "Pregnancies": float(self.pregnancies),
            "Glucose": float(self.glucose),
            "BloodPressure": float(self.blood_pressure),
            "SkinThickness": float(self.skin_thickness),
            "Insulin": float(self.insulin),
            "BMI": float(self.bmi),
            "DiabetesPedigreeFunction": float(self.diabetes_pedigree_function),
            "Age": float(self.age),
        }

    def to_ordered_list(self) -> List[float]:
        """Returns ordered float values matching MODEL_FEATURE_ORDER exactly."""
        return [
            float(self.pregnancies),
            float(self.glucose),
            float(self.blood_pressure),
            float(self.skin_thickness),
            float(self.insulin),
            float(self.bmi),
            float(self.diabetes_pedigree_function),
            float(self.age),
        ]
