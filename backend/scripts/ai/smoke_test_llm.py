"""
Runs a safe smoke test of the offline local AI Chatbot pipeline and guardrails.
"""

import os
import sys

# Ensure repository root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.ai.chatbot.orchestrator import ChatOrchestrator
from app.ai.chatbot.contracts import ConversationContextDTO, ChatMessageDTO
from app.ai.runtime.runtime_health import check_ai_runtime_health


def smoke_test_ai():
    print("Checking AI Runtime Health:")
    health = check_ai_runtime_health()
    for k, v in health.items():
        print(f"  {k}: {v}")

    print("\nTesting Safety Guardrail Emergency Triage Interceptor:")
    orchestrator = ChatOrchestrator()
    ctx = ConversationContextDTO(
        conversation_id="test-conv", user_id="test-user", pregnancy_week=28
    )

    emergency_response = orchestrator.process_message(
        context=ctx,
        history=[],
        user_message="I have heavy vaginal bleeding and severe cramps",
    )
    print("Emergency Response Test:")
    print("  Message:", emergency_response.message)
    print("  Model Version:", emergency_response.model_version)


if __name__ == "__main__":
    smoke_test_ai()
