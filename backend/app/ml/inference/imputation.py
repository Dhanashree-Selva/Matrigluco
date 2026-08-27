"""
Model Imputation Governance and Policy Module.

Governs missing-data handling for clinical ML risk prediction.
Missing feature values must NEVER be silently hard-coded or fabricated.
"""

from dataclasses import dataclass
from typing import Dict, Any, Optional, List, Tuple

from app.core.exceptions import MLFeatureIncompleteError

TupleResult = Tuple[Dict[str, float], Dict[str, Dict[str, Any]]]


@dataclass(frozen=True)
class ImputationPolicy:
    """Explicit versioned imputation policy for a registered model."""

    enabled: bool
    policy_version: Optional[str] = None
    strategy: Optional[str] = None  # e.g., "training_median", "iterative_knn"
    imputed_features: Optional[Dict[str, float]] = None


# Default policy for active diabetes-risk:1.0.0 model
# StandardScaler cannot impute missing values; imputation is strictly disabled by default.
DEFAULT_IMPUTATION_POLICY = ImputationPolicy(
    enabled=False,
    policy_version=None,
    strategy=None,
    imputed_features=None,
)


class ImputationEngine:
    """
    Evaluates missing feature handling against the active model's versioned imputation policy.
    """

    def __init__(self, policy: Optional[ImputationPolicy] = None):
        self.policy = policy or DEFAULT_IMPUTATION_POLICY

    def handle_missing_features(
        self,
        present_features: Dict[str, float],
        missing_features: List[str],
    ) -> TupleResult:
        """
        Processes missing features under the active policy.

        Raises:
            MLFeatureIncompleteError: If imputation is disabled or any missing feature has no approved imputation rule.
        """
        if not missing_features:
            return present_features, {}

        if not self.policy.enabled:
            raise MLFeatureIncompleteError(
                missing_features=missing_features,
                message=(
                    f"Clinical risk assessment rejected: missing required features {missing_features}. "
                    "Imputation is disabled for this model version to protect data integrity."
                ),
            )

        # If policy is enabled, resolve each missing feature
        resolved = dict(present_features)
        imputation_metadata: Dict[str, Dict[str, Any]] = {}
        unresolved: List[str] = []

        for feat in missing_features:
            if self.policy.imputed_features and feat in self.policy.imputed_features:
                val = self.policy.imputed_features[feat]
                resolved[feat] = val
                imputation_metadata[feat] = {
                    "is_imputed": True,
                    "imputation_strategy": self.policy.strategy,
                    "imputation_policy_version": self.policy.policy_version,
                }
            else:
                unresolved.append(feat)

        if unresolved:
            raise MLFeatureIncompleteError(
                missing_features=unresolved,
                message=f"Missing required features {unresolved} cannot be imputed under policy {self.policy.policy_version}.",
            )

        return resolved, imputation_metadata
