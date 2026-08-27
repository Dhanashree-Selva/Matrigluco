import pytest
from app.db.base import Base
from app.models.health import HealthMeasurement


def test_health_measurements_composite_index_exists():
    """Verifies that the composite index on (user_id, metric_type, measured_at) exists."""
    table = Base.metadata.tables["health_measurements"]

    found = False
    for idx in table.indexes:
        col_names = [c.name for c in idx.columns]
        if "user_id" in col_names and "metric_type" in col_names and "measured_at" in col_names:
            found = True
            break

    assert found is True, (
        "Composite index on (user_id, metric_type, measured_at) must exist in SQLAlchemy metadata."
    )
