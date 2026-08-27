import logging
from typing import List, Optional, Dict, Any, Set
from datetime import datetime, timezone, time
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import Session, joinedload

from app.models.risk_assessment import RiskAssessment
from app.models.health import HealthMeasurement
from app.models.medical_report import Report
from app.models.consultation import DoctorAppointment
from app.schemas.history import HistoryEventResponse, HistoryListResponse

logger = logging.getLogger("matrigluco.services.history")


class HistoryService:
    """
    Unified longitudinal care story aggregation service.
    Combines assessments, health readings, medical reports, and consultations
    with server-side filtering, deterministic chronological ordering, and pagination.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_history(
        self,
        user_id: str,
        types: Optional[List[str]] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        month: Optional[str] = None,  # "YYYY-MM"
        page: int = 1,
        page_size: int = 20,
    ) -> HistoryListResponse:
        all_events: List[HistoryEventResponse] = []
        enabled_types = set(t.lower().strip() for t in types) if types else {
            "assessment", "measurement", "report", "consultation"
        }

        # Month filter takes precedence or narrows date range if provided
        if month:
            try:
                parts = month.split("-")
                y = int(parts[0])
                m = int(parts[1])
                import calendar
                _, last_day = calendar.monthrange(y, m)
                month_start = datetime(y, m, 1, 0, 0, 0, tzinfo=timezone.utc)
                month_end = datetime(y, m, last_day, 23, 59, 59, 999999, tzinfo=timezone.utc)
                date_from = max(date_from, month_start) if date_from else month_start
                date_to = min(date_to, month_end) if date_to else month_end
            except Exception as e:
                logger.debug(f"Invalid month filter '{month}': {e}")

        # 1. Assessments
        if "assessment" in enabled_types:
            stmt = (
                select(RiskAssessment)
                .options(
                    joinedload(RiskAssessment.model_version),
                    joinedload(RiskAssessment.features),
                )
                .where(
                    and_(
                        RiskAssessment.user_id == str(user_id),
                        RiskAssessment.archived_at.is_(None),
                    )
                )
            )
            if date_from:
                stmt = stmt.where(RiskAssessment.created_at >= date_from)
            if date_to:
                stmt = stmt.where(RiskAssessment.created_at <= date_to)

            assessments = self.db.scalars(stmt).unique().all()
            for a in assessments:
                dt = a.created_at
                if dt and dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                all_events.append(
                    HistoryEventResponse(
                        id=f"assessment-{a.public_id or a.id}",
                        type="assessment",
                        occurred_at=dt,
                        resource_id=str(a.public_id or a.id),
                        title=f"Risk Assessment — {a.prediction_result.title() if a.prediction_result else 'Evaluated'} Risk",
                        summary=f"Calculated Risk Probability: {round((a.probability_score or 0) * 100, 1)}%",
                        status=a.risk_band or a.prediction_result,
                        episode_id=None,
                        episode_type=None,
                        details={
                            "risk_level": a.risk_band or a.prediction_result,
                            "risk_band": a.risk_band,
                            "probability_score": a.probability_score,
                            "prediction_result": a.prediction_result,
                            "model_version": a.model_version.version if a.model_version else "v1.0.0",
                            "features_count": len(a.features) if a.features else 8,
                        },
                    )
                )

        # 2. Health Measurements
        if "measurement" in enabled_types:
            stmt = (
                select(HealthMeasurement)
                .where(
                    and_(
                        HealthMeasurement.user_id == str(user_id),
                        HealthMeasurement.archived_at.is_(None),
                    )
                )
            )
            if date_from:
                stmt = stmt.where(HealthMeasurement.measured_at >= date_from)
            if date_to:
                stmt = stmt.where(HealthMeasurement.measured_at <= date_to)

            measurements = self.db.scalars(stmt).all()
            for m in measurements:
                dt = m.measured_at
                if dt and dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                
                label = m.metric_type.replace("_", " ").title()
                summary_val = (
                    f"{round(m.value_primary)} / {round(m.value_secondary)} {m.unit}"
                    if m.metric_type == "blood_pressure" and m.value_secondary is not None
                    else f"{m.value_primary} {m.unit}"
                )

                all_events.append(
                    HistoryEventResponse(
                        id=f"measurement-{m.public_id or m.id}",
                        type="measurement",
                        occurred_at=dt,
                        resource_id=str(m.public_id or m.id),
                        title=f"{label} Reading",
                        summary=summary_val,
                        status=None,
                        episode_id=None,
                        episode_type=None,
                        details={
                            "metric_type": m.metric_type,
                            "value_primary": m.value_primary,
                            "value_secondary": m.value_secondary,
                            "unit": m.unit,
                            "notes": m.notes,
                            "source": m.source,
                        },
                    )
                )

        # 3. Medical Reports
        if "report" in enabled_types:
            stmt = select(Report).where(Report.user_id == str(user_id))
            if date_from:
                stmt = stmt.where(Report.created_at >= date_from)
            if date_to:
                stmt = stmt.where(Report.created_at <= date_to)

            reports = self.db.scalars(stmt).all()
            for r in reports:
                dt = r.uploaded_at or r.created_at
                if dt and dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)

                rep_title = f"Medical Report — {r.file_name}" if r.file_name else "Medical Report"
                summary_text = (
                    f"Analyzed Risk: {r.risk_level.title()}"
                    if r.risk_level
                    else "Lab Record Processed"
                )

                all_events.append(
                    HistoryEventResponse(
                        id=f"report-{r.id}",
                        type="report",
                        occurred_at=dt,
                        resource_id=str(r.id),
                        title=rep_title,
                        summary=summary_text,
                        status=r.risk_level or "completed",
                        episode_id=str(r.id),
                        episode_type="report_workflow",
                        details={
                            "file_name": r.file_name,
                            "risk_level": r.risk_level,
                            "prediction_result": r.prediction_result,
                            "has_extracted_data": bool(r.extracted_values),
                        },
                    )
                )

        # 4. Consultations
        if "consultation" in enabled_types:
            stmt = select(DoctorAppointment).where(DoctorAppointment.user_id == str(user_id))
            consultations = self.db.scalars(stmt).all()
            for c in consultations:
                # Combine appointment date and time or fall back to created_at
                appt_dt = c.created_at
                if c.appointment_date:
                    appt_time = time(9, 0)
                    if c.appointment_time:
                        try:
                            parts = str(c.appointment_time).split(":")
                            appt_time = time(int(parts[0]), int(parts[1]))
                        except Exception:
                            pass
                    appt_dt = datetime.combine(c.appointment_date, appt_time, tzinfo=timezone.utc)
                elif appt_dt and appt_dt.tzinfo is None:
                    appt_dt = appt_dt.replace(tzinfo=timezone.utc)

                if date_from and appt_dt < date_from:
                    continue
                if date_to and appt_dt > date_to:
                    continue

                consultation_label = getattr(c, "consultation_type", None) or "Clinical"
                all_events.append(
                    HistoryEventResponse(
                        id=f"consultation-{c.id}",
                        type="consultation",
                        occurred_at=appt_dt,
                        resource_id=str(c.id),
                        title=f"Doctor Appointment — {c.doctor_name}",
                        summary=f"{consultation_label} Consultation · {c.appointment_time or 'Scheduled'}",
                        status=c.status or "scheduled",
                        episode_id=str(c.id),
                        episode_type="consultation_lifecycle",
                        details={
                            "patient_name": getattr(c, "patient_name", None),
                            "doctor_name": c.doctor_name,
                            "consultation_type": getattr(c, "consultation_type", None),
                            "appointment_date": str(c.appointment_date) if c.appointment_date else "",
                            "appointment_time": str(c.appointment_time) if c.appointment_time else "",
                            "status": c.status,
                            "symptoms": getattr(c, "symptoms", None),
                        },
                    )
                )

        # Calculate event counts per category
        event_counts = {
            "assessment": sum(1 for e in all_events if e.type == "assessment"),
            "measurement": sum(1 for e in all_events if e.type == "measurement"),
            "report": sum(1 for e in all_events if e.type == "report"),
            "consultation": sum(1 for e in all_events if e.type == "consultation"),
        }

        # Available months across all aggregated events (sorted descending)
        months_set: Set[str] = set()
        for e in all_events:
            months_set.add(e.occurred_at.strftime("%Y-%m"))
        available_months = sorted(list(months_set), reverse=True)

        # Deterministic chronological sort (newest first)
        all_events.sort(key=lambda x: (x.occurred_at, x.id), reverse=True)

        total = len(all_events)
        total_pages = max(1, (total + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_items = all_events[start_idx:end_idx]

        return HistoryListResponse(
            items=paginated_items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            available_months=available_months,
            event_counts=event_counts,
        )
