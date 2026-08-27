"""Health Measurements and Telemetry Schema

Revision ID: 006_health_measurements
Revises: 005_audit_security_consent
Create Date: 2026-08-17 18:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "006_health_measurements"
down_revision: Union[str, None] = "005_audit_security_consent"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "health_measurements",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("public_id", sa.String(36), nullable=False, unique=True),
        sa.Column(
            "user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("pregnancy_profile_id", sa.String(36), nullable=True),
        sa.Column("metric_type", sa.String(50), nullable=False),
        sa.Column("value_primary", sa.Float(), nullable=False),
        sa.Column("value_secondary", sa.Float(), nullable=True),
        sa.Column("unit", sa.String(30), nullable=False),
        sa.Column("measured_at", sa.DateTime(), nullable=False),
        sa.Column("source", sa.String(50), nullable=False, server_default="manual"),
        sa.Column("notes", sa.Text(), nullable=True),
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
    op.create_index("ix_health_measurements_public_id", "health_measurements", ["public_id"])
    op.create_index("ix_health_measurements_user_id", "health_measurements", ["user_id"])
    op.create_index(
        "ix_health_measurements_pregnancy_profile_id",
        "health_measurements",
        ["pregnancy_profile_id"],
    )
    op.create_index("ix_health_measurements_metric_type", "health_measurements", ["metric_type"])
    op.create_index("ix_health_measurements_measured_at", "health_measurements", ["measured_at"])
    op.create_index(
        "ix_health_measurements_user_metric_measured",
        "health_measurements",
        ["user_id", "metric_type", "measured_at"],
    )


def downgrade() -> None:
    op.drop_table("health_measurements")
