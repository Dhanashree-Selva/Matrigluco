import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    public_id = Column(
        String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()), index=True
    )
    model_key = Column(String(100), nullable=False, index=True)
    version = Column(String(50), nullable=False, index=True)
    framework = Column(String(50), nullable=False, default="scikit-learn")
    model_class = Column(
        String(100), nullable=True, default="sklearn.linear_model.LogisticRegression"
    )
    preprocessor_class = Column(
        String(100), nullable=True, default="sklearn.preprocessing.StandardScaler"
    )
    feature_contract_version = Column(String(50), nullable=False, default="1.0")
    artifact_path = Column(String(255), nullable=False)
    metadata_path = Column(String(255), nullable=False)
    model_checksum = Column(String(64), nullable=True)
    preprocessor_checksum = Column(String(64), nullable=True)
    feature_schema_sha256 = Column(String(64), nullable=True)
    feature_order_json = Column(JSON, nullable=True)
    thresholds_json = Column(JSON, nullable=True)
    metrics_json = Column(JSON, nullable=True)
    imputation_policy_json = Column(JSON, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    trained_at = Column(DateTime, nullable=True)
    registered_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    activated_at = Column(DateTime, nullable=True)
    retired_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("model_key", "version", name="uq_model_key_version"),)

    assessments = relationship("RiskAssessment", back_populates="model_version")
