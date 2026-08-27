# MatriGluco — Offline Local AI Chatbot & RAG Subsystem

This subsystem implements an **offline, local generative AI maternal health assistant** powered by `llama.cpp` (`llama-cpp-python`) and local GGUF models.

## Key Architecture
1. **100% Offline & Private**: Operates with zero dependency on cloud LLM APIs (no OpenAI, Gemini, or Anthropic keys).
2. **Clinical Safety Guardrails**: Hardcoded emergency triage routing, PII redaction, output prescription filtering, and disclaimer injection.
3. **Retrieval-Augmented Generation (RAG)**: Context grounded in verified maternal guidelines and medical knowledge chunks.

## Modules
- `runtime/`: GGUF model loader, runtime execution, and health status probes.
- `chatbot/`: Multi-turn conversation orchestration, memory bounding, and intent classification.
- `rag/`: Document chunking, local embeddings, and context retrieval.
- `prompts/`: Versioned maternal health system and safety prompts.
- `safety/`: Medical scope detector, redactor, and disclaimer enforcement.
- `knowledge/`: Clinical guideline ingestion pipeline.
