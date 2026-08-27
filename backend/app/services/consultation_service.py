import logging
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.consultation_repository import DoctorAppointmentRepository
from app.models.consultation import DoctorAppointment
from app.models.user import User
from app.schemas.consultation import (
    DoctorAppointmentCreate,
    DoctorAppointmentUpdate,
    DoctorAppointmentResponse,
)
from app.core.exceptions import AuthorizationError, ResourceNotFoundError

logger = logging.getLogger("matrigluco.services.consultation")


class ConsultationService:
    """
    Application service managing doctor appointments and telehealth bookings.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = DoctorAppointmentRepository(db)

    def book_appointment(
        self, request: DoctorAppointmentCreate, actor: User
    ) -> DoctorAppointmentResponse:
        """Books consultation with transaction management and strict actor scoping."""
        app_date = (
            datetime.strptime(request.appointment_date, "%Y-%m-%d").date()
            if isinstance(request.appointment_date, str)
            else request.appointment_date
        )

        appointment = DoctorAppointment(
            user_id=actor.id,
            patient_name=request.patient_name,
            doctor_name=request.doctor_name,
            consultation_type=request.consultation_type,
            appointment_date=app_date,
            appointment_time=request.appointment_time,
            symptoms=request.symptoms,
            status=request.status or "booked",
        )

        try:
            saved = self.repo.create(appointment)
            return DoctorAppointmentResponse.model_validate(saved)
        except Exception as e:
            logger.error(f"Failed to book appointment: {e}")
            self.db.rollback()
            raise

    def get_appointment(self, appointment_id: str, actor: User) -> DoctorAppointmentResponse:
        """Retrieves single appointment enforcing ownership."""
        appointment = self.repo.get_owned(appointment_id=appointment_id, owner_user_id=actor.id)
        if not appointment:
            raise ResourceNotFoundError(resource="DoctorAppointment", identifier=appointment_id)
        return DoctorAppointmentResponse.model_validate(appointment)

    def update_appointment(
        self, appointment_id: str, request: DoctorAppointmentUpdate, actor: User
    ) -> DoctorAppointmentResponse:
        """Updates appointment fields with ownership validation."""
        appointment = self.repo.get_owned(appointment_id=appointment_id, owner_user_id=actor.id)
        if not appointment:
            raise ResourceNotFoundError(resource="DoctorAppointment", identifier=appointment_id)

        update_dict = request.model_dump(exclude_unset=True)
        if "appointment_date" in update_dict and isinstance(update_dict["appointment_date"], str):
            update_dict["appointment_date"] = datetime.strptime(
                update_dict["appointment_date"], "%Y-%m-%d"
            ).date()

        for field, val in update_dict.items():
            setattr(appointment, field, val)

        self.db.add(appointment)
        self.db.commit()
        self.db.refresh(appointment)
        return DoctorAppointmentResponse.model_validate(appointment)

    def delete_appointment(self, appointment_id: str, actor: User) -> None:
        """Deletes/cancels owned appointment."""
        appointment = self.repo.get_owned(appointment_id=appointment_id, owner_user_id=actor.id)
        if not appointment:
            raise ResourceNotFoundError(resource="DoctorAppointment", identifier=appointment_id)

        self.repo.delete(appointment_id)

    def get_user_appointments(
        self, user_id: str, actor: Optional[User] = None, skip: int = 0, limit: int = 50
    ) -> List[DoctorAppointmentResponse]:
        """Queries appointments with ownership authorization."""
        if actor and actor.id != user_id:
            raise AuthorizationError("Access denied: cannot view another patient's appointments.")

        records = self.repo.list_owned(user_id, skip=skip, limit=limit)
        return [DoctorAppointmentResponse.model_validate(r) for r in records]
