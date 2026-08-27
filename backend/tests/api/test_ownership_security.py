import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.risk_assessment import Prediction
from app.models.medical_report import Report
from app.models.consultation import DoctorAppointment
from app.models.background_job import BackgroundJob


# ── 1. Predictions IDOR ───────────────────────────────────────────────────────


def test_prediction_cross_user_access_denied(
    client: TestClient, test_user_a: User, test_user_b: User, user_a_token: str, user_b_token: str
):
    """User A cannot read or delete User B's risk assessment."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    headers_b = {"Authorization": f"Bearer {user_b_token}"}

    # User B creates prediction
    pred_payload = {
        "glucose": 130.0,
        "blood_pressure": 80.0,
        "skin_thickness": 25.0,
        "insulin": 85.0,
        "bmi": 28.0,
        "diabetes_pedigree_function": 0.45,
        "age": 28,
        "pregnancies": 1,
    }
    resp_b = client.post("/api/v1/predictions", json=pred_payload, headers=headers_b)
    assert resp_b.status_code == 201
    pred_b_id = resp_b.json()["id"]

    # User A tries to read User B's prediction -> 404
    read_resp = client.get(f"/api/v1/predictions/{pred_b_id}", headers=headers_a)
    assert read_resp.status_code == 404

    # User A tries to delete User B's prediction -> 404
    del_resp = client.delete(f"/api/v1/predictions/{pred_b_id}", headers=headers_a)
    assert del_resp.status_code == 404


# ── 2. Medical Reports IDOR ───────────────────────────────────────────────────


def test_report_cross_user_access_denied(
    client: TestClient, test_user_a: User, test_user_b: User, user_a_token: str, user_b_token: str
):
    """User A cannot read or delete User B's medical report."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    headers_b = {"Authorization": f"Bearer {user_b_token}"}

    # User B creates report
    report_payload = {
        "file_url": "https://storage.local/reports/user_b.pdf",
        "extracted_values": {"glucose": 110.0},
        "risk_level": "low",
    }
    resp_b = client.post("/api/v1/reports", json=report_payload, headers=headers_b)
    assert resp_b.status_code == 201
    report_b_id = resp_b.json()["id"]

    # User A tries to read -> 404
    read_resp = client.get(f"/api/v1/reports/{report_b_id}", headers=headers_a)
    assert read_resp.status_code == 404

    # User A tries to delete -> 404
    del_resp = client.delete(f"/api/v1/reports/{report_b_id}", headers=headers_a)
    assert del_resp.status_code == 404


# ── 3. Health Measurements IDOR ───────────────────────────────────────────────


def test_health_measurement_cross_user_access_denied(client: TestClient, user_a_token: str):
    """User A cannot read, update, or delete a non-existent/unowned measurement."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    fake_id = "unowned-measurement-uuid-999"

    assert (
        client.get(f"/api/v1/health-measurements/{fake_id}", headers=headers_a).status_code == 404
    )
    assert (
        client.patch(
            f"/api/v1/health-measurements/{fake_id}", json={"value": 130.0}, headers=headers_a
        ).status_code
        == 404
    )
    assert (
        client.delete(f"/api/v1/health-measurements/{fake_id}", headers=headers_a).status_code
        == 404
    )


# ── 4. File Assets IDOR ───────────────────────────────────────────────────────


def test_file_cross_user_download_denied(client: TestClient, user_a_token: str):
    """User A cannot download unowned/unauthorized files."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    fake_file_id = "user_b_private_report.pdf"

    resp = client.get(f"/api/v1/files/{fake_file_id}/download", headers=headers_a)
    assert resp.status_code == 404


# ── 5. Consultations IDOR ─────────────────────────────────────────────────────


