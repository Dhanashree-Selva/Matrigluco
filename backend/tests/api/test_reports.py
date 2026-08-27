import pytest
from fastapi.testclient import TestClient
from app.models.user import User


def test_reports_crud_and_idor(
    client: TestClient, test_user_a: User, test_user_b: User, user_a_token: str, user_b_token: str
):
    """Reports API allows saving, listing, getting, and deleting with IDOR protection."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    headers_b = {"Authorization": f"Bearer {user_b_token}"}

    # 1. User A saves a report
    save_resp = client.post(
        "/api/v1/reports",
        headers=headers_a,
        json={
            "file_url": "https://storage.matrigluco.org/private/report_1.pdf",
            "extracted_values": {"glucose": 135.0, "bp_systolic": 120.0},
            "prediction_result": "Non-Diabetic",
            "risk_level": "low",
        },
    )
    assert save_resp.status_code == 201
    report_a = save_resp.json()
    assert report_a["id"] is not None

    # 2. User A lists reports
    list_resp = client.get("/api/v1/reports", headers=headers_a)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # 3. User A gets detail
    detail_resp = client.get(f"/api/v1/reports/{report_a['id']}", headers=headers_a)
    assert detail_resp.status_code == 200

    # 4. User B attempts to get User A's report -> 404
    attack_resp = client.get(f"/api/v1/reports/{report_a['id']}", headers=headers_b)
    assert attack_resp.status_code == 404

    # 5. User A deletes report
    del_resp = client.delete(f"/api/v1/reports/{report_a['id']}", headers=headers_a)
    assert del_resp.status_code == 204
