import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    document_type = Column(String(64), nullable=False)
    source_author = Column(String(120), nullable=True)
    version = Column(String(32), nullable=False, default="1.0.0")
    file_path = Column(String(500), nullable=True)
    total_chunks = Column(Integer, nullable=False, default=0)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    chunks = relationship("KnowledgeChunk", back_populates="document", cascade="all, delete-orphan")
