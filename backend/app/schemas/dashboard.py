from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, Field, field_serializer


class LatestMeasurement(BaseModel):
    metric_type: str
    value: float
    unit: str
    measured_at: datetime

    @field_serializer("measured_at", check_fields=False)
    def serialize_dt(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")


class BloodPressureSummary(BaseModel):
    systolic: float
    diastolic: float
    unit: str = "mmHg"
    measured_at: datetime

    @field_serializer("measured_at", check_fields=False)
    def serialize_dt(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")


class RecentPredictionSummary(BaseModel):
    id: str
    probability: float
    probability_score: float
    risk_band: str
    prediction_result: str
    created_at: datetime

    @field_serializer("created_at", check_fields=False)
    def serialize_dt(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")


class UpcomingConsultationSummary(BaseModel):
    id: str
    doctor_name: str
    appointment_date: str
    appointment_time: str
    status: str


class TrendPoint(BaseModel):
    measured_at: datetime
    value_primary: float
    value_secondary: Optional[float] = None

    @field_serializer("measured_at", check_fields=False)
    def serialize_dt(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")


class MeasurementCountSummary(BaseModel):
    total_7_days: int = 0
    total_30_days: int = 0


class DashboardSummaryResponse(BaseModel):
    latest_measurements: Dict[str, Any] = Field(default_factory=dict)
    recent_prediction: Optional[RecentPredictionSummary] = None
    trends: Dict[str, Any] = Field(default_factory=lambda: {"seven_day": {}, "thirty_day": {}})
    measurement_counts: MeasurementCountSummary = Field(default_factory=MeasurementCountSummary)
    upcoming_consultation: Optional[UpcomingConsultationSummary] = None
    recent_activities: List[Dict[str, Any]] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
