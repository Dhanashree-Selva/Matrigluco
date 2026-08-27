import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.base import Base


class ConsentRecord(Base):
    """
    Persisted patient consent record for privacy governance:
    Tracks consent types (e.g. third_party_ocr_processing), explicit policy versions,
    acceptance timestamps, and withdrawal timestamps.
    """

    __tablename__ = "consent_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    public_id = Column(
        String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False
    )
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    consent_type = Column(
        String(100), nullable=False, index=True
    )  # e.g. "third_party_ocr_processing"
    consent_version = Column(String(50), nullable=False)  # e.g. "ocr-third-party-v1"

    accepted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    withdrawn_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User")

    __table_args__ = (Index("ix_consent_user_type", "user_id", "consent_type"),)
