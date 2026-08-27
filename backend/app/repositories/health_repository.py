import logging
import uuid
from typing import Optional, List, Dict, Tuple
from datetime import datetime, timezone
from sqlalchemy import select, func, and_
from sqlalchemy.orm import Session

from app.models.health import HealthMeasurement
from app.repositories.base import BaseRepository

logger = logging.getLogger("matrigluco.repositories.health")


class HealthRepository(BaseRepository[HealthMeasurement]):
    """
    Data access repository for user health telemetry in MySQL.
    Strictly scopes all queries to authenticated `user_id`.
    """

    def __init__(self, db: Session):
        super().__init__(HealthMeasurement, db)

    def create_measurement(
        self,
        user_id: str,
        metric_type: str,
        value_primary: float,
        unit: str,
        measured_at: datetime,
        value_secondary: Optional[float] = None,
        pregnancy_profile_id: Optional[str] = None,
        source: str = "manual",
        notes: Optional[str] = None,
    ) -> HealthMeasurement:
        measurement = HealthMeasurement(
            id=str(uuid.uuid4()),
            public_id=str(uuid.uuid4()),
            user_id=str(user_id),
            pregnancy_profile_id=str(pregnancy_profile_id) if pregnancy_profile_id else None,
            metric_type=metric_type.strip().lower(),
            value_primary=value_primary,
            value_secondary=value_secondary,
            unit=unit.strip(),
            measured_at=measured_at,
            source=source,
            notes=notes,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        self.db.add(measurement)
        return measurement

    def get_owned_by_id(self, user_id: str, measurement_id: str) -> Optional[HealthMeasurement]:
        stmt = select(HealthMeasurement).where(
            and_(
                HealthMeasurement.user_id == str(user_id),
                (HealthMeasurement.id == str(measurement_id))
                | (HealthMeasurement.public_id == str(measurement_id)),
                HealthMeasurement.archived_at.is_(None),
            )
        )
        return self.db.scalars(stmt).first()

    def list_owned(
        self,
        user_id: str,
        metric_type: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        pregnancy_profile_id: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[HealthMeasurement], int]:
        filters = [
            HealthMeasurement.user_id == str(user_id),
            HealthMeasurement.archived_at.is_(None),
        ]
        if metric_type:
            filters.append(HealthMeasurement.metric_type == metric_type.strip().lower())
        if date_from:
            filters.append(HealthMeasurement.measured_at >= date_from)
        if date_to:
            filters.append(HealthMeasurement.measured_at <= date_to)
        if pregnancy_profile_id:
            filters.append(HealthMeasurement.pregnancy_profile_id == str(pregnancy_profile_id))

        # Total count
        count_stmt = select(func.count(HealthMeasurement.id)).where(and_(*filters))
        total = self.db.scalar(count_stmt) or 0

        # Paginated items
        offset = (page - 1) * page_size
        items_stmt = (
            select(HealthMeasurement)
            .where(and_(*filters))
            .order_by(HealthMeasurement.measured_at.desc(), HealthMeasurement.id.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = list(self.db.scalars(items_stmt).all())
        return items, total

    def update_measurement(
        self,
        measurement: HealthMeasurement,
        value_primary: Optional[float] = None,
        value_secondary: Optional[float] = None,
        unit: Optional[str] = None,
        measured_at: Optional[datetime] = None,
        pregnancy_profile_id: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> HealthMeasurement:
        if value_primary is not None:
            measurement.value_primary = value_primary
        if value_secondary is not None:
            measurement.value_secondary = value_secondary
        if unit is not None:
            measurement.unit = unit.strip()
        if measured_at is not None:
            measurement.measured_at = measured_at
        if pregnancy_profile_id is not None:
            measurement.pregnancy_profile_id = (
                str(pregnancy_profile_id) if pregnancy_profile_id else None
            )
        if notes is not None:
            measurement.notes = notes

        measurement.updated_at = datetime.now(timezone.utc)
        self.db.add(measurement)
        return measurement

    def archive_measurement(self, measurement: HealthMeasurement) -> None:
        measurement.archived_at = datetime.now(timezone.utc)
        self.db.add(measurement)

    def get_latest_by_metric(self, user_id: str, metric_type: str) -> Optional[HealthMeasurement]:
        stmt = (
            select(HealthMeasurement)
            .where(
                and_(
                    HealthMeasurement.user_id == str(user_id),
                    HealthMeasurement.metric_type == metric_type.strip().lower(),
                    HealthMeasurement.archived_at.is_(None),
                )
            )
            .order_by(HealthMeasurement.measured_at.desc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()

    def get_latest_across_metrics(
        self, user_id: str, metrics: List[str]
    ) -> Dict[str, HealthMeasurement]:
        result: Dict[str, HealthMeasurement] = {}
        for m in metrics:
            latest = self.get_latest_by_metric(user_id=user_id, metric_type=m)
            if latest:
                result[m] = latest
        return result

    def get_trend(
        self,
        user_id: str,
        metric_type: str,
        start_at: datetime,
        end_at: datetime,
        limit: int = 100,
    ) -> List[HealthMeasurement]:
        stmt = (
            select(HealthMeasurement)
            .where(
                and_(
                    HealthMeasurement.user_id == str(user_id),
                    HealthMeasurement.metric_type == metric_type.strip().lower(),
                    HealthMeasurement.measured_at >= start_at,
                    HealthMeasurement.measured_at <= end_at,
                    HealthMeasurement.archived_at.is_(None),
                )
            )
            .order_by(HealthMeasurement.measured_at.asc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def count_measurements(self, user_id: str, start_at: datetime, end_at: datetime) -> int:
        stmt = select(func.count(HealthMeasurement.id)).where(
            and_(
                HealthMeasurement.user_id == str(user_id),
                HealthMeasurement.measured_at >= start_at,
                HealthMeasurement.measured_at <= end_at,
                HealthMeasurement.archived_at.is_(None),
            )
        )
        return self.db.scalar(stmt) or 0
