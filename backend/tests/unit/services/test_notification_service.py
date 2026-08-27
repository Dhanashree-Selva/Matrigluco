import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.services.notification_service import NotificationService


def test_notification_service_preference_and_dedupe(db_session: Session, test_user_a: User):
    """NotificationService respects category opt-outs and dedupes identical events."""
    service = NotificationService(db_session)

    # 1. Normal creation
    n1 = service.create_notification(
        user_id=test_user_a.id,
        title="Consultation Reminder",
        message="Appointment tomorrow",
        notification_type="consultation_reminder",
        dedupe_key="consultation:123:24h",
    )
    db_session.commit()
    assert n1 is not None

    # 2. Duplicate with same dedupe_key returns existing notification without creating duplicate
    n2 = service.create_notification(
        user_id=test_user_a.id,
        title="Consultation Reminder",
        message="Appointment tomorrow",
        notification_type="consultation_reminder",
        dedupe_key="consultation:123:24h",
    )
    assert n2 is not None
    assert n2.id == n1.id

    # 3. Disable consultation reminders
    service.update_preferences(test_user_a.id, consultation_reminders_enabled=False)
    db_session.commit()

    # 4. Attempt to create new consultation reminder -> skipped
    n3 = service.create_notification(
        user_id=test_user_a.id,
        title="New Consultation Reminder",
        message="New appointment",
        notification_type="consultation_reminder",
        dedupe_key="consultation:456:24h",
    )
    assert n3 is None
