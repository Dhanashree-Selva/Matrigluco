import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.models.risk_assessment import Prediction
from app.models.medical_report import Report

logger = logging.getLogger("matrigluco.migration.supabase")


def parse_iso_datetime(dt_str: Optional[str] = None) -> datetime:
    if not dt_str:
        return datetime.utcnow()
    clean = dt_str.replace("Z", "+00:00")
    return datetime.fromisoformat(clean).replace(tzinfo=None)


def import_supabase_fixture(db: Session, fixture_data: Dict[str, Any]) -> Tuple[int, int, int]:
    """
    Imports Supabase export data into MySQL with foreign-key integrity, UUID preservation,
    and rollback on error.
    Returns (imported_users, imported_predictions, imported_reports).
    """
    users_data = fixture_data.get("users", [])
    predictions_data = fixture_data.get("predictions", [])
    reports_data = fixture_data.get("reports", [])

    imported_users = 0
    imported_preds = 0
    imported_reports = 0

    try:
        # 1. Import Users
        for u in users_data:
            existing = db.scalars(select(User).where(User.id == u["id"])).first()
            if not existing:
                created_at = parse_iso_datetime(u.get("created_at"))
                user = User(
                    id=u["id"],
                    public_id=u["id"],
                    email=u["email"],
                    email_normalized=u["email"].strip().lower(),
                    password_hash=u["password_hash"],
                    full_name=u.get("full_name"),
                    pregnancy_week=u.get("pregnancy_week", 0),
                    expected_due_date=u.get("expected_due_date"),
                    role=u.get("role", "user"),
                    status="active",
                    created_at=created_at,
                    updated_at=created_at,
                )
                db.add(user)
                imported_users += 1

        db.flush()

        # 2. Import Historical Predictions
        for p in predictions_data:
            existing_p = db.scalars(select(Prediction).where(Prediction.id == p["id"])).first()
            if not existing_p:
                created_at = parse_iso_datetime(p.get("created_at"))
                prob = float(p.get("probability", 0.0))
                pred_score = float(p.get("prediction_score", prob))
                pred = Prediction(
                    id=p["id"],
                    user_id=p["user_id"],
                    probability_score=prob,
                    prediction_score=pred_score,
                    risk_level=p["risk_level"],
                    prediction_result=p["prediction_result"],
                    glucose=p.get("glucose", 0.0),
                    bmi=p.get("bmi", 0.0),
                    created_at=created_at,
                )
                db.add(pred)
                imported_preds += 1

        # 3. Import Reports
        for r in reports_data:
            existing_r = db.scalars(select(Report).where(Report.id == r["id"])).first()
            if not existing_r:
                created_at = parse_iso_datetime(r.get("created_at"))
                rep = Report(
                    id=r["id"],
                    user_id=r["user_id"],
                    file_url=r.get("file_url"),
                    extracted_values=r.get("extracted_values"),
                    prediction_result=r.get("prediction_result"),
                    risk_level=r.get("risk_level"),
                    created_at=created_at,
                )
                db.add(rep)
                imported_reports += 1

        db.commit()
        logger.info(
            f"Successfully migrated {imported_users} users, {imported_preds} predictions, {imported_reports} reports."
        )
        return imported_users, imported_preds, imported_reports

    except Exception as e:
        db.rollback()
        logger.error(f"Migration transaction failed and rolled back: {e}")
        raise
