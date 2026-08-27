import pytest
from datetime import datetime, timezone, timedelta
from app.services.history_service import HistoryService
from app.services.health_service import HealthService
from app.services.prediction_service import PredictionService
from app.schemas.health_measurement import HealthMeasurementCreate
from app.schemas.prediction import PredictionCreateRequest
from app.models.user import User
from app.models.medical_report import Report


def test_history_service_aggregation(db_session, test_user_a: User):
    """HistoryService aggregates multi-domain events chronologically."""
    health_svc = HealthService(db=db_session)
    health_svc.create_measurement(
        user_id=test_user_a.id,
        payload=HealthMeasurementCreate(
            metric_type="glucose",
            value_primary=104.0,
            unit="mg/dL",
        ),
    )

    pred_svc = PredictionService(db=db_session)
    pred_svc.create_assessment(
        payload=PredictionCreateRequest(
            pregnancies=2,
            glucose=128.0,
            blood_pressure=76.0,
            skin_thickness=22.0,
            insulin=85.0,
            bmi=25.5,
            diabetes_pedigree_function=0.38,
            age=29.0,
        ),
        actor=test_user_a,
    )

    report = Report(
        user_id=test_user_a.id,
        file_name="blood_panel.pdf",
        risk_level="low",
        prediction_result="low",
        created_at=datetime.now(timezone.utc),
    )
    db_session.add(report)
    db_session.commit()

    service = HistoryService(db=db_session)
    history = service.get_history(user_id=test_user_a.id)

    assert history.total >= 3
    assert any(e.type == "measurement" for e in history.items)
    assert any(e.type == "assessment" for e in history.items)
    assert any(e.type == "report" for e in history.items)
    assert len(history.available_months) >= 1


def test_history_service_type_filtering(db_session, test_user_a: User):
    """HistoryService filters events by enabled types."""
    service = HistoryService(db=db_session)
    filtered = service.get_history(user_id=test_user_a.id, types=["report"])

    assert all(e.type == "report" for e in filtered.items)
