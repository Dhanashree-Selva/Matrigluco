import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from app.db.base import Base


class BackgroundJob(Base):
    __tablename__ = "background_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    public_id = Column(
        String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()), index=True
    )
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    job_type = Column(String(50), nullable=False, index=True)
    status = Column(String(30), nullable=False, default="pending", index=True)
    progress_percent = Column(Integer, nullable=False, default=0)
    progress_message = Column(String(255), nullable=True)
    celery_task_id = Column(String(100), nullable=True, index=True)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(36), nullable=True)
    error_code = Column(String(50), nullable=True)
    error_message = Column(String(255), nullable=True)

    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True
    )
    queued_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    failed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="background_jobs")

    __table_args__ = (Index("ix_background_jobs_user_status", "user_id", "status"),)
