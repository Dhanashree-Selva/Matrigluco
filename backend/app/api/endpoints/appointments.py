from typing import Optional, List
from fastapi import APIRouter, Depends
from app.models.schemas import DoctorAppointmentCreate
from app.services.consultation_service import ConsultationService
from app.api.dependencies import get_consultation_service
from app.core.security import get_current_user_id

router = APIRouter()


@router.post("/")
def book_appointment(
    data: DoctorAppointmentCreate,
    current_user_id: Optional[str] = Depends(get_current_user_id),
    service: ConsultationService = Depends(get_consultation_service),
):
    """
    Legacy appointment booking endpoint delegating to ConsultationService.
    """
    if current_user_id and not data.user_id:
        data.user_id = current_user_id

    saved = service.book_appointment(data)

    return {
        "message": "Appointment booked successfully",
        "data": {
            "id": saved.id,
            "user_id": saved.user_id,
            "patient_name": saved.patient_name,
            "doctor_name": saved.doctor_name,
            "consultation_type": saved.consultation_type,
            "appointment_date": saved.appointment_date.isoformat(),
            "appointment_time": saved.appointment_time,
            "symptoms": saved.symptoms,
            "status": saved.status,
            "created_at": saved.created_at.isoformat() if saved.created_at else None,
        },
    }


@router.get("/")
def get_appointments(
    user_id: Optional[str] = None,
    current_user_id: Optional[str] = Depends(get_current_user_id),
    service: ConsultationService = Depends(get_consultation_service),
):
    """
    Legacy appointment query endpoint delegating to ConsultationService.
    """
    target_user_id = user_id or current_user_id
    if not target_user_id:
        return []

    records = service.get_user_appointments(user_id=target_user_id)
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "patient_name": r.patient_name,
            "doctor_name": r.doctor_name,
            "consultation_type": r.consultation_type,
            "appointment_date": r.appointment_date.isoformat(),
            "appointment_time": r.appointment_time,
            "symptoms": r.symptoms,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]
