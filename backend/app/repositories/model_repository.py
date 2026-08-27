import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.repositories.base import BaseRepository
from app.models.model_version import ModelVersion
from app.core.exceptions import MLArtifactChecksumError

logger = logging.getLogger("matrigluco.repositories.model")


class ModelRepository(BaseRepository[ModelVersion]):
    """
    Data access repository for versioned ML model registry records in MySQL.
    Guarantees artifact immutability and metadata integrity.
    """

    def __init__(self, db: Session):
        super().__init__(ModelVersion, db)

    def get_by_key_and_version(self, model_key: str, version: str) -> Optional[ModelVersion]:
        stmt = select(ModelVersion).where(
            ModelVersion.model_key == model_key,
            ModelVersion.version == version,
        )
        return self.db.scalars(stmt).first()

    def get_active_model(self, model_key: str = "diabetes-risk") -> Optional[ModelVersion]:
        stmt = (
            select(ModelVersion)
            .where(
                ModelVersion.model_key == model_key,
                ModelVersion.is_active == True,  # noqa: E712
            )
            .order_by(ModelVersion.registered_at.desc())
        )
        return self.db.scalars(stmt).first()

    get_active_version = get_active_model

    def register_model_version(
        self,
        model_key: str,
        version: str,
        artifact_path: str,
        metadata_path: str,
        framework: str = "scikit-learn",
        model_class: Optional[str] = "sklearn.linear_model.LogisticRegression",
        preprocessor_class: Optional[str] = "sklearn.preprocessing.StandardScaler",
        feature_contract_version: str = "1.0",
        model_checksum: Optional[str] = None,
        preprocessor_checksum: Optional[str] = None,
        feature_schema_sha256: Optional[str] = None,
        feature_order_json: Optional[List[str]] = None,
        thresholds_json: Optional[Dict[str, Any]] = None,
        metrics_json: Optional[Dict[str, Any]] = None,
        imputation_policy_json: Optional[Dict[str, Any]] = None,
        trained_at: Optional[datetime] = None,
        is_active: bool = True,
    ) -> ModelVersion:
        existing = self.get_by_key_and_version(model_key, version)
        if existing:
            # Immutability Protection: If version exists with different checksums, fail registration!
            if (
                model_checksum
                and existing.model_checksum
                and existing.model_checksum != model_checksum
            ):
                raise MLArtifactChecksumError(
                    message=(
                        f"Cannot overwrite registered model version '{model_key}:{version}' "
                        f"with differing model artifact SHA-256 checksum."
                    )
                )
            if (
                preprocessor_checksum
                and existing.preprocessor_checksum
                and existing.preprocessor_checksum != preprocessor_checksum
            ):
                raise MLArtifactChecksumError(
                    message=(
                        f"Cannot overwrite registered model version '{model_key}:{version}' "
                        f"with differing preprocessor artifact SHA-256 checksum."
                    )
                )

            existing.artifact_path = artifact_path
            existing.metadata_path = metadata_path
            existing.metrics_json = metrics_json or existing.metrics_json
            existing.imputation_policy_json = (
                imputation_policy_json or existing.imputation_policy_json
            )
            existing.is_active = is_active
            self.db.add(existing)
            return existing

        mv = ModelVersion(
            model_key=model_key,
            version=version,
            framework=framework,
            model_class=model_class,
            preprocessor_class=preprocessor_class,
            feature_contract_version=feature_contract_version,
            artifact_path=artifact_path,
            metadata_path=metadata_path,
            model_checksum=model_checksum,
            preprocessor_checksum=preprocessor_checksum,
            feature_schema_sha256=feature_schema_sha256,
            feature_order_json=feature_order_json,
            thresholds_json=thresholds_json,
            metrics_json=metrics_json,
            imputation_policy_json=imputation_policy_json,
            is_active=is_active,
            trained_at=trained_at,
            registered_at=datetime.now(timezone.utc),
            activated_at=datetime.now(timezone.utc) if is_active else None,
        )
        self.db.add(mv)
        return mv
