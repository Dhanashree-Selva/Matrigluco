from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.schemas.consultation import (
    DoctorAppointmentCreate,
    DoctorAppointmentUpdate,
    DoctorAppointmentResponse,
)
from app.services.consultation_service import ConsultationService
from app.api.dependencies import get_consultation_service, get_current_user
from app.models.user import User

router = APIRouter(prefix="/consultations", tags=["Consultations"])


@router.get(
    "", response_model=List[DoctorAppointmentResponse], summary="List patient consultations"
)
def list_consultations(
    limit: int = Query(50, ge=1, le=100),
    service: ConsultationService = Depends(get_consultation_service),
    current_user: User = Depends(get_current_user),
):
    """Retrieves current user's scheduled doctor appointments/consultations."""
    return service.get_user_appointments(user_id=current_user.id, actor=current_user, limit=limit)


@router.post(
    "",
    response_model=DoctorAppointmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create consultation record",
)
@router.post(
    "/book",
    response_model=DoctorAppointmentResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def create_consultation(
    payload: DoctorAppointmentCreate,
    service: ConsultationService = Depends(get_consultation_service),
    current_user: User = Depends(get_current_user),
):
    """Books a doctor appointment for the authenticated user."""
    return service.book_appointment(payload, actor=current_user)


@router.get(
    "/{consultation_id}",
    response_model=DoctorAppointmentResponse,
    summary="Get single consultation detail",
)
def get_consultation_detail(
    consultation_id: str,
    service: ConsultationService = Depends(get_consultation_service),
    current_user: User = Depends(get_current_user),
):
    """Retrieves an owned consultation record by ID."""
    return service.get_appointment(appointment_id=consultation_id, actor=current_user)


@router.patch(
    "/{consultation_id}",
    response_model=DoctorAppointmentResponse,
    summary="Update owned consultation",
)
def update_consultation(
    consultation_id: str,
    payload: DoctorAppointmentUpdate,
    service: ConsultationService = Depends(get_consultation_service),
    current_user: User = Depends(get_current_user),
):
    """Updates mutable fields on an owned consultation."""
    return service.update_appointment(
        appointment_id=consultation_id, request=payload, actor=current_user
    )


@router.delete(
    "/{consultation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete owned consultation",
)
def delete_consultation(
    consultation_id: str,
    service: ConsultationService = Depends(get_consultation_service),
    current_user: User = Depends(get_current_user),
):
    """Deletes an owned consultation record."""
    service.delete_appointment(appointment_id=consultation_id, actor=current_user)


@router.get(
    "/user/{user_id}",
    response_model=List[DoctorAppointmentResponse],
    include_in_schema=False,
)
def get_user_consultations(
    user_id: str,
    limit: int = Query(50, ge=1, le=100),
    service: ConsultationService = Depends(get_consultation_service),
    current_user: User = Depends(get_current_user),
):
    """Backward compatibility route retrieving appointments."""
    return service.get_user_appointments(user_id=user_id, actor=current_user, limit=limit)
