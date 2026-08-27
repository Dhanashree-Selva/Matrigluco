from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from app.models.notification import DailyHealthSummary


class DailySummaryRepository:
    """Repository managing durable daily health summaries in MySQL."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_user_and_date(
        self, user_id: str, summary_date: str, version: str = "1.0.0"
    ) -> Optional[DailyHealthSummary]:
        stmt = select(DailyHealthSummary).where(
            and_(
                DailyHealthSummary.user_id == user_id,
                DailyHealthSummary.summary_date == summary_date,
                DailyHealthSummary.summary_version == version,
            )
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def upsert_summary(
        self,
        user_id: str,
        summary_date: str,
        measurement_count: int,
        payload: Dict[str, Any],
        version: str = "1.0.0",
    ) -> DailyHealthSummary:
        existing = self.get_by_user_and_date(
            user_id=user_id, summary_date=summary_date, version=version
        )
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        if existing:
            existing.measurement_count = measurement_count
            existing.summary_payload = payload
            existing.generated_at = now
            self.db.flush()
            return existing

        summary = DailyHealthSummary(
            user_id=user_id,
            summary_date=summary_date,
            summary_version=version,
            measurement_count=measurement_count,
            summary_payload=payload,
            generated_at=now,
        )
        self.db.add(summary)
        self.db.flush()
        return summary

    def list_recent_for_user(self, user_id: str, limit: int = 7) -> List[DailyHealthSummary]:
        stmt = (
            select(DailyHealthSummary)
            .where(DailyHealthSummary.user_id == user_id)
            .order_by(DailyHealthSummary.summary_date.desc())
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().all())
