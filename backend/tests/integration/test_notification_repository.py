import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.notification import Notification
from app.repositories.notification_repository import (
    NotificationRepository,
    NotificationPreferenceRepository,
)


def test_notification_repository_crud(db_session: Session, test_user_a: User):
    """NotificationRepository creates, lists, marks read, and filters."""
    repo = NotificationRepository(db_session)
    pref_repo = NotificationPreferenceRepository(db_session)

    # 1. Create notifications
    n1 = Notification(
        user_id=test_user_a.id,
        title="Alert 1",
        message="Message 1",
        notification_type="consultation_reminder",
        dedupe_key="test-dedupe-1",
    )
    n2 = Notification(
        user_id=test_user_a.id,
        title="Alert 2",
        message="Message 2",
        notification_type="risk_update",
        dedupe_key="test-dedupe-2",
    )
    repo.create(n1)
    repo.create(n2)
    db_session.commit()

    # 2. Count unread
    assert repo.get_unread_count(test_user_a.id) == 2

    # 3. List
    items, total = repo.list_owned(test_user_a.id)
    assert total == 2

    # 4. Mark read
    assert repo.mark_read(test_user_a.id, n1.id) is True
    db_session.commit()
    assert repo.get_unread_count(test_user_a.id) == 1

    # 5. Preferences
    prefs = pref_repo.get_or_create_default(test_user_a.id)
    assert prefs.consultation_reminders_enabled is True
    pref_repo.update_preferences(test_user_a.id, consultation_reminders_enabled=False)
    db_session.commit()
    updated = pref_repo.get_by_user_id(test_user_a.id)
    assert updated is not None
    assert updated.consultation_reminders_enabled is False
