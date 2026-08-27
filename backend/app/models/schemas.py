"""
Backward compatibility schemas and models wrapper.
Re-exports SQLAlchemy models and Pydantic DTOs for existing routes.
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import User
from app.models.risk_assessment import Prediction
from app.models.medical_report import Report
from app.models.consultation import DoctorAppointment


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────


class UserSignUp(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    expected_due_date: Optional[str] = None


class UserSignIn(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    expected_due_date: Optional[str] = None
    pregnancy_week: Optional[int] = None
    previous_pregnancies: Optional[int] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    password: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    expected_due_date: Optional[str] = None
    pregnancy_week: Optional[int] = 0
    previous_pregnancies: Optional[int] = 0
    phone: Optional[str] = None
    age: Optional[int] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    user_metadata: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


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


class SaveReportRequest(BaseModel):
    user_id: Optional[str] = None
    file_url: Optional[str] = None
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

    model_config = ConfigDict(from_attributes=True)


class DoctorAppointmentCreate(BaseModel):
    user_id: Optional[str] = None
    patient_name: str
    doctor_name: str
    consultation_type: Optional[str] = "Video Consultation"
    appointment_date: str
    appointment_time: str
    symptoms: Optional[str] = None
    status: Optional[str] = "booked"
