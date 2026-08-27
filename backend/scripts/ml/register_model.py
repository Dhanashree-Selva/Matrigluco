#!/usr/bin/env python
"""
Administrative script to register and verify production ML model artifacts in the database registry.
Enforces model governance, SHA-256 checksums, feature schema hash, and evaluation metrics validation.
"""

import sys
import json
import logging
from pathlib import Path

# Add backend root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.db.session import SessionLocal
from app.core.config import get_settings
from app.ml.inference.model_loader import ml_model_loader
from app.ml.inference.feature_contract import MODEL_FEATURE_ORDER
from app.repositories.model_repository import ModelRepository

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(levelname)s] %(message)s")
logger = logging.getLogger("matrigluco.scripts.register_model")


def register_production_model(model_key: str = "diabetes-risk", version: str = "1.0.0") -> None:
    logger.info(f"Starting governance validation and registration for '{model_key}:{version}'...")

    # 1. Load and verify bundle with checksums and schema integrity
    bundle = ml_model_loader.get_bundle(model_key=model_key, version=version)
    meta = bundle.metadata

    logger.info(f"Verified artifacts for '{model_key}:{version}':")
    logger.info(f"  - Model SHA-256: {bundle.model_sha256}")
    logger.info(f"  - Preprocessor SHA-256: {bundle.preprocessor_sha256}")
    logger.info(f"  - Feature Schema SHA-256: {bundle.feature_schema_sha256}")
    logger.info(f"  - Positive Class Index: {bundle.positive_class_idx}")
    logger.info(f"  - Evaluation Metrics: {meta.get('metrics')}")
    logger.info(f"  - Imputation Policy: {meta.get('imputation_policy')}")

    # 2. Persist in MySQL model_versions registry
    db = SessionLocal()
    try:
        repo = ModelRepository(db)
        mv = repo.register_model_version(
            model_key=model_key,
            version=version,
            framework=meta.get("framework", "scikit-learn"),
            model_class=meta.get("model_class", "sklearn.linear_model.LogisticRegression"),
            preprocessor_class=meta.get(
                "preprocessor_class", "sklearn.preprocessing.StandardScaler"
            ),
            feature_contract_version=meta.get("feature_contract_version", "1.0"),
            artifact_path=str(ml_model_loader.artifact_base_path / model_key / version),
            metadata_path=str(
                ml_model_loader.artifact_base_path / model_key / version / "metadata.json"
            ),
            model_checksum=bundle.model_sha256,
            preprocessor_checksum=bundle.preprocessor_sha256,
            feature_schema_sha256=bundle.feature_schema_sha256,
            feature_order_json=list(MODEL_FEATURE_ORDER),
            thresholds_json=meta.get("risk_thresholds"),
            metrics_json=meta.get("metrics"),
            imputation_policy_json=meta.get("imputation_policy"),
            trained_at=None,  # Legacy artifact - exact training timestamp unavailable
            is_active=True,
        )
        db.commit()
        logger.info(
            f"Successfully registered and verified model version '{mv.version}' in database (UUID: {mv.public_id})."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to register model version in database: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    register_production_model()
