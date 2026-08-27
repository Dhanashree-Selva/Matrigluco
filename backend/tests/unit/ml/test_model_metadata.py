import pytest
from sqlalchemy.orm import Session
from app.ml.inference.model_loader import ml_model_loader, calculate_feature_schema_hash
from app.repositories.model_repository import ModelRepository
from app.core.exceptions import MLArtifactChecksumError


def test_metadata_has_verified_evaluation_metrics():
    """Metadata contains genuine holdout evaluation metrics and dataset details."""
    bundle = ml_model_loader.get_bundle("diabetes-risk", "1.0.0")
    meta = bundle.metadata

    assert "metrics" in meta
    metrics = meta["metrics"]
    assert "accuracy" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "f1" in metrics
    assert "roc_auc" in metrics

    assert 0.70 <= metrics["accuracy"] <= 0.85
    assert 0.75 <= metrics["roc_auc"] <= 0.90

    assert "evaluation_dataset" in meta
    assert meta["evaluation_dataset"]["test_samples"] == 154


def test_feature_schema_hash_calculation():
    """Calculates deterministic SHA-256 for canonical feature schema."""
    schema = [
        {"name": "pregnancies", "order": 0, "dtype": "float", "unit": "count"},
        {"name": "glucose", "order": 1, "dtype": "float", "unit": "mg/dL"},
    ]
    hash1 = calculate_feature_schema_hash(schema)
    hash2 = calculate_feature_schema_hash(schema)
    assert hash1 == hash2
    assert len(hash1) == 64


def test_model_version_immutability_rejects_differing_checksum(db_session: Session):
    """Attempting to register an existing version with a different checksum raises MLArtifactChecksumError."""
    repo = ModelRepository(db_session)

    # First registration
    repo.register_model_version(
        model_key="test-model",
        version="1.0.0",
        artifact_path="/tmp/model.joblib",
        metadata_path="/tmp/metadata.json",
        model_checksum="sha256_original_checksum_1234567890abcdef",
    )
    db_session.commit()

    # Second registration with DIFFERENT checksum
    with pytest.raises(MLArtifactChecksumError):
        repo.register_model_version(
            model_key="test-model",
            version="1.0.0",
            artifact_path="/tmp/model.joblib",
            metadata_path="/tmp/metadata.json",
            model_checksum="sha256_DIFFERENT_tampered_checksum",
        )
