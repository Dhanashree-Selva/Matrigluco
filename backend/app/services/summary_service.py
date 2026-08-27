import logging
from datetime import datetime, timezone, time as dt_time, timedelta
from zoneinfo import ZoneInfo
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, func

from app.models.health import HealthMeasurement
from app.models.risk_assessment import RiskAssessment
from app.models.notification import DailyHealthSummary
from app.repositories.summary_repository import DailySummaryRepository
from app.services.notification_service import NotificationService

logger = logging.getLogger("matrigluco.services.summary")


class DailySummaryService:
    """
    Service computing and storing durable daily health summaries.
    Handles timezone-aware calendar day conversion to UTC bounds.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = DailySummaryRepository(db)
        self.notif_service = NotificationService(db)

    def _get_utc_bounds_for_local_date(
        self, local_date_str: str, tz_name: str = "UTC"
    ) -> tuple[datetime, datetime]:
        try:
            tz = ZoneInfo(tz_name)
        except Exception:
            tz = ZoneInfo("UTC")

        parsed_date = datetime.strptime(local_date_str, "%Y-%m-%d").date()
        local_start = datetime.combine(parsed_date, dt_time.min, tzinfo=tz)
        local_end = datetime.combine(parsed_date, dt_time.max, tzinfo=tz)

        utc_start = local_start.astimezone(timezone.utc).replace(tzinfo=None)
        utc_end = local_end.astimezone(timezone.utc).replace(tzinfo=None)
        return utc_start, utc_end

    def generate_daily_summary(
        self,
        user_id: str,
        summary_date: str,
        timezone_name: str = "UTC",
        send_notification: bool = True,
    ) -> DailyHealthSummary:
        """
        Calculates and persists daily summary for a specific user and local date.
        """
        utc_start, utc_end = self._get_utc_bounds_for_local_date(summary_date, timezone_name)

        # 1. Query health measurements within local date UTC bounds
        stmt = select(HealthMeasurement).where(
            and_(
                HealthMeasurement.user_id == user_id,
                HealthMeasurement.measured_at >= utc_start,
                HealthMeasurement.measured_at <= utc_end,
                HealthMeasurement.archived_at.is_(None),
            )
        )
        measurements = list(self.db.execute(stmt).scalars().all())

        # 2. Compute statistics
        counts: Dict[str, int] = {}
        glucose_values = []
        systolic_values = []
        diastolic_values = []

        for m in measurements:
            metric = str(m.metric_type)
            counts[metric] = counts.get(metric, 0) + 1
            if metric == "glucose":
                glucose_values.append(m.value_primary)
            elif metric == "blood_pressure":
                systolic_values.append(m.value_primary)
                if m.value_secondary is not None:
                    diastolic_values.append(m.value_secondary)

        avg_glucose = (
            round(sum(glucose_values) / len(glucose_values), 1) if glucose_values else None
        )
        avg_systolic = (
            round(sum(systolic_values) / len(systolic_values), 1) if systolic_values else None
        )
        avg_diastolic = (
            round(sum(diastolic_values) / len(diastolic_values), 1) if diastolic_values else None
        )

        # 3. Query latest risk assessment for that day
        risk_stmt = (
            select(RiskAssessment)
            .where(
                and_(
                    RiskAssessment.user_id == user_id,
                    RiskAssessment.created_at >= utc_start,
                    RiskAssessment.created_at <= utc_end,
                )
            )
            .order_by(RiskAssessment.created_at.desc())
            .limit(1)
        )
        latest_risk = self.db.execute(risk_stmt).scalar_one_or_none()

        payload = {
            "summary_date": summary_date,
            "timezone": timezone_name,
            "counts": counts,
            "averages": {
                "glucose": avg_glucose,
                "blood_pressure": {
                    "systolic": avg_systolic,
                    "diastolic": avg_diastolic,
                }
                if (avg_systolic or avg_diastolic)
                else None,
            },
            "latest_risk_level": latest_risk.risk_level if latest_risk else None,
        }

        # 4. Upsert durable summary
        summary = self.repo.upsert_summary(
            user_id=user_id,
            summary_date=summary_date,
            measurement_count=len(measurements),
            payload=payload,
            version="1.0.0",
        )

        # 5. Optional notification
        if send_notification and len(measurements) > 0:
            dedupe_key = f"daily-summary:{user_id}:{summary_date}:1.0.0"
            self.notif_service.create_notification(
                user_id=user_id,
                title="Daily Health Summary Ready",
                message=f"Your health summary for {summary_date} is now available.",
                notification_type="daily_summary",
                resource_type="daily_health_summary",
                resource_id=summary.id,
                dedupe_key=dedupe_key,
            )

        logger.info(
            f"Daily summary generated for user '{user_id}' on date '{summary_date}' ({len(measurements)} measurements)."
        )
        return summary
