import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.services.notification_service import NotificationService


def test_notifications_endpoints(
    client: TestClient, test_user_a: User, user_a_token: str, db_session: Session
):
    """GET /notifications, /preferences, and mark-read operations succeed."""
    headers = {"Authorization": f"Bearer {user_a_token}"}

    # 1. Create a notification via service
    service = NotificationService(db_session)
    notif = service.create_notification(
        user_id=test_user_a.id,
        title="Welcome to MatriGluco",
        message="Your health journey begins today.",
        notification_type="system",
    )
    db_session.commit()
    assert notif is not None

    # 2. List notifications
    list_resp = client.get("/api/v1/notifications", headers=headers)
    assert list_resp.status_code == 200
    data = list_resp.json()
    assert data["total"] >= 1
    assert data["unread_count"] >= 1
    assert any(n["id"] == notif.id for n in data["items"])

    # 3. Mark single notification as read
    read_resp = client.patch(f"/api/v1/notifications/{notif.id}/read", headers=headers)
    assert read_resp.status_code == 200

    # 4. Get preferences
    pref_resp = client.get("/api/v1/notifications/preferences", headers=headers)
    assert pref_resp.status_code == 200
    pref_data = pref_resp.json()
    assert pref_data["consultation_reminders_enabled"] is True

    # 5. Update preferences
    patch_pref = client.patch(
        "/api/v1/notifications/preferences",
        headers=headers,
        json={"email_notifications_enabled": False},
    )
    assert patch_pref.status_code == 200
    assert patch_pref.json()["email_notifications_enabled"] is False

    # 6. Mark all read
    read_all = client.patch("/api/v1/notifications/read-all", headers=headers)
    assert read_all.status_code == 200
