import pytest
from fastapi.testclient import TestClient
from app.models.user import User


def test_consultations_crud_and_idor(
    client: TestClient, test_user_a: User, test_user_b: User, user_a_token: str, user_b_token: str
):
    """Consultations API supports booking, listing, updating, deleting with IDOR protection."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    headers_b = {"Authorization": f"Bearer {user_b_token}"}

    # 1. User A books consultation
    book_resp = client.post(
        "/api/v1/consultations",
        headers=headers_a,
        json={
            "patient_name": "Patient A",
            "doctor_name": "Dr. Sarah Jenkins",
            "appointment_date": "2026-09-20",
            "appointment_time": "10:30 AM",
            "consultation_type": "Video Consultation",
            "symptoms": "Follow-up glucose screening",
        },
    )
    assert book_resp.status_code == 201
    appt = book_resp.json()
    assert appt["doctor_name"] == "Dr. Sarah Jenkins"
    appt_id = appt["id"]

    # 2. User A lists consultations
    list_resp = client.get("/api/v1/consultations", headers=headers_a)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # 3. User A gets detail
    detail_resp = client.get(f"/api/v1/consultations/{appt_id}", headers=headers_a)
    assert detail_resp.status_code == 200

    # 4. User B attempts to get User A's consultation -> 404
    attack_resp = client.get(f"/api/v1/consultations/{appt_id}", headers=headers_b)
    assert attack_resp.status_code == 404

    # 5. User A updates appointment
    patch_resp = client.patch(
        f"/api/v1/consultations/{appt_id}",
        headers=headers_a,
        json={"status": "completed"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "completed"

    # 6. User A deletes appointment
    del_resp = client.delete(f"/api/v1/consultations/{appt_id}", headers=headers_a)
    assert del_resp.status_code == 204
