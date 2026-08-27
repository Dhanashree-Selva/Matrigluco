import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    JSON,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.db.base import Base


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    public_id = Column(
        String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()), index=True
    )
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    model_version_id = Column(
        String(36), ForeignKey("model_versions.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    source = Column(String(50), nullable=False, default="manual")
    probability = Column(Float, nullable=False)
    risk_band = Column(String(30), nullable=False)
    prediction_result = Column(String(50), nullable=False)
    assessment_status = Column(String(30), nullable=False, default="completed")
    feature_contract_version = Column(String(50), nullable=False, default="1.0")
    mapping_version = Column(String(50), nullable=False, default="1.0")
    input_snapshot_json = Column(JSON, nullable=True)
    contains_imputed_values = Column(Boolean, nullable=False, default=False)
    archived_at = Column(DateTime, nullable=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="risk_assessments")
    model_version = relationship("ModelVersion", back_populates="assessments")
    features = relationship(
        "RiskAssessmentFeature",
        back_populates="risk_assessment",
        cascade="all, delete-orphan",
        order_by="RiskAssessmentFeature.feature_order",
    )

    @property
    def probability_score(self) -> float:
        """Returns the probability as a score."""
        return float(self.probability) if self.probability is not None else 0.0



class RiskAssessmentFeature(Base):
    __tablename__ = "risk_assessment_features"

    id = Column(Integer, primary_key=True, autoincrement=True)
    risk_assessment_id = Column(
        String(36),
        ForeignKey("risk_assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    feature_name = Column(String(50), nullable=False)
    feature_value = Column(Float, nullable=False)  # backward compatible mirror of normalized_value
    normalized_value = Column(Float, nullable=False)
    raw_value = Column(Float, nullable=True)
    feature_order = Column(Integer, nullable=False)
    unit = Column(String(20), nullable=True)
    source_type = Column(String(50), nullable=False, default="manual")
    source_reference = Column(String(100), nullable=True)
    is_derived = Column(Boolean, nullable=False, default=False)
    derivation_method = Column(String(100), nullable=True)
    is_imputed = Column(Boolean, nullable=False, default=False)
    imputation_strategy = Column(String(50), nullable=True)
    imputation_policy_version = Column(String(50), nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("risk_assessment_id", "feature_name", name="uq_assessment_feature_name"),
        UniqueConstraint("risk_assessment_id", "feature_order", name="uq_assessment_feature_order"),
    )

    risk_assessment = relationship("RiskAssessment", back_populates="features")


# ─── Legacy Compatibility Model ───────────────────────────────────────────────


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    glucose = Column(Float, nullable=False)
    bmi = Column(Float, nullable=False)
    pregnancies = Column(Integer, default=0)
    blood_pressure = Column(Float, default=0.0)
    skin_thickness = Column(Float, default=0.0)
    insulin = Column(Float, default=0.0)
    diabetes_pedigree = Column(Float, default=0.0)
    age = Column(Integer, default=0)
    prediction_result = Column(String(50), nullable=False)
    risk_level = Column(String(50), nullable=False)
    probability_score = Column(Float, nullable=False)
    prediction_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="predictions")
