from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, field_serializer
from datetime import datetime, timezone


class SaveReportRequest(BaseModel):
    user_id: Optional[str] = None
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    extracted_values: Optional[Dict[str, Any]] = None
    prediction_result: Optional[str] = None
    risk_level: Optional[str] = None


class UpdateReportRequest(BaseModel):
    file_name: Optional[str] = None
    extracted_values: Optional[Dict[str, Any]] = None
    prediction_result: Optional[str] = None
    risk_level: Optional[str] = None


class ReportResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    extracted_values: Optional[Dict[str, Any]] = None
    prediction_result: Optional[str] = None
    risk_level: Optional[str] = None
    uploaded_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("uploaded_at", "created_at", check_fields=False)
    def serialize_dt(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")
