import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    public_id = Column(
        String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False
    )
    email = Column(String(255), unique=True, index=True, nullable=False)
    email_normalized = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)

    role = Column(String(50), default="user", nullable=False)  # "user", "admin"
    status = Column(
        String(50), default="active", nullable=False
    )  # "active", "disabled", "pending_verification"

    expected_due_date = Column(String(50), nullable=True)
    pregnancy_week = Column(Integer, default=0)
    previous_pregnancies = Column(Integer, default=0)
    phone = Column(String(50), nullable=True)
    age = Column(Integer, nullable=True)
    blood_group = Column(String(10), nullable=True)
    emergency_contact = Column(String(100), nullable=True)

    email_verified_at = Column(DateTime, nullable=True)
    last_login_at = Column(DateTime, nullable=True)
    password_changed_at = Column(DateTime, nullable=True)

    @property
    def is_email_verified(self) -> bool:
        return self.email_verified_at is not None

    @is_email_verified.setter
    def is_email_verified(self, value: bool) -> None:
        if value:
            self.email_verified_at = datetime.utcnow()
        else:
            self.email_verified_at = None

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    auth_tokens = relationship("AuthToken", back_populates="user", cascade="all, delete-orphan")
    background_jobs = relationship(
        "BackgroundJob", back_populates="user", cascade="all, delete-orphan"
    )
    risk_assessments = relationship(
        "RiskAssessment", back_populates="user", cascade="all, delete-orphan"
    )
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    appointments = relationship(
        "DoctorAppointment", back_populates="user", cascade="all, delete-orphan"
    )
    conversations = relationship(
        "ChatConversation", back_populates="user", cascade="all, delete-orphan"
    )
