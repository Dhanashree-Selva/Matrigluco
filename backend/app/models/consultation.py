import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class DoctorAppointment(Base):
    __tablename__ = "doctor_appointments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    patient_name = Column(String(255), nullable=False)
    doctor_name = Column(String(255), nullable=False)
    consultation_type = Column(String(100), nullable=True)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(String(50), nullable=False)
    symptoms = Column(Text, nullable=True)
    status = Column(String(50), default="booked")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="appointments")
