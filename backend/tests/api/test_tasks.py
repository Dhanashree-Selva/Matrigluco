import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.background_job import BackgroundJob


def test_get_task_status_owner_success(
    client: TestClient, db_session: Session, test_user_a: User, user_a_token: str
):
    """User can poll progress and status of their own background job."""
    headers = {"Authorization": f"Bearer {user_a_token}"}

    job = BackgroundJob(
        user_id=test_user_a.id,
        job_type="report_processing",
        status="running",
        progress_percent=60,
        progress_message="Extracting report values",
        resource_type="medical_report",
        resource_id="rep-123",
    )
    db_session.add(job)
    db_session.commit()

    response = client.get(f"/api/v1/tasks/{job.public_id}", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["id"] == job.public_id
    assert data["job_type"] == "report_processing"
    assert data["status"] == "running"
    assert data["progress_percent"] == 60
    assert data["progress_message"] == "Extracting report values"


def test_get_task_status_idor_protection(
    client: TestClient,
    db_session: Session,
    test_user_a: User,
    test_user_b: User,
    user_a_token: str,
    user_b_token: str,
):
    """User A cannot access User B's background job status (strictly 404 Not Found)."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    headers_b = {"Authorization": f"Bearer {user_b_token}"}

    job_b = BackgroundJob(
        user_id=test_user_b.id,
        job_type="report_export",
        status="running",
        progress_percent=30,
        progress_message="Exporting data",
    )
    db_session.add(job_b)
    db_session.commit()

    # User B can view their job
    resp_b = client.get(f"/api/v1/tasks/{job_b.public_id}", headers=headers_b)
    assert resp_b.status_code == 200

    # User A receives 404
    resp_a = client.get(f"/api/v1/tasks/{job_b.public_id}", headers=headers_a)
    assert resp_a.status_code == 404


def test_list_user_tasks_paginated(
    client: TestClient, db_session: Session, test_user_a: User, user_a_token: str
):
    """User can list their background jobs with pagination."""
    headers = {"Authorization": f"Bearer {user_a_token}"}

    job1 = BackgroundJob(
        user_id=test_user_a.id,
        job_type="report_processing",
        status="succeeded",
        progress_percent=100,
    )
    job2 = BackgroundJob(
        user_id=test_user_a.id,
        job_type="analytics_aggregation",
        status="running",
        progress_percent=50,
    )
    db_session.add_all([job1, job2])
    db_session.commit()

    response = client.get("/api/v1/tasks?page=1&page_size=10", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["pagination"]["total"] >= 2
    assert len(data["items"]) >= 2
