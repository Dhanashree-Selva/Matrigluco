"""ML Model Registry and Risk Assessment Feature Provenance Schema

Revision ID: 002_ml_predictions
Revises: 001_auth_sessions
Create Date: 2026-08-17 14:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "002_ml_predictions"
down_revision: Union[str, None] = "001_auth_sessions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Create Model Versions Registry Table ──
    op.create_table(
        "model_versions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("public_id", sa.String(36), nullable=False, unique=True),
        sa.Column("model_key", sa.String(100), nullable=False),
        sa.Column("version", sa.String(50), nullable=False),
        sa.Column("framework", sa.String(50), nullable=False, server_default="scikit-learn"),
        sa.Column("feature_contract_version", sa.String(50), nullable=False, server_default="1.0"),
        sa.Column("artifact_path", sa.String(255), nullable=False),
        sa.Column("metadata_path", sa.String(255), nullable=False),
        sa.Column("model_checksum", sa.String(64), nullable=True),
        sa.Column("preprocessor_checksum", sa.String(64), nullable=True),
        sa.Column("feature_order_json", sa.JSON(), nullable=True),
        sa.Column("thresholds_json", sa.JSON(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("registered_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("activated_at", sa.DateTime(), nullable=True),
        sa.Column("retired_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("model_key", "version", name="uq_model_key_version"),
    )
    op.create_index("ix_model_versions_public_id", "model_versions", ["public_id"])
    op.create_index("ix_model_versions_model_key", "model_versions", ["model_key"])
    op.create_index("ix_model_versions_version", "model_versions", ["version"])

    # ── 2. Create Risk Assessments Table ──
    op.create_table(
        "risk_assessments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("public_id", sa.String(36), nullable=False, unique=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column(
            "model_version_id",
            sa.String(36),
            sa.ForeignKey("model_versions.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("source", sa.String(50), nullable=False, server_default="manual"),
        sa.Column("probability", sa.Float(), nullable=False),
        sa.Column("risk_band", sa.String(30), nullable=False),
        sa.Column("prediction_result", sa.String(50), nullable=False),
        sa.Column("assessment_status", sa.String(30), nullable=False, server_default="completed"),
        sa.Column("archived_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_risk_assessments_public_id", "risk_assessments", ["public_id"])
    op.create_index("ix_risk_assessments_user_id", "risk_assessments", ["user_id"])
    op.create_index(
        "ix_risk_assessments_model_version_id", "risk_assessments", ["model_version_id"]
    )
    op.create_index("ix_risk_assessments_created_at", "risk_assessments", ["created_at"])

    # ── 3. Create Risk Assessment Features Table (Provenance) ──
    op.create_table(
        "risk_assessment_features",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "risk_assessment_id",
            sa.String(36),
            sa.ForeignKey("risk_assessments.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("feature_name", sa.String(50), nullable=False),
        sa.Column("feature_value", sa.Float(), nullable=False),
        sa.Column("feature_order", sa.Integer(), nullable=False),
        sa.Column("source_type", sa.String(50), nullable=False, server_default="provided"),
        sa.Column("source_reference", sa.String(100), nullable=True),
        sa.Column("unit", sa.String(20), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint(
            "risk_assessment_id", "feature_name", name="uq_assessment_feature_name"
        ),
        sa.UniqueConstraint(
            "risk_assessment_id", "feature_order", name="uq_assessment_feature_order"
        ),
    )
    op.create_index(
        "ix_risk_assessment_features_risk_assessment_id",
        "risk_assessment_features",
        ["risk_assessment_id"],
    )


def downgrade() -> None:
    op.drop_table("risk_assessment_features")
    op.drop_table("risk_assessments")
    op.drop_table("model_versions")
