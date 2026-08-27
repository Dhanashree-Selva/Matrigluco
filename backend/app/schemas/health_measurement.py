from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, Field, model_validator, field_serializer


class HealthMeasurementCreate(BaseModel):
    metric_type: str = Field(
        ..., max_length=50, description="Metric type: glucose, blood_pressure, bmi, weight, hba1c"
    )
    value_primary: Optional[float] = Field(
        None, description="Primary numeric value (e.g. glucose, weight, BMI, systolic BP)"
    )
    value_secondary: Optional[float] = Field(
        None, description="Secondary numeric value (e.g. diastolic BP)"
    )
    value: Optional[float] = Field(None, description="Compatibility alias for value_primary")
    systolic: Optional[float] = Field(
        None, description="Explicit systolic alias for blood_pressure"
    )
    diastolic: Optional[float] = Field(
        None, description="Explicit diastolic alias for blood_pressure"
    )
    unit: str = Field(..., max_length=30, description="Measurement unit: mg/dL, mmHg, kg, kg/m², %")
    measured_at: Optional[datetime] = None
    pregnancy_profile_id: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=500)

    model_config = ConfigDict(extra="forbid")

    @model_validator(mode="after")
    def normalize_and_validate_values(self) -> "HealthMeasurementCreate":
        metric = self.metric_type.strip().lower()

        # Handle systolic / diastolic aliases
        if self.systolic is not None and self.value_primary is None:
            self.value_primary = self.systolic
        if self.diastolic is not None and self.value_secondary is None:
            self.value_secondary = self.diastolic

        # Handle value compatibility alias
        if self.value is not None and self.value_primary is None:
            self.value_primary = self.value

        if self.value_primary is None:
            raise ValueError(f"Primary value is required for metric '{self.metric_type}'.")

        # Blood pressure specific validations
        if metric == "blood_pressure":
            if self.value_secondary is None:
                raise ValueError(
                    "Blood pressure requires both systolic (primary) and diastolic (secondary) values."
                )
            if self.unit.strip().lower() != "mmhg":
                raise ValueError(f"Blood pressure unit must be 'mmHg', received '{self.unit}'.")
            if self.value_primary <= 0 or self.value_secondary <= 0:
                raise ValueError("Blood pressure values must be strictly positive.")
            if self.value_primary < self.value_secondary:
                raise ValueError(
                    "Systolic blood pressure cannot be lower than diastolic blood pressure."
                )
        else:
            if self.value_primary < 0:
                raise ValueError(f"Metric '{self.metric_type}' value cannot be negative.")

        return self


class HealthMeasurementUpdate(BaseModel):
    value_primary: Optional[float] = None
    value_secondary: Optional[float] = None
    value: Optional[float] = None
    systolic: Optional[float] = None
    diastolic: Optional[float] = None
    unit: Optional[str] = Field(None, max_length=30)
    measured_at: Optional[datetime] = None
    pregnancy_profile_id: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=500)

    model_config = ConfigDict(extra="forbid")


class HealthMeasurementResponse(BaseModel):
    id: str
    user_id: str
    pregnancy_profile_id: Optional[str] = None
    metric_type: str
    value_primary: float
    value_secondary: Optional[float] = None
    value: float = 0.0
    unit: str
    measured_at: datetime
    source: str = "manual"
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("measured_at", "created_at", check_fields=False)
    def serialize_datetime(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")

    @model_validator(mode="after")
    def set_value_alias(self) -> "HealthMeasurementResponse":
        if self.value == 0.0 and self.value_primary:
            self.value = self.value_primary
        return self


class HealthMeasurementListResponse(BaseModel):
    items: List[HealthMeasurementResponse]
    total: int
    page: int
    page_size: int
    total_pages: int = 1
