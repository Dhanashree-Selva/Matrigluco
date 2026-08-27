import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class UserSession(Base):
    """
    Persisted refresh token session model supporting atomic token rotation,
    token family tracking, and reuse detection.
    Raw refresh tokens are NEVER persisted; only SHA-256 hashes are stored.
    """

    __tablename__ = "user_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    public_id = Column(
        String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False
    )
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    token_family_id = Column(String(36), index=True, nullable=False)
    status = Column(
        String(30), default="active", nullable=False
    )  # active, rotated, revoked, compromised

    expires_at = Column(DateTime, nullable=False, index=True)
    last_used_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    revocation_reason = Column(String(100), nullable=True)

    user_agent = Column(String(500), nullable=True)
    ip_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="sessions")


class AuthToken(Base):
    """
    One-time opaque authentication token model for password resets and email verifications.
    Only SHA-256 hashes are stored. Tokens become invalid once consumed or expired.
    """

    __tablename__ = "auth_tokens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    public_id = Column(
        String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True, nullable=False
    )
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    token_type = Column(
        String(50), nullable=False, index=True
    )  # password_reset, email_verification

    expires_at = Column(DateTime, nullable=False, index=True)
    consumed_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="auth_tokens")
