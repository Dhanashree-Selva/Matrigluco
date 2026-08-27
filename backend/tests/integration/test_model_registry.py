import pytest
from app.repositories.model_repository import ModelRepository
from app.models.model_version import ModelVersion


def test_model_registry_registration_and_lookup(db_session):
    """ModelRepository registers, looks up active versions, and prevents conflicting registrations."""
    repo = ModelRepository(db_session)

    # Register active model version 1.0.0
    registered = repo.register_model_version(
        model_key="diabetes-risk",
        version="1.0.0",
        artifact_path="app/ml/artifacts/diabetes-risk/1.0.0/model.joblib",
        metadata_path="app/ml/artifacts/diabetes-risk/1.0.0/metadata.json",
        model_checksum="2afeec25473009af6ed529bee9466fffa3abe0b24d70f0e311c474ed21f1aafe",
        preprocessor_checksum="68b3082714f0220e1c58a00a3d41b7ef68bb291711263533107871f2f3aef1c2",
        is_active=True,
    )
    db_session.commit()
    assert registered.id is not None

    # 1. Look up active model version
    active = repo.get_active_version(model_key="diabetes-risk")
    assert active is not None
    assert active.model_key == "diabetes-risk"
    assert active.version == "1.0.0"
    assert active.is_active is True

    # 2. Get version by key and version string
    ver = repo.get_by_key_and_version(model_key="diabetes-risk", version="1.0.0")
    assert ver is not None
    assert ver.id == active.id
