import pytest
from app.ai.chatbot.contracts import ChatMessageDTO, ConversationContextDTO
from app.ai.chatbot.conversation_memory import ConversationMemory
from app.ai.chatbot.context_builder import ContextBuilder
from app.ai.chatbot.intent import detect_chat_intent, ChatIntent
from app.ai.rag.contracts import RAGChunk, RAGSearchResult
from app.ai.rag.retriever import KeywordRAGRetriever
from app.ai.chatbot.orchestrator import ChatOrchestrator


def test_conversation_memory_bounding():
    memory = ConversationMemory(max_history_messages=3)
    msgs = [ChatMessageDTO(role="user", content=f"Message {i}") for i in range(10)]
    trimmed = memory.trim_history(msgs)

    assert len(trimmed) == 3
    assert trimmed[0]["content"] == "Message 7"
    assert trimmed[2]["content"] == "Message 9"


def test_intent_detection():
    assert (
        detect_chat_intent("What is my fasting glucose level supposed to be?")
        == ChatIntent.CLINICAL_GDM
    )
    assert detect_chat_intent("Can you suggest a low carb meal recipe?") == ChatIntent.NUTRITION
    assert detect_chat_intent("I am bleeding heavily") == ChatIntent.EMERGENCY


def test_context_builder_prompt_formatting():
    builder = ContextBuilder()
    ctx = ConversationContextDTO(
        conversation_id="conv-1",
        user_id="usr-1",
        pregnancy_week=26,
        risk_level="Moderate Risk",
    )
    chunk = RAGChunk(
        chunk_id="chk-1",
        document_id="doc-1",
        text="Normal 1-hour postprandial glucose is below 140 mg/dL.",
    )
    search_res = [RAGSearchResult(chunk=chunk, similarity_score=0.85)]

    prompt = builder.build_prompt(
        context=ctx,
        trimmed_history=[{"role": "user", "content": "Hello"}],
        current_message="What should my post meal blood sugar be?",
        retrieved_chunks=search_res,
    )

    assert "<|begin_of_text|>" in prompt
    assert "Week 26" in prompt
    assert "Normal 1-hour postprandial" in prompt
    assert "What should my post meal blood sugar be?" in prompt


def test_keyword_retriever():
    chunk1 = RAGChunk(
        chunk_id="c1", document_id="d1", text="Insulin therapy in gestational diabetes."
    )
    chunk2 = RAGChunk(
        chunk_id="c2", document_id="d2", text="Iron and folic acid prenatal vitamins."
    )

    retriever = KeywordRAGRetriever([chunk1, chunk2])
    results = retriever.retrieve("insulin therapy")

    assert len(results) >= 1
    assert results[0].chunk.document_id == "d1"


def test_context_builder_with_assessment_and_tracking_data():
    builder = ContextBuilder()
    ctx = ConversationContextDTO(
        conversation_id="conv-1",
        user_id="usr-1",
        pregnancy_week=28,
        blood_group="O+",
        latest_assessment={
            "risk_band": "High Risk",
            "probability": 0.725,
            "prediction_result": "Positive",
            "input_snapshot_json": {
                "glucose": 142,
                "bmi": 29.1,
                "blood_pressure": "130/85",
            },
        },
        recent_measurements=[
            {
                "metric_type": "glucose",
                "value_primary": 104.0,
                "unit": "mg/dL",
                "measured_at_formatted": "Aug 18, 14:30",
                "notes": "Postprandial",
            },
            {
                "metric_type": "glucose",
                "value_primary": 90.0,
                "unit": "mg/dL",
                "measured_at_formatted": "Aug 17, 08:00",
                "notes": "Fasting",
            },
        ],
        use_health_context=True,
    )

    prompt = builder.build_prompt(
        context=ctx,
        trimmed_history=[],
        current_message="Can you explain my 104 mg/dL measurement?",
    )

    assert "PATIENT MATERNAL PROFILE:" in prompt
    assert "Week 28" in prompt
    assert "Blood Group: O+" in prompt
    assert "LATEST GESTATIONAL DIABETES RISK ASSESSMENT:" in prompt
    assert "High Risk (72.5% probability)" in prompt
    assert "Fasting Glucose: 142 mg/dL" in prompt
    assert "RECENT HEALTH MEASUREMENTS & GLUCOSE TELEMETRY:" in prompt
    assert "Aug 18, 14:30" in prompt
    assert "104.0 mg/dL (Postprandial)" in prompt
