import logging
from typing import List, Optional
from app.ai.chatbot.contracts import ConversationContextDTO, ChatMessageDTO, ChatResponseDTO
from app.ai.chatbot.context_builder import ContextBuilder
from app.ai.chatbot.conversation_memory import ConversationMemory
from app.ai.chatbot.response_generator import ResponseGenerator
from app.ai.safety.guardrails import safety_guardrails, SafetyGuardrails
from app.ai.rag.retriever import RAGRetriever, KeywordRAGRetriever

logger = logging.getLogger("matrigluco.ai.orchestrator")


class ChatOrchestrator:
    """
    Coordinates multi-turn maternal chatbot conversations:
    Guardrails -> Bounded Memory -> RAG Context -> Prompt Assembly -> Local LLM -> Output Sanitization.
    """

    def __init__(
        self,
        context_builder: ContextBuilder = None,
        memory: ConversationMemory = None,
        generator: ResponseGenerator = None,
        retriever: RAGRetriever = None,
        guardrails: SafetyGuardrails = None,
    ):
        self.context_builder = context_builder or ContextBuilder()
        self.memory = memory or ConversationMemory()
        self.generator = generator or ResponseGenerator()
        self.retriever = retriever or KeywordRAGRetriever()
        self.guardrails = guardrails or safety_guardrails

    def process_message(
        self,
        context: ConversationContextDTO,
        history: List[ChatMessageDTO],
        user_message: str,
    ) -> ChatResponseDTO:
        # 1. Pre-inference safety check (Emergency triage / PII redaction)
        short_circuit, sanitized_input, direct_reply = self.guardrails.process_input(user_message)
        if short_circuit and direct_reply:
            return ChatResponseDTO(
                conversation_id=context.conversation_id,
                message=direct_reply,
                model_version="safety_guardrail_v1",
                tokens_generated=0,
                latency_ms=0.0,
            )

        # 2. Retrieve verified RAG clinical context
        retrieved_chunks = self.retriever.retrieve(sanitized_input, top_k=2)

        # 3. Trim conversation history
        trimmed_history = self.memory.trim_history(history)

        # 4. Build prompt
        prompt = self.context_builder.build_prompt(
            context=context,
            trimmed_history=trimmed_history,
            current_message=sanitized_input,
            retrieved_chunks=retrieved_chunks,
        )

        # 5. Execute local LLM generation
        gen_result = self.generator.generate_response(prompt)

        # 6. Post-generation safety validation & disclaimer injection
        safe_output = self.guardrails.process_output(gen_result.text)

        return ChatResponseDTO(
            conversation_id=context.conversation_id,
            message=safe_output,
            model_version=gen_result.model_name,
            tokens_generated=gen_result.tokens_generated,
            latency_ms=gen_result.latency_ms,
            sources_cited=[r.chunk.document_id for r in retrieved_chunks],
        )

    def stream_message(
        self,
        context: ConversationContextDTO,
        history: List[ChatMessageDTO],
        user_message: str,
    ):
        """Streams response tokens through local LLM runtime."""
        # 1. Pre-inference safety check
        short_circuit, sanitized_input, direct_reply = self.guardrails.process_input(user_message)
        if short_circuit and direct_reply:
            yield direct_reply
            return

        # 2. Retrieve verified RAG clinical context
        retrieved_chunks = self.retriever.retrieve(sanitized_input, top_k=2)

        # 3. Trim conversation history
        trimmed_history = self.memory.trim_history(history)

        # 4. Build prompt
        prompt = self.context_builder.build_prompt(
            context=context,
            trimmed_history=trimmed_history,
            current_message=sanitized_input,
            retrieved_chunks=retrieved_chunks,
        )

        # 5. Stream tokens
        for token in self.generator.stream_response(prompt):
            yield token
