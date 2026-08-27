import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.services.security_event_service import SecurityEventService


def test_security_event_service_records_event(db_session: Session, test_user_a: User):
    """SecurityEventService records abuse/security anomalies with hashed IP representation."""
    service = SecurityEventService(db_session)

    event = service.record_security_event(
        event_type="AUTH_LOGIN_FAILURE",
        severity="warning",
        user_id=test_user_a.id,
        raw_ip="192.168.1.100",
        user_agent="Mozilla/5.0 Test Agent",
        safe_metadata={"reason": "invalid_credentials"},
    )
    assert event is not None
    assert event.event_type == "AUTH_LOGIN_FAILURE"
    assert event.severity == "warning"
    assert event.ip_hash is not None
    assert event.ip_hash != "192.168.1.100"  # IP is hashed

    # Query security events
    events = service.repo.list_by_event_type("AUTH_LOGIN_FAILURE")
    assert len(events) >= 1
