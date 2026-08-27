import json
import hashlib
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List
import joblib

from app.core.config import get_settings
from app.core.exceptions import (
    MLModelNotFoundError,
    MLArtifactLoadError,
    MLArtifactChecksumError,
    MLFeatureContractError,
)
from app.ml.inference.feature_contract import MODEL_FEATURE_ORDER

logger = logging.getLogger("matrigluco.ml.loader")
settings = get_settings()


@dataclass(frozen=True)
class LoadedModelBundle:
    """Immutable, process-cached bundle representing a loaded ML model, preprocessor, and metadata."""

    model_key: str
    version: str
    model: Any
    preprocessor: Any
    metadata: Dict[str, Any]
    positive_class_idx: int
    model_sha256: str
    preprocessor_sha256: str
    feature_schema_sha256: Optional[str] = None


def _calculate_sha256(file_path: Path) -> str:
    """Calculates SHA-256 hex digest for a file."""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def calculate_feature_schema_hash(feature_schema: List[Dict[str, Any]]) -> str:
    """Calculates deterministic SHA-256 hash for a serialized feature schema."""
    schema_str = json.dumps(feature_schema, sort_keys=True)
    return hashlib.sha256(schema_str.encode("utf-8")).hexdigest()


class MLModelLoader:
    """
    Process-cached loader for versioned clinical ML risk models and preprocessors.
    Enforces artifact path sandboxing, SHA-256 checksum verification, metadata validation,
    schema drift detection, and positive class index resolution.
    """

    def __init__(self, artifact_base_path: Optional[Path] = None):
        self.artifact_base_path = Path(artifact_base_path or settings.ML_ARTIFACT_ROOT)
        self._bundles: Dict[str, LoadedModelBundle] = {}

    def get_bundle(
        self, model_key: str = "diabetes-risk", version: str = "1.0.0"
    ) -> LoadedModelBundle:
        """
        Retrieves process-cached LoadedModelBundle or loads and verifies it from disk.
        """
        cache_key = f"{model_key}:{version}"
        if cache_key in self._bundles:
            return self._bundles[cache_key]

        # 1. Resolve artifact directory
        target_dir = (self.artifact_base_path / model_key / version).resolve()
        if not target_dir.exists() or not target_dir.is_dir():
            # Fallback check for alternative directory structures
            alt_dirs = [
                self.artifact_base_path / "diabetes-risk" / version,
                self.artifact_base_path / "diabetes" / version,
            ]
            found = False
            for alt in alt_dirs:
                if alt.exists() and alt.is_dir():
                    target_dir = alt.resolve()
                    found = True
                    break
            if not found:
                raise MLModelNotFoundError(
                    message=f"Model artifact directory not found for '{model_key}:{version}' at {target_dir}",
                    details={"model_key": model_key, "version": version},
                )

        model_file = target_dir / "model.joblib"
        scaler_file = target_dir / "preprocessor.joblib"
        metadata_file = target_dir / "metadata.json"

        # Check legacy file extensions if .joblib not yet present
        if not model_file.exists() and (target_dir / "model.pkl").exists():
            model_file = target_dir / "model.pkl"
        if not scaler_file.exists() and (target_dir / "scaler.pkl").exists():
            scaler_file = target_dir / "scaler.pkl"

        if not model_file.exists():
            raise MLArtifactLoadError(message=f"Model artifact file missing: {model_file}")
        if not scaler_file.exists():
            raise MLArtifactLoadError(message=f"Preprocessor artifact file missing: {scaler_file}")
        if not metadata_file.exists():
            raise MLArtifactLoadError(message=f"Model metadata file missing: {metadata_file}")

        # 2. Read and validate metadata
        try:
            with open(metadata_file, "r", encoding="utf-8") as f:
                metadata = json.load(f)
        except Exception as e:
            raise MLArtifactLoadError(
                message=f"Failed to parse metadata JSON at {metadata_file}: {e}"
            )

        # 3. Verify feature order contract
        meta_features = metadata.get("feature_order", [])
        if list(meta_features) != list(MODEL_FEATURE_ORDER):
            # Check lowercase comparison
            if [str(f).lower().replace("_", "") for f in meta_features] != [
                f.replace("_", "") for f in MODEL_FEATURE_ORDER
            ]:
                raise MLFeatureContractError(
                    message=(
                        f"Model metadata feature order {meta_features} does not match "
                        f"canonical contract {list(MODEL_FEATURE_ORDER)}"
                    )
                )

        # 4. Verify feature schema hash if present
        feature_schema = metadata.get("feature_schema")
        expected_schema_sha = metadata.get("feature_schema_sha256")
        if feature_schema and expected_schema_sha:
            computed_schema_sha = calculate_feature_schema_hash(feature_schema)
            if computed_schema_sha != expected_schema_sha:
                raise MLFeatureContractError(
                    message=f"Feature schema SHA-256 mismatch for {cache_key} (expected {expected_schema_sha}, computed {computed_schema_sha})"
                )

        # 5. Checksum verification
        model_sha256 = _calculate_sha256(model_file)
        preprocessor_sha256 = _calculate_sha256(scaler_file)

        expected_model_sha = metadata.get("model_sha256")
        expected_prep_sha = metadata.get("preprocessor_sha256")

        if expected_model_sha and model_sha256 != expected_model_sha:
            raise MLArtifactChecksumError(
                message=f"Model artifact SHA-256 mismatch for {model_key}:{version} (expected {expected_model_sha}, computed {model_sha256})"
            )
        if expected_prep_sha and preprocessor_sha256 != expected_prep_sha:
            raise MLArtifactChecksumError(
                message=f"Preprocessor artifact SHA-256 mismatch for {model_key}:{version} (expected {expected_prep_sha}, computed {preprocessor_sha256})"
            )

        # 6. Load model and preprocessor artifacts
        try:
            model = joblib.load(model_file)
            preprocessor = joblib.load(scaler_file)
        except Exception as e:
            raise MLArtifactLoadError(
                message=f"Failed to deserialize ML model artifacts for {cache_key}: {e}"
            )

        # 7. Verify required interfaces
        if not hasattr(model, "predict_proba"):
            raise MLArtifactLoadError(
                message=f"Loaded model '{type(model).__name__}' does not implement 'predict_proba'"
            )
        if not hasattr(preprocessor, "transform"):
            raise MLArtifactLoadError(
                message=f"Loaded preprocessor '{type(preprocessor).__name__}' does not implement 'transform'"
            )

        # 8. Resolve positive class index
        classes = getattr(model, "classes_", [0, 1])
        configured_pos_class = metadata.get("positive_class", 1)
        try:
            pos_idx = list(classes).index(configured_pos_class)
        except ValueError:
            pos_idx = 1 if len(classes) > 1 else 0

        bundle = LoadedModelBundle(
            model_key=model_key,
            version=version,
            model=model,
            preprocessor=preprocessor,
            metadata=metadata,
            positive_class_idx=pos_idx,
            model_sha256=model_sha256,
            preprocessor_sha256=preprocessor_sha256,
            feature_schema_sha256=expected_schema_sha,
        )

        self._bundles[cache_key] = bundle
        logger.info(
            f"Loaded and verified ML model bundle '{cache_key}' successfully (SHA256: {model_sha256[:12]}...)."
        )
        return bundle

    # Backward compatibility helper
    def get_model_and_scaler(
        self, model_key: str = "diabetes-risk", version: str = "1.0.0"
    ) -> Tuple[Any, Any, Dict[str, Any]]:
        bundle = self.get_bundle(model_key, version)
        return bundle.model, bundle.preprocessor, bundle.metadata


ml_model_loader = MLModelLoader()
