import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    DateTime,
    Integer,
    JSON,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.db.base import Base


class Notification(Base):
    """
    Durable in-app notification inbox row.
    Authoritative notification state; independent of external email delivery.
    """

    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="system", nullable=False, index=True)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(36), nullable=True)
    dedupe_key = Column(String(255), nullable=True, unique=True, index=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)
    email_status = Column(String(50), default="not_requested", nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False,
        index=True,
    )

    user = relationship("User", backref="notifications")


class NotificationPreference(Base):
    """
    User notification preferences governing optional reminders and delivery channels.
    """

    __tablename__ = "notification_preferences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    consultation_reminders_enabled = Column(Boolean, default=True, nullable=False)
    risk_notifications_enabled = Column(Boolean, default=True, nullable=False)
    daily_summary_notifications_enabled = Column(Boolean, default=True, nullable=False)
    email_notifications_enabled = Column(Boolean, default=True, nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False,
    )

    user = relationship("User", backref="notification_preference")


class DailyHealthSummary(Base):
    """
    Durable daily aggregation of patient health measurements and risk status.
    Scoped to the user's local calendar day converted to UTC query bounds.
    """

    __tablename__ = "daily_health_summaries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    summary_date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    summary_version = Column(String(20), default="1.0.0", nullable=False)
    measurement_count = Column(Integer, default=0, nullable=False)
    summary_payload = Column(JSON, nullable=True)
    generated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id", "summary_date", "summary_version", name="uq_daily_summaries_user_date_ver"
        ),
    )

    user = relationship("User", backref="daily_health_summaries")
