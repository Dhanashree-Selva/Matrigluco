from typing import List, Dict
from app.ai.chatbot.contracts import ConversationContextDTO, ChatMessageDTO
from app.ai.prompts.system import MATERNAL_HEALTH_SYSTEM_PROMPT
from app.ai.prompts.contextual import format_patient_context_prompt
from app.ai.prompts.templates import build_llama3_chat_prompt
from app.ai.rag.contracts import RAGSearchResult


class ContextBuilder:
    """
    Assembles system prompt, patient clinical context, verified RAG knowledge, and bounded message history.
    """

    def build_prompt(
        self,
        context: ConversationContextDTO,
        trimmed_history: List[Dict[str, str]],
        current_message: str,
        retrieved_chunks: List[RAGSearchResult] = None,
    ) -> str:
        # Build patient clinical context if authorized
        patient_ctx = ""
        if context.use_health_context:
            patient_ctx = format_patient_context_prompt(
                pregnancy_week=context.pregnancy_week,
                risk_level=context.risk_level,
                due_date=context.due_date,
                blood_group=context.blood_group,
                age=context.age,
                previous_pregnancies=context.previous_pregnancies,
                latest_assessment=context.latest_assessment,
                recent_measurements=context.recent_measurements,
                focused_resource=context.focused_resource,
            )

        # Build RAG context
        rag_text = ""
        if retrieved_chunks:
            rag_text = "\n\n".join(
                [f"[{idx + 1}] {r.chunk.text}" for idx, r in enumerate(retrieved_chunks)]
            )

        # Append current user message
        full_messages = trimmed_history + [{"role": "user", "content": current_message}]

        return build_llama3_chat_prompt(
            system_prompt=MATERNAL_HEALTH_SYSTEM_PROMPT,
            messages=full_messages,
            rag_context=rag_text,
            patient_context=patient_ctx,
        )
