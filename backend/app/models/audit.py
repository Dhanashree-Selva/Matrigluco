import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class AuditLog(Base):
    """
    Append-only audit trail logging legitimate high-value business actions:
    ACCOUNT_CREATED, PROFILE_UPDATED, PREGNANCY_CREATED, RISK_ASSESSMENT_CREATED,
    REPORT_UPLOADED, REPORT_DELETED, PRIVATE_FILE_DOWNLOADED, CONSULTATION_CREATED,
    NOTIFICATION_READ, CONSENT_ACCEPTED, CONSENT_WITHDRAWN.
    """

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    public_id = Column(
        String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False
    )
    actor_user_id = Column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    event_type = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(50), nullable=True, index=True)
    resource_id = Column(String(100), nullable=True, index=True)
    outcome = Column(String(30), default="success", nullable=False)  # success, failure
    request_id = Column(String(64), nullable=True, index=True)

    safe_metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    actor = relationship("User", foreign_keys=[actor_user_id])


class SecurityEvent(Base):
    """
    Append-only security event trail logging suspicious/authentication/security behaviors:
    AUTH_LOGIN_FAILURE, AUTH_REFRESH_REUSE_DETECTED, AUTH_INVALID_TOKEN, AUTH_RATE_LIMITED,
    AUTHORIZATION_DENIED, IDOR_PATTERN_DETECTED, UPLOAD_REJECTED, OCR_CONSENT_MISSING,
    SECURITY_CONFIGURATION_ERROR.
    """

    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    public_id = Column(
        String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False
    )
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    event_type = Column(String(100), nullable=False, index=True)
    severity = Column(
        String(20), default="warning", nullable=False, index=True
    )  # info, warning, high, critical

    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(100), nullable=True)

    request_id = Column(String(64), nullable=True, index=True)
    ip_hash = Column(String(64), nullable=True, index=True)
    user_agent_summary = Column(String(255), nullable=True)

    safe_metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", foreign_keys=[user_id])


# Legacy alias for backward compatibility
SecurityAuditEvent = SecurityEvent
