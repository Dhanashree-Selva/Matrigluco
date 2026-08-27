import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.ai.chatbot.contracts import ChatResponseDTO


def test_chatbot_conversations_flow(
    client: TestClient, test_user_a: User, test_user_b: User, user_a_token: str, user_b_token: str
):
    """Chatbot conversations API allows creation, listing, detail, renaming, deletion, and message sending."""
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    headers_b = {"Authorization": f"Bearer {user_b_token}"}

    # 1. Create conversation
    conv_resp = client.post(
        "/api/v1/chatbot/conversations",
        headers=headers_a,
        json={"title": "Diet and Exercise Guidance"},
    )
    assert conv_resp.status_code == 201
    conv = conv_resp.json()
    assert conv["title"] == "Diet and Exercise Guidance"
    conv_id = conv["id"]

    # 2. List conversations
    list_resp = client.get("/api/v1/chatbot/conversations", headers=headers_a)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # 3. Get detail
    detail_resp = client.get(f"/api/v1/chatbot/conversations/{conv_id}", headers=headers_a)
    assert detail_resp.status_code == 200

    # 4. User B cannot access User A's conversation -> 404
    attack_resp = client.get(f"/api/v1/chatbot/conversations/{conv_id}", headers=headers_b)
    assert attack_resp.status_code == 404

    # 5. Update conversation
    patch_resp = client.patch(
        f"/api/v1/chatbot/conversations/{conv_id}",
        headers=headers_a,
        json={"title": "Updated Title"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["title"] == "Updated Title"

    # 6. Send message (with mocked orchestrator response)
    mock_response = ChatResponseDTO(
        conversation_id=conv_id,
        message="Fasting blood glucose during pregnancy should typically remain below 95 mg/dL.",
        model_version="1.0.0",
        tokens_generated=32,
        latency_ms=120.5,
        sources_cited=["maternal-guidelines"],
    )

    with patch(
        "app.ai.chatbot.orchestrator.ChatOrchestrator.process_message", return_value=mock_response
    ):
        msg_resp = client.post(
            f"/api/v1/chatbot/conversations/{conv_id}/messages",
            headers=headers_a,
            json={
                "content": "What are the recommended fasting blood sugar levels during pregnancy?"
            },
        )
        assert msg_resp.status_code == 200
        msg_data = msg_resp.json()
        assert msg_data["role"] == "assistant"
        assert len(msg_data["content"]) > 0

    # 7. Test SSE streaming endpoint
    with patch(
        "app.ai.chatbot.orchestrator.ChatOrchestrator.stream_message",
        return_value=iter(["Fasting ", "glucose ", "should ", "be ", "< 95."]),
    ):
        stream_resp = client.post(
            f"/api/v1/chatbot/conversations/{conv_id}/stream",
            headers=headers_a,
            json={"content": "Can you stream advice?"},
        )
        assert stream_resp.status_code == 200
        assert "text/event-stream" in stream_resp.headers.get("content-type", "")
        assert stream_resp.headers.get("cache-control") == "no-cache"
        assert stream_resp.headers.get("x-accel-buffering") == "no"
        assert "data: Fasting" in stream_resp.text
        assert "data: [DONE]" in stream_resp.text

    # 8. Get messages history
    history_resp = client.get(
        f"/api/v1/chatbot/conversations/{conv_id}/messages", headers=headers_a
    )
    assert history_resp.status_code == 200
    assert len(history_resp.json()) >= 4  # (user + assistant) x 2

    # 9. Delete conversation
    del_resp = client.delete(f"/api/v1/chatbot/conversations/{conv_id}", headers=headers_a)
    assert del_resp.status_code == 204


def test_chatbot_rag_and_patient_database_context(
    client: TestClient, test_user_a: User, user_a_token: str, db_session: Session
):
    """End-to-end RAG and database profile synthesis correctly extracts user data from DB."""
    from app.models.risk_assessment import RiskAssessment
    from app.models.health import HealthMeasurement
    from datetime import datetime, timezone

    # Populate patient profile data in database
    test_user_a.pregnancy_week = 26
    test_user_a.blood_group = "B+"
    test_user_a.age = 29
    test_user_a.expected_due_date = "2026-11-20"

    # Populate a risk assessment
    ra = RiskAssessment(
        user_id=test_user_a.id,
        model_version_id=str(test_user_a.id),
        probability=0.15,
        risk_band="Low Risk",
        prediction_result="Low Risk (Negative)",
        input_snapshot_json={"glucose": 92, "bmi": 24.5, "blood_pressure": 118},
    )
    db_session.add(ra)

    # Populate a health measurement
    meas = HealthMeasurement(
        user_id=test_user_a.id,
        metric_type="glucose_fasting",
        value_primary=88.0,
        unit="mg/dL",
        measured_at=datetime.now(timezone.utc),
        notes="Morning fasting reading",
    )
    db_session.add(meas)
    db_session.commit()

    headers = {"Authorization": f"Bearer {user_a_token}"}

    # Create conversation
    conv_resp = client.post(
        "/api/v1/chatbot/conversations",
        headers=headers,
        json={"title": "Profile and Telemetry Query"},
    )
    assert conv_resp.status_code == 201
    conv_id = conv_resp.json()["id"]

    # Ask for database profile (blood group and gestational week)
    msg_resp = client.post(
        f"/api/v1/chatbot/conversations/{conv_id}/messages",
        headers=headers,
        json={"content": "What is my blood group and gestational week in the database?"},
    )
    assert msg_resp.status_code == 200
    reply = msg_resp.json()["content"]
    assert "B+" in reply
    assert "26" in reply

    # Ask for risk assessment
    risk_resp = client.post(
        f"/api/v1/chatbot/conversations/{conv_id}/messages",
        headers=headers,
        json={"content": "What is my latest risk score and assessment?"},
    )
    assert risk_resp.status_code == 200
    risk_reply = risk_resp.json()["content"]
    assert "Low Risk" in risk_reply
    assert "15" in risk_reply or "probability" in risk_reply
