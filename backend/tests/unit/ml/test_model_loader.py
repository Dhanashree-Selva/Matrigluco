import pytest
from pathlib import Path
from app.ml.inference.model_loader import MLModelLoader, LoadedModelBundle
from app.core.exceptions import MLModelNotFoundError, MLArtifactChecksumError


def test_model_loader_loads_production_bundle():
    """Loads and verifies production diabetes-risk:1.0.0 model bundle."""
    loader = MLModelLoader()
    bundle = loader.get_bundle("diabetes-risk", "1.0.0")

    assert isinstance(bundle, LoadedModelBundle)
    assert bundle.model_key == "diabetes-risk"
    assert bundle.version == "1.0.0"
    assert hasattr(bundle.model, "predict_proba")
    assert hasattr(bundle.preprocessor, "transform")
    assert bundle.positive_class_idx in [0, 1]
    assert len(bundle.model_sha256) == 64
    assert len(bundle.preprocessor_sha256) == 64


def test_model_loader_caching():
    """Consecutive calls return the exact same in-process cached instance."""
    loader = MLModelLoader()
    bundle1 = loader.get_bundle("diabetes-risk", "1.0.0")
    bundle2 = loader.get_bundle("diabetes-risk", "1.0.0")

    assert bundle1 is bundle2


def test_model_loader_missing_version_raises():
    """Non-existent version raises MLModelNotFoundError."""
    loader = MLModelLoader()
    with pytest.raises(MLModelNotFoundError):
        loader.get_bundle("diabetes-risk", "99.99.99")
