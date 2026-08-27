import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from app.db.base import Base


class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_key = Column(String(80), unique=True, nullable=False)
    display_name = Column(String(120), nullable=False)
    version = Column(String(40), nullable=False)
    provider = Column(String(40), nullable=False, default="llama.cpp")
    format = Column(String(20), nullable=False, default="GGUF")
    artifact_path = Column(String(500), nullable=False)
    context_length = Column(Integer, nullable=False, default=4096)
    quantization = Column(String(30), nullable=True, default="Q4_K_M")
    is_default = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
