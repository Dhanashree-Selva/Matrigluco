import io
import pytest
from fastapi.testclient import TestClient
from app.models.user import User


def test_file_upload_and_download(client: TestClient, test_user_a: User, user_a_token: str):
    """Authenticated file upload and download workflow."""
    headers = {"Authorization": f"Bearer {user_a_token}"}

    file_content = b"%PDF-1.4 Mock medical lab report content"
    files = {"file": ("blood_report.pdf", io.BytesIO(file_content), "application/pdf")}

    # 1. Upload file
    upload_resp = client.post("/api/v1/files/upload", headers=headers, files=files)
    assert upload_resp.status_code == 201
    data = upload_resp.json()
    assert "id" in data
    file_id = data["id"]
    assert data["category"] == "medical_report"
    assert data["mime_type"] == "application/pdf"

    # 2. Download file
    dl_resp = client.get(f"/api/v1/files/{file_id}/download", headers=headers)
    assert dl_resp.status_code == 200
    assert dl_resp.content == file_content
    assert dl_resp.headers["Cache-Control"] == "private, no-store"
    assert dl_resp.headers["X-Content-Type-Options"] == "nosniff"


def test_file_download_unauthenticated_rejected(client: TestClient):
    """Unauthenticated download is rejected with 401."""
    dl_resp = client.get("/api/v1/files/any-file-id/download")
    assert dl_resp.status_code == 401


def test_file_download_cross_user_denied(
    client: TestClient, test_user_a: User, user_a_token: str, test_user_b: User, user_b_token: str
):
    """User B cannot download User A's private file."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    headers_b = {"Authorization": f"Bearer {user_b_token}"}

    file_content = b"%PDF-1.4 User A Private Report"
    files = {"file": ("report_a.pdf", io.BytesIO(file_content), "application/pdf")}

    upload_resp = client.post("/api/v1/files/upload", headers=headers_a, files=files)
    assert upload_resp.status_code == 201
    file_id = upload_resp.json()["id"]

    # User B attempts to download User A's file -> 404 (IDOR protection)
    dl_resp = client.get(f"/api/v1/files/{file_id}/download", headers=headers_b)
    assert dl_resp.status_code == 404


def test_file_soft_delete_prevents_download(
    client: TestClient, test_user_a: User, user_a_token: str
):
    """Soft-deleted file immediately becomes inaccessible."""
    headers = {"Authorization": f"Bearer {user_a_token}"}

    file_content = b"%PDF-1.4 Report to Delete"
    files = {"file": ("report_del.pdf", io.BytesIO(file_content), "application/pdf")}

    upload_resp = client.post("/api/v1/files/upload", headers=headers, files=files)
    assert upload_resp.status_code == 201
    file_id = upload_resp.json()["id"]

    # Delete
    del_resp = client.delete(f"/api/v1/files/{file_id}", headers=headers)
    assert del_resp.status_code == 204

    # Subsequent download -> 404
    dl_resp = client.get(f"/api/v1/files/{file_id}/download", headers=headers)
    assert dl_resp.status_code == 404


def test_file_upload_empty_rejected(client: TestClient, user_a_token: str):
    """Zero-byte file upload is rejected."""
    headers = {"Authorization": f"Bearer {user_a_token}"}
    files = {"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")}
    resp = client.post("/api/v1/files/upload", headers=headers, files=files)
    assert resp.status_code in (400, 422)


def test_file_upload_fake_pdf_rejected(client: TestClient, user_a_token: str):
    """File named .pdf but containing plain text/executable is rejected."""
    headers = {"Authorization": f"Bearer {user_a_token}"}
    files = {"file": ("fake.pdf", io.BytesIO(b"NOT A REAL PDF CONTENT"), "application/pdf")}
    resp = client.post("/api/v1/files/upload", headers=headers, files=files)
    assert resp.status_code in (400, 422)
