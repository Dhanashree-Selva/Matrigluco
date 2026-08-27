from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, field_serializer
from datetime import datetime, date, timezone


class DoctorAppointmentCreate(BaseModel):
    patient_name: str = Field(..., max_length=150)
    doctor_name: str = Field(..., max_length=150)
    consultation_type: Optional[str] = Field("Video Consultation", max_length=50)
    appointment_date: str
    appointment_time: str = Field(..., max_length=20)
    symptoms: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field("booked", max_length=30)

    model_config = ConfigDict(extra="forbid")


class DoctorAppointmentUpdate(BaseModel):
    doctor_name: Optional[str] = Field(None, max_length=150)
    consultation_type: Optional[str] = Field(None, max_length=50)
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = Field(None, max_length=20)
    symptoms: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, max_length=30)

    model_config = ConfigDict(extra="forbid")


class DoctorAppointmentResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    patient_name: str
    doctor_name: str
    consultation_type: Optional[str] = None
    appointment_date: date
    appointment_time: str
    symptoms: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("created_at", check_fields=False)
    def serialize_dt(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")
