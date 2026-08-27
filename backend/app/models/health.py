import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class HealthMeasurement(Base):
    """
    Authoritative MySQL persistence model for patient health telemetry (glucose, blood pressure, weight, BMI, HbA1c).
    Blood pressure strictly stores systolic in value_primary and diastolic in value_secondary.
    """

    __tablename__ = "health_measurements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    public_id = Column(
        String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False
    )
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    pregnancy_profile_id = Column(String(36), nullable=True, index=True)

    metric_type = Column(
        String(50), nullable=False, index=True
    )  # glucose, blood_pressure, weight, bmi, hba1c
    value_primary = Column(Float, nullable=False)
    value_secondary = Column(Float, nullable=True)  # For blood pressure diastolic

    unit = Column(String(30), nullable=False)  # mg/dL, mmHg, kg, kg/m², %
    measured_at = Column(DateTime, nullable=False, index=True)
    source = Column(
        String(50), default="manual", nullable=False
    )  # manual, report_extraction, device
    notes = Column(Text, nullable=True)
    archived_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship to user
    user = relationship("User", backref="health_measurements")

    __table_args__ = (
        Index(
            "ix_health_measurements_user_metric_measured", "user_id", "metric_type", "measured_at"
        ),
    )
