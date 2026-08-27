from typing import List, Optional
from datetime import date
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.consultation import DoctorAppointment


class DoctorAppointmentRepository(BaseRepository[DoctorAppointment]):
    """
    SQLAlchemy repository for doctor appointments and consultations.
    Provides explicit ownership-scoped queries for patient privacy.
    """

    def __init__(self, db: Session):
        super().__init__(DoctorAppointment, db)

    def get_owned(self, appointment_id: str, owner_user_id: str) -> Optional[DoctorAppointment]:
        """Fetch single appointment constrained to owning patient."""
        stmt = select(DoctorAppointment).where(
            DoctorAppointment.id == appointment_id,
            DoctorAppointment.user_id == owner_user_id,
        )
        return self.db.scalars(stmt).first()

    def list_owned(
        self, owner_user_id: str, skip: int = 0, limit: int = 50
    ) -> List[DoctorAppointment]:
        """List scheduled appointments constrained to owning patient."""
        stmt = (
            select(DoctorAppointment)
            .where(DoctorAppointment.user_id == owner_user_id)
            .order_by(DoctorAppointment.appointment_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get_by_user(self, user_id: str, skip: int = 0, limit: int = 50) -> List[DoctorAppointment]:
        """Alias for list_owned."""
        return self.list_owned(user_id, skip=skip, limit=limit)

    def get_upcoming(self, user_id: str) -> Optional[DoctorAppointment]:
        """Fetch the earliest upcoming scheduled appointment."""
        today = date.today()
        stmt = (
            select(DoctorAppointment)
            .where(
                DoctorAppointment.user_id == user_id,
                DoctorAppointment.appointment_date >= today,
            )
            .order_by(DoctorAppointment.appointment_date.asc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()


ConsultationRepository = DoctorAppointmentRepository