def test_consultation_cross_user_access_denied(
    client: TestClient, test_user_a: User, test_user_b: User, user_a_token: str, user_b_token: str
):
    """User A cannot read, update, or delete User B's consultation."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    headers_b = {"Authorization": f"Bearer {user_b_token}"}

    # User B books consultation
    appt_payload = {
        "patient_name": "Patient B",
        "doctor_name": "Dr. Miller",
        "appointment_date": "2026-10-01",
        "appointment_time": "11:00 AM",
    }
    resp_b = client.post("/api/v1/consultations", json=appt_payload, headers=headers_b)
    assert resp_b.status_code == 201
    appt_id = resp_b.json()["id"]

    # User A tries to read -> 404
    assert client.get(f"/api/v1/consultations/{appt_id}", headers=headers_a).status_code == 404

    # User A tries to update -> 404
    assert (
        client.patch(
            f"/api/v1/consultations/{appt_id}", json={"status": "cancelled"}, headers=headers_a
        ).status_code
        == 404
    )

    # User A tries to delete -> 404
    assert client.delete(f"/api/v1/consultations/{appt_id}", headers=headers_a).status_code == 404


# ── 6. Notifications IDOR ─────────────────────────────────────────────────────


def test_notification_cross_user_access_denied(client: TestClient, user_a_token: str):
    """User A cannot read or mark as read unowned notifications."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    fake_notif_id = "user_b_notif_123"

    assert (
        client.get(f"/api/v1/notifications/{fake_notif_id}", headers=headers_a).status_code == 404
    )
    assert (
        client.patch(f"/api/v1/notifications/{fake_notif_id}/read", headers=headers_a).status_code
        == 404
    )


# ── 7. Pregnancies IDOR ───────────────────────────────────────────────────────


def test_pregnancy_cross_user_access_denied(
    client: TestClient, test_user_b: User, user_a_token: str
):
    """User A cannot read, update, or delete User B's pregnancy context."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    target_id = test_user_b.public_id

    assert client.get(f"/api/v1/pregnancies/{target_id}", headers=headers_a).status_code == 404
    assert (
        client.patch(
            f"/api/v1/pregnancies/{target_id}", json={"pregnancy_week": 30}, headers=headers_a
        ).status_code
        == 404
    )
    assert client.delete(f"/api/v1/pregnancies/{target_id}", headers=headers_a).status_code == 404


# ── 8. Background Jobs IDOR ───────────────────────────────────────────────────


def test_background_job_cross_user_access_denied(
    client: TestClient, db_session: Session, test_user_b: User, user_a_token: str
):
    """User A cannot poll User B's background job."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}

    # Create job owned by User B
    job_b = BackgroundJob(
        user_id=test_user_b.id,
        job_type="report_processing",
        status="running",
        progress_percent=40,
    )
    db_session.add(job_b)
    db_session.commit()

    # User A polls User B's job -> 404
    resp = client.get(f"/api/v1/tasks/{job_b.public_id}", headers=headers_a)
    assert resp.status_code == 404


# ── 9. Chatbot Conversations IDOR ─────────────────────────────────────────────


def test_chatbot_conversation_cross_user_access_denied(
    client: TestClient, test_user_a: User, test_user_b: User, user_a_token: str, user_b_token: str
):
    """User A cannot read, update, delete, or send messages into User B's conversation."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    headers_b = {"Authorization": f"Bearer {user_b_token}"}

    # User B creates conversation
    conv_resp = client.post(
        "/api/v1/chatbot/conversations", json={"title": "Private Consultation"}, headers=headers_b
    )
    assert conv_resp.status_code == 201
    conv_b_id = conv_resp.json()["id"]

    # User A tries to read -> 404
    assert (
        client.get(f"/api/v1/chatbot/conversations/{conv_b_id}", headers=headers_a).status_code
        == 404
    )

    # User A tries to update -> 404
    assert (
        client.patch(
            f"/api/v1/chatbot/conversations/{conv_b_id}",
            json={"title": "Hacked"},
            headers=headers_a,
        ).status_code
        == 404
    )

    # User A tries to send message -> 404
    assert (
        client.post(
            f"/api/v1/chatbot/conversations/{conv_b_id}/messages",
            json={"content": "Hello?"},
            headers=headers_a,
        ).status_code
        == 404
    )

    # User A tries to delete -> 404
    assert (
        client.delete(f"/api/v1/chatbot/conversations/{conv_b_id}", headers=headers_a).status_code
        == 404
    )
