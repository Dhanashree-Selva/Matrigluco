import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.services.audit_service import AuditService


def test_audit_service_records_event(db_session: Session, test_user_a: User):
    """AuditService appends structured business events with actor scoping."""
    service = AuditService(db_session)

    log_entry = service.record_event(
        event_type="PROFILE_UPDATED",
        actor_user_id=test_user_a.id,
        resource_type="profile",
        resource_id=test_user_a.public_id,
        safe_metadata={"changed_fields": ["phone", "blood_group"]},
    )
    assert log_entry is not None
    assert log_entry.event_type == "PROFILE_UPDATED"
    assert log_entry.actor_user_id == test_user_a.id
    assert log_entry.outcome == "success"

    # Query audit logs
    history = service.repo.list_by_actor(test_user_a.id)
    assert len(history) >= 1
    assert history[0].event_type == "PROFILE_UPDATED"
