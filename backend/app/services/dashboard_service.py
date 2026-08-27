import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.risk_assessment import RiskAssessment, Prediction
from app.models.health import HealthMeasurement
from app.models.medical_report import Report
from app.models.consultation import DoctorAppointment
from app.repositories.health_repository import HealthRepository
from app.repositories.risk_repository import RiskRepository
from app.repositories.consultation_repository import ConsultationRepository
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    RecentPredictionSummary,
    UpcomingConsultationSummary,
    MeasurementCountSummary,
    BloodPressureSummary,
)
from app.cache.keys import user_dashboard_key
from app.cache.service import CacheService

logger = logging.getLogger("matrigluco.services.dashboard")


class DashboardService:
    """
    Application service aggregating patient metabolic indicators, clinical risk history,
    trend time-series, and upcoming consultations with fail-open transient caching.
    """

    def __init__(
        self,
        db: Session,
        health_repo: Optional[HealthRepository] = None,
        risk_repo: Optional[RiskRepository] = None,
        consultation_repo: Optional[ConsultationRepository] = None,
        cache: Optional[CacheService] = None,
    ):
        self.db = db
        self.health_repo = health_repo or HealthRepository(db)
        self.risk_repo = risk_repo or RiskRepository(db)
        self.consultation_repo = consultation_repo or ConsultationRepository(db)
        self.cache = cache or CacheService()

    def get_dashboard_summary(
        self, user_id: str, now: Optional[datetime] = None
    ) -> DashboardSummaryResponse:
        cache_key = user_dashboard_key(user_id)
        try:
            cached_data = self.cache.get_json(cache_key)
            if cached_data:
                return DashboardSummaryResponse.model_validate(cached_data)
        except Exception as e:
            logger.debug(f"Cache get failed: {e}")

        current_time = now or datetime.now(timezone.utc)
        seven_days_ago = current_time - timedelta(days=7)
        thirty_days_ago = current_time - timedelta(days=30)

        # 1. Latest Measurements
        latest_map: Dict[str, Any] = {}
        core_metrics = ["glucose", "blood_pressure", "weight", "bmi", "hba1c"]
        for metric in core_metrics:
            m = self.health_repo.get_latest_by_metric(user_id=user_id, metric_type=metric)
            if m:
                if metric == "blood_pressure":
                    latest_map["blood_pressure"] = {
                        "systolic": m.value_primary,
                        "diastolic": m.value_secondary or 0.0,
                        "unit": m.unit,
                        "measured_at": m.measured_at.isoformat(),
                    }
                else:
                    latest_map[metric] = {
                        "metric_type": m.metric_type,
                        "value": m.value_primary,
                        "unit": m.unit,
                        "measured_at": m.measured_at.isoformat(),
                    }
            else:
                latest_map[metric] = None

        # 2. Recent Stored Prediction (No recomputation)
        recent_pred_summary: Optional[RecentPredictionSummary] = None
        latest_assessment = self.risk_repo.get_latest_for_user(user_id=user_id)
        if latest_assessment:
            prob = float(latest_assessment.probability) if getattr(latest_assessment, "probability", None) is not None else 0.0
            prob_score = getattr(latest_assessment, "probability_score", prob)
            recent_pred_summary = RecentPredictionSummary(
                id=getattr(latest_assessment, "public_id", str(latest_assessment.id)),
                probability=prob,
                probability_score=prob_score,
                risk_band=latest_assessment.risk_band,
                prediction_result=latest_assessment.prediction_result,
                created_at=latest_assessment.created_at,
            )

        # 3. Trend Series
        trends: Dict[str, Any] = {"seven_day": {}, "thirty_day": {}}
        for metric in ["glucose", "blood_pressure", "weight"]:
            pts_7 = self.health_repo.get_trend(
                user_id=user_id, metric_type=metric, start_at=seven_days_ago, end_at=current_time
            )
            trends["seven_day"][metric] = [
                {
                    "measured_at": p.measured_at.isoformat(),
                    "value_primary": p.value_primary,
                    "value_secondary": p.value_secondary,
                }
                for p in pts_7
            ]
            pts_30 = self.health_repo.get_trend(
                user_id=user_id, metric_type=metric, start_at=thirty_days_ago, end_at=current_time
            )
            trends["thirty_day"][metric] = [
                {
                    "measured_at": p.measured_at.isoformat(),
                    "value_primary": p.value_primary,
                    "value_secondary": p.value_secondary,
                }
                for p in pts_30
            ]

        # 4. Measurement Counts
        count_7 = self.health_repo.count_measurements(
            user_id=user_id, start_at=seven_days_ago, end_at=current_time
        )
        count_30 = self.health_repo.count_measurements(
            user_id=user_id, start_at=thirty_days_ago, end_at=current_time
        )
        counts = MeasurementCountSummary(total_7_days=count_7, total_30_days=count_30)

        # 5. Upcoming Consultation
        upcoming_summary: Optional[UpcomingConsultationSummary] = None
        next_consultation = self.consultation_repo.get_upcoming(user_id=user_id)
        if next_consultation:
            upcoming_summary = UpcomingConsultationSummary(
                id=str(next_consultation.id),
                doctor_name=next_consultation.doctor_name,
                appointment_date=str(next_consultation.appointment_date),
                appointment_time=str(next_consultation.appointment_time),
                status=next_consultation.status,
            )

        # 6. Real Dynamic Care Activities from Database
        recent_activities: List[Dict[str, Any]] = []

        # 6a. Consultations
        try:
            consultations = (
                self.db.query(DoctorAppointment)
                .filter(DoctorAppointment.user_id == user_id)
                .order_by(DoctorAppointment.appointment_date.desc(), DoctorAppointment.created_at.desc())
                .limit(3)
                .all()
            )
            for c in consultations:
                is_upcoming = str(c.appointment_date) >= datetime.now(timezone.utc).strftime("%Y-%m-%d")
                recent_activities.append({
                    "id": f"consult-{c.id}",
                    "type": "consultation",
                    "title": f"Consultation with {c.doctor_name}",
                    "description": f"Scheduled for {c.appointment_date} at {c.appointment_time} ({c.status.title()}).",
                    "timestamp": f"{c.appointment_date}T{c.appointment_time}:00Z" if len(str(c.appointment_time)) == 5 else f"{c.appointment_date}T00:00:00Z",
                    "relative_time": "Upcoming" if is_upcoming else "Past Visit",
                    "path": f"/app/consultations/{c.id}",
                    "is_upcoming": is_upcoming,
                })
        except Exception as e:
            logger.debug(f"Error loading consultations for dashboard activity: {e}")

        # 6b. Risk Assessments & ML Predictions
        try:
            assessments, _ = self.risk_repo.list_owned_assessments(user_id=user_id, limit=3)
            if assessments:
                for a in assessments:
                    recent_activities.append({
                        "id": f"assess-{a.id}",
                        "type": "assessment",
                        "title": f"GDM Risk Assessment: {a.risk_band.title()}",
                        "description": f"Evaluated at {a.risk_band.title()} risk ({round(a.probability * 100, 1)}% probability).",
                        "timestamp": a.created_at.isoformat() if a.created_at else datetime.now(timezone.utc).isoformat(),
                        "path": f"/app/assessment/{a.id}",
                        "is_upcoming": False,
                    })
            else:
                pred = (
                    self.db.query(Prediction)
                    .filter(Prediction.user_id == user_id)
                    .order_by(Prediction.created_at.desc())
                    .first()
                )
                if pred:
                    risk_name = pred.risk_band or ("High Risk" if pred.prediction_result == 1 else "Low Risk")
                    recent_activities.append({
                        "id": f"pred-{pred.id}",
                        "type": "assessment",
                        "title": f"GDM Risk Assessment: {risk_name.title()}",
                        "description": f"Evaluated at {risk_name.title()} risk ({round(pred.probability * 100, 1)}% probability).",
                        "timestamp": pred.created_at.isoformat() if pred.created_at else datetime.now(timezone.utc).isoformat(),
                        "path": f"/app/assessment/{pred.id}",
                        "is_upcoming": False,
                    })
        except Exception as e:
            logger.debug(f"Error loading assessments for dashboard activity: {e}")

        # 6c. Recent Health Telemetry & Measurements (last 5)
        try:
            measurements = (
                self.db.query(HealthMeasurement)
                .filter(HealthMeasurement.user_id == user_id, HealthMeasurement.archived_at.is_(None))
                .order_by(HealthMeasurement.measured_at.desc())
                .limit(5)
                .all()
            )
            for m in measurements:
                metric_label = m.metric_type.replace("_", " ").title()
                if m.value_secondary is not None:
                    val_str = f"{m.value_primary}/{m.value_secondary} {m.unit}"
                else:
                    val_str = f"{m.value_primary} {m.unit}"
                notes_str = f" • {m.notes}" if m.notes else ""
                recent_activities.append({
                    "id": f"meas-{m.id}",
                    "type": "measurement",
                    "title": f"{metric_label} Recorded",
                    "description": f"{val_str} logged{notes_str}.",
                    "timestamp": m.measured_at.isoformat() if m.measured_at else datetime.now(timezone.utc).isoformat(),
                    "path": "/app/tracking",
                    "is_upcoming": False,
                })
        except Exception as e:
            logger.debug(f"Error loading measurements for dashboard activity: {e}")

        # 6d. Recent Clinical Lab Reports (last 2)
        try:
            reports = (
                self.db.query(Report)
                .filter(Report.user_id == user_id)
                .order_by(Report.created_at.desc())
                .limit(2)
                .all()
            )
            for r in reports:
                recent_activities.append({
                    "id": f"report-{r.id}",
                    "type": "report",
                    "title": f"Lab Report Uploaded: {r.file_name or 'Medical Report'}",
                    "description": f"Processed clinical report (Risk: {r.risk_level or 'Standard'}).",
                    "timestamp": r.created_at.isoformat() if r.created_at else datetime.now(timezone.utc).isoformat(),
                    "path": f"/app/reports/{r.id}",
                    "is_upcoming": False,
                })
        except Exception as e:
            logger.debug(f"Error loading reports for dashboard activity: {e}")

        # Sort activities: upcoming items first, then descending by timestamp
        upcoming_items = [a for a in recent_activities if a.get("is_upcoming")]
        past_items = [a for a in recent_activities if not a.get("is_upcoming")]
        past_items.sort(key=lambda x: str(x.get("timestamp")), reverse=True)
        sorted_activities = (upcoming_items + past_items)[:6]

        summary = DashboardSummaryResponse(
            latest_measurements=latest_map,
            recent_prediction=recent_pred_summary,
            trends=trends,
            measurement_counts=counts,
            upcoming_consultation=upcoming_summary,
            recent_activities=sorted_activities,
        )

        # Cache for 60 seconds
        try:
            self.cache.set_json(cache_key, summary.model_dump(), expire_seconds=60)
        except Exception as e:
            logger.debug(f"Cache set failed: {e}")

        return summary
