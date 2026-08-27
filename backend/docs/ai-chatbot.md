# MatriGluco — Local AI Chatbot Architecture

## 1. Purpose
The MatriGluco AI Assistant is a fully local, privacy-preserving generative AI engine designed specifically for maternal health education, nutrition, and gestational glucose guidance. It operates without external cloud LLM dependencies (Zero OpenAI, Gemini, Anthropic, or Groq calls).

---

## 2. Local llama.cpp Architecture
- **Inference Runtime**: Direct execution via `llama-cpp-python` (`from llama_cpp import Llama`).
- **No Ollama Required**: Runs directly within the Python process or bounded worker; no `ollama serve` or background daemon needed.
- **Model Format**: Quantized GGUF models located under `storage/ai/models/` (e.g. `storage/ai/models/model.gguf`).
- **Concurrency & Resource Management**: In-process singleton model loading with bounded execution locks to prevent CPU/RAM exhaustion on local hardware.

---

## 3. Workflow & Lifecycle

```text
Authenticated User
       │
       ▼
POST /api/v1/chatbot/conversations/{id}/messages
       │
       ▼
Persist User Message (MySQL) ──► COMMIT
       │
       ▼
Pre-Inference Safety & Triage (Emergency check / PII redaction)
       │
       ├─► (If Emergency) ──► Return Static Escalation Notice
       │
       ▼
Bounded Context Assembly (Recent history + Authorized patient data + Optional local RAG)
       │
       ▼
Local llama.cpp Generation (GGUF Inference outside DB transaction)
       │
       ▼
Post-Inference Safety Validation & Disclaimer Injection
       │
       ▼
Persist Assistant Message (MySQL) ──► COMMIT
       │
       ▼
JSON Response Envelope (with X-Request-ID)
```

---

## 4. Operational Scripts
- **Register LLM**: `python scripts/ai/register_llm.py`
- **Verify GGUF**: `python scripts/ai/verify_gguf.py`
- **Smoke Test**: `python scripts/ai/smoke_test_llm.py`
- **Knowledge Ingestion**: `python scripts/ai/ingest_knowledge.py`
