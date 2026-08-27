import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class FileAsset(Base):
    """
    Durable metadata registry for private application files (medical reports, avatars, documents).
    Authoritative storage metadata; binary content is stored privately on disk / object storage.
    """

    __tablename__ = "file_assets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    storage_provider = Column(String(50), default="local", nullable=False)
    storage_key = Column(String(500), nullable=False, index=True)
    original_filename = Column(String(255), nullable=True)
    mime_type = Column(String(100), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    sha256 = Column(String(64), nullable=False, index=True)
    category = Column(String(50), default="medical_report", nullable=False, index=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False
    )
    deleted_at = Column(DateTime, nullable=True, index=True)

    __table_args__ = (
        UniqueConstraint("storage_provider", "storage_key", name="uq_file_assets_provider_key"),
    )

    user = relationship("User", backref="file_assets")
