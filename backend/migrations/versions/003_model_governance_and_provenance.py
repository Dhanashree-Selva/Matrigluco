"""Model Governance and Provenance Schema Extension

Revision ID: 003_model_governance
Revises: 002_ml_predictions
Create Date: 2026-08-17 15:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "003_model_governance"
down_revision: Union[str, None] = "002_ml_predictions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Model Versions Extensions ──
    op.add_column("model_versions", sa.Column("model_class", sa.String(100), nullable=True))
    op.add_column("model_versions", sa.Column("preprocessor_class", sa.String(100), nullable=True))
    op.add_column(
        "model_versions", sa.Column("feature_schema_sha256", sa.String(64), nullable=True)
    )
    op.add_column("model_versions", sa.Column("metrics_json", sa.JSON(), nullable=True))
    op.add_column("model_versions", sa.Column("imputation_policy_json", sa.JSON(), nullable=True))
    op.add_column("model_versions", sa.Column("trained_at", sa.DateTime(), nullable=True))

    # ── 2. Risk Assessments Extensions ──
    op.add_column(
        "risk_assessments",
        sa.Column("feature_contract_version", sa.String(50), nullable=False, server_default="1.0"),
    )
    op.add_column(
        "risk_assessments",
        sa.Column("mapping_version", sa.String(50), nullable=False, server_default="1.0"),
    )
    op.add_column("risk_assessments", sa.Column("input_snapshot_json", sa.JSON(), nullable=True))
    op.add_column(
        "risk_assessments",
        sa.Column(
            "contains_imputed_values", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
    )

    # ── 3. Risk Assessment Features Provenance Extensions ──
    op.add_column(
        "risk_assessment_features",
        sa.Column("normalized_value", sa.Float(), nullable=False, server_default="0.0"),
    )
    op.add_column("risk_assessment_features", sa.Column("raw_value", sa.Float(), nullable=True))
    op.add_column(
        "risk_assessment_features",
        sa.Column("is_derived", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "risk_assessment_features", sa.Column("derivation_method", sa.String(100), nullable=True)
    )
    op.add_column(
        "risk_assessment_features",
        sa.Column("is_imputed", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "risk_assessment_features", sa.Column("imputation_strategy", sa.String(50), nullable=True)
    )
    op.add_column(
        "risk_assessment_features",
        sa.Column("imputation_policy_version", sa.String(50), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("risk_assessment_features", "imputation_policy_version")
    op.drop_column("risk_assessment_features", "imputation_strategy")
    op.drop_column("risk_assessment_features", "is_imputed")
    op.drop_column("risk_assessment_features", "derivation_method")
    op.drop_column("risk_assessment_features", "is_derived")
    op.drop_column("risk_assessment_features", "raw_value")
    op.drop_column("risk_assessment_features", "normalized_value")

    op.drop_column("risk_assessments", "contains_imputed_values")
    op.drop_column("risk_assessments", "input_snapshot_json")
    op.drop_column("risk_assessments", "mapping_version")
    op.drop_column("risk_assessments", "feature_contract_version")

    op.drop_column("model_versions", "trained_at")
    op.drop_column("model_versions", "imputation_policy_json")
    op.drop_column("model_versions", "metrics_json")
    op.drop_column("model_versions", "feature_schema_sha256")
    op.drop_column("model_versions", "preprocessor_class")
    op.drop_column("model_versions", "model_class")
