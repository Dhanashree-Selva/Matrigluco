from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict, field_serializer


# ─── Production Clinical Prediction Contracts ─────────────────────────────────


class PredictionCreateRequest(BaseModel):
    """
    Domain clinical input schema for diabetes risk evaluation.
    Accepts direct canonical features or approved derived fields (e.g. weight/height for BMI).
    Non-model health context (e.g. HbA1c) is explicitly separate.
    """

    pregnancies: Optional[float] = Field(
        None, ge=0.0, le=25.0, description="Total completed or prior pregnancies"
    )
    glucose: float = Field(..., ge=40.0, le=500.0, description="Plasma / Fasting glucose (mg/dL)")
    blood_pressure: float = Field(
        ..., ge=40.0, le=250.0, description="Diastolic blood pressure (mmHg)"
    )
    skin_thickness: float = Field(
        ..., ge=5.0, le=120.0, description="Triceps skinfold thickness (mm)"
    )
    insulin: float = Field(..., ge=1.0, le=1000.0, description="2-hour serum insulin (µU/mL)")
    bmi: Optional[float] = Field(None, ge=10.0, le=80.0, description="Body Mass Index (kg/m²)")
    diabetes_pedigree_function: float = Field(
        ..., ge=0.05, le=3.0, description="Diabetes pedigree function genetic score"
    )
    age: float = Field(..., ge=15.0, le=110.0, description="Maternal patient age (years)")

    # Optional deterministic derivation inputs if direct BMI not supplied
    weight_kg: Optional[float] = Field(
        None, ge=30.0, le=300.0, description="Weight in kg for BMI calculation"
    )
    height_cm: Optional[float] = Field(
        None, ge=100.0, le=250.0, description="Height in cm for BMI calculation"
    )

    # Non-model contextual health fields (accepted as health context without model influence)
    hba1c: Optional[float] = Field(
        None,
        ge=3.0,
        le=20.0,
        description="Optional HbA1c percentage (context only, does not alter 8-feature model inference)",
    )


class PredictionModelReference(BaseModel):
    key: str = "diabetes-risk"
    version: str = "1.0.0"
    algorithm: Optional[str] = "LogisticRegression"
    framework: Optional[str] = "scikit-learn"


class FeatureContributionDTO(BaseModel):
    feature: str
    label: str
    value: float
    direction: str  # "higher" | "lower"
    magnitude: float
    unit: Optional[str] = None


class ExplainabilityPayloadDTO(BaseModel):
    method: str = "Linear Log-Odds Attribution"
    version: str = "1.0.0"
    contributions: List[FeatureContributionDTO] = []


class PredictionDetailResponse(BaseModel):
    """Authoritative prediction response DTO with probability, risk band, and feature snapshot."""

    id: str
    probability: float
    probability_score: float
    risk_band: str
    prediction_result: str
    source: str
    model: PredictionModelReference
    features_snapshot: Dict[str, float]
    contains_imputed_values: bool = False
    mapping_version: str = "1.0"
    created_at: datetime
    disclaimer: str = (
        "This algorithmic risk assessment is a research and educational prototype. "
        "It does not constitute a clinical medical diagnosis or therapeutic recommendation."
    )
    explainability: Optional[ExplainabilityPayloadDTO] = None

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("created_at", check_fields=False)
    def serialize_dt(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")


class PredictionListItem(BaseModel):
    """Summary item for patient risk evaluation history listing."""

    id: str
    probability: float
    probability_score: float
    risk_band: str
    prediction_result: str
    source: str
    model_version: str
    contains_imputed_values: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("created_at", check_fields=False)
    def serialize_dt(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")


class PredictionPaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    pages: int


class PredictionListResponse(BaseModel):
    """Paginated collection of patient risk assessments."""

    items: List[PredictionListItem]
    pagination: PredictionPaginationMeta


class PredictionModelInfoResponse(BaseModel):
    """Educational Model Card and Governance metadata for the active ML model."""

    model_key: str
    version: str
    framework: str
    algorithm: str
    feature_contract_version: str
    feature_order: List[str]
    metrics: Optional[Dict[str, float]] = None
    evaluation_dataset: Optional[Dict[str, Any]] = None
    imputation_policy: Optional[Dict[str, Any]] = None
    clinical_positioning: Optional[Dict[str, Any]] = None
    educational_notice: str = (
        "MatriGluco ML models operate as research/educational risk-estimation prototypes. "
        "They have not undergone clinical trial validation and must not be used for diagnostic confirmation."
    )


# ─── Backward Compatibility Schemas ───────────────────────────────────────────


class PredictionRequest(BaseModel):
    """Legacy request contract for backward compatibility."""

    pregnancies: int = 0
    glucose: float
    blood_pressure: float = 0.0
    skin_thickness: float = 0.0
    insulin: float = 0.0
    bmi: float
    diabetes_pedigree: float = 0.0
    age: int = 0


class PredictionResponse(BaseModel):
    """Legacy response contract for backward compatibility."""

    prediction_result: str
    risk_level: str
    probability_score: float
    prediction_score: Optional[float] = None
    model_version: Optional[str] = "1.0.0"
    features_snapshot: Optional[Dict[str, Any]] = None


class PredictionSaveRequest(BaseModel):
    user_id: Optional[str] = None
    glucose: float
    bmi: float
    pregnancies: Optional[int] = 0
    blood_pressure: Optional[float] = 0.0
    skin_thickness: Optional[float] = 0.0
    insulin: Optional[float] = 0.0
    diabetes_pedigree: Optional[float] = 0.0
    age: Optional[int] = 0
    prediction_result: str
    risk_level: str
    probability_score: float


class PredictionRead(BaseModel):
    id: str
    user_id: Optional[str] = None
    glucose: float
    bmi: float
    pregnancies: int
    blood_pressure: float
    skin_thickness: float
    insulin: float
    diabetes_pedigree: float
    age: int
    prediction_result: str
    risk_level: str
    probability_score: float
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
