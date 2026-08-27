# MatriGluco — System Architecture, AI Subsystem & Caching Specification

> **Version:** 3.0.0  
> **Platform Stack:** FastAPI + MySQL 8.0+ / MariaDB 10.5+ + Redis + Celery + scikit-learn + `llama-cpp-python` (GGUF) + FAISS  
> **Updated Date:** 2026-08-17  

---

## 1. High-Level Architecture Overview

MatriGluco operates two distinct, specialized AI subsystems alongside standard healthcare and obstetric monitoring workflows:

1. **Tabular GDM Risk Predictor** (Supervised Machine Learning: XGBoost / scikit-learn)
   - Evaluates maternal clinical indicators (fasting glucose, BMI, gestational age, parity, blood pressure, etc.)
   - Generates calibrated probability scores and risk bands (Low, Moderate, High, Critical).

2. **Offline Maternal AI Health Assistant & RAG Engine** (Local Generative LLM: `llama-cpp-python` + GGUF + FAISS)
   - Runs **100% locally and offline** with zero dependency on paid commercial APIs (no OpenAI / Anthropic keys).
   - Employs Dense Retrieval-Augmented Generation (RAG) grounded in verified maternal health guidelines.
   - Enforces clinical safety guardrails, disclaimer injection, and source traceability.

```text
                                  ┌───────────────────────────┐
                                  │      React Frontend       │
                                  └─────────────┬─────────────┘
                                                │ REST / SSE Streaming
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                               FASTAPI BACKEND APPLICATION                                   │
│                                                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  ┌────────────────────────────┐  │
│  │   Core Health Domain    │  │   Clinical ML Predictor  │  │   AI Health Assistant      │  │
│  │  - Auth & Profiles      │  │  - XGBoost Classifier    │  │  - llama-cpp-python (GGUF)  │  │
│  │  - Obstetric GPA / EDD  │  │  - Fast Feature Pipeline │  │  - Dense Retrieval (FAISS) │  │
│  │  - Vitals & Lab Reports │  │  - Risk Probability     │  │  - Safety & Grounding      │  │
│  └────────────┬────────────┘  └────────────┬─────────────┘  └─────────────┬──────────────┘  │
└───────────────┼────────────────────────────┼──────────────────────────────┼─────────────────┘
                │                            │                              │
                ▼                            ▼                              ▼
┌───────────────────────────────┐ ┌──────────────────────────┐ ┌───────────────────────────────┐
│     MYSQL / MARIADB (DB)      │ │   REDIS (Cache & Broker) │ │    FILESYSTEM (Local Disk)    │
│  - 31 Production Tables       │ │  - Session Context Cache │ │  - models/ml/*.joblib         │
│  - Users, Health, Vitals      │ │  - Rate Limiting         │ │  - models/llm/*.gguf          │
│  - Model Metadata & Versions  │ │  - Celery Message Queue  │ │  - models/rag/faiss.index     │
│  - Conversations & Sources    │ │  - Semantic Query Cache  │ │  - uploads/medical_reports/   │
└───────────────────────────────┘ └────────────┬─────────────┘ └───────────────────────────────┘
                                               │
                                               ▼
                                  ┌──────────────────────────┐
                                  │   CELERY ASYNC WORKERS   │
                                  │  - Document Chunk Index  │
                                  │  - FAISS Re-indexing     │
                                  │  - Chat Summarization    │
                                  │  - OCR Lab Processing    │
                                  └──────────────────────────┘
```

---

## 2. Model Storage vs. Loading Strategy (Disk vs. RAM vs. Database)

```text
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                 FILESYSTEM (Local Disk)                               │
│  backend/models/ml/gdm_xgboost_v1.joblib        → Binary ML model (~5 MB)             │
│  backend/models/llm/matrigluco-assistant.gguf   → Quantized GGUF binary (~4.5 GB)     │
│  backend/models/rag/faiss_index.bin             → FAISS dense vector index (~20 MB)   │
└──────────────────────────────────────────┬────────────────────────────────────────────┘
                                           │ Loaded ONCE at server boot
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                BACKEND MEMORY (RAM / VRAM)                            │
│  - joblib.load(...)                      → In-memory ML predictor singleton           │
│  - Llama(model_path="...", n_ctx=4096)   → In-memory C++/CUDA LLM runtime instance    │
│  - faiss.read_index(...)                 → In-memory vector similarity index          │
└──────────────────────────────────────────┬────────────────────────────────────────────┘
                                           │ Reads config & logs history
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                    MYSQL DATABASE                                     │
│  - llm_models / model_versions           → Model paths, version tags, hyperparameters │
│  - chat_conversations / chat_messages    → Dialogue history, token usage, timestamps  │
│  - prompt_templates / knowledge_chunks   → System prompts & verified medical texts    │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### Core Architecture Rules:
1. **Never store GGUF / Joblib binaries inside MySQL as BLOBs.** Doing so destroys buffer pool caching, inflates table size, slows backups, and introduces 10-30s deserialization latency per request.
2. **Binaries live on disk** (`backend/models/`), **metadata lives in MySQL** (`llm_models`, `model_versions`), and **active execution instances live in Python RAM** as singletons.
3. **Load once at server startup**: FastAPI initializes models in its `lifespan` handler, providing near-instantaneous inference response times.

---

## 3. Database Schema Overview (10 Domains / 31 Tables)

The complete SQL definition is maintained in [`backend/schema.sql`](file:///d:/Matrigluco/backend/schema.sql) and [`schema.sql`](file:///d:/Matrigluco/schema.sql).

```text
MATRIGLUCO PRODUCTION DATABASE (MySQL 8.0+ / MariaDB 10.5+)
│
├── DOMAIN 1: AUTHENTICATION & ACCESS CONTROL
│   ├── users                      (Core identity, Argon2 password hash, UUID)
│   ├── user_profiles              (Demographics, timezone, language, phone)
│   ├── user_sessions              (Hashed refresh tokens, active device sessions)
│   ├── auth_tokens                (Single-use verification & password reset tokens)
│   └── consent_records            (GDPR/HIPAA legal consent audit logs)
│
├── DOMAIN 2: MATERNAL & PREGNANCY CONTEXT
│   └── pregnancy_profiles         (Obstetric GPA history, EDD, gestational weeks)
│
├── DOMAIN 3: CLINICAL ML RISK ENGINE (Supervised Prediction)
│   ├── model_versions             (XGBoost / scikit-learn algorithm registry)
│   ├── risk_assessments           (Inference results, probability scores, risk band)
│   └── risk_assessment_features   (Granular feature input audit log)
│
├── DOMAIN 4: LONGITUDINAL HEALTH MEASUREMENTS
│   ├── health_measurements        (Time-series glucose, BP, weight, HbA1c vitals)
│   └── daily_health_summaries     (Precomputed daily rollups & glycemic trends)
│
├── DOMAIN 5: MEDICAL FILE ASSETS & OCR PIPELINE
│   ├── file_assets                (Storage keys, MIME validation, SHA-256 deduplication)
│   ├── medical_reports            (Lab documents & OCR extraction task state)
│   └── report_extracted_values    (Structured biomarkers parsed from reports)
│
├── DOMAIN 6: CLINICAL TELEHEALTH & CONSULTATIONS
│   └── consultations              (Doctor appointments & teleconsultation scheduling)
│
├── DOMAIN 7: NOTIFICATIONS & USER PREFERENCES
│   ├── notification_preferences   (Opt-in channels, reminder schedules, timezone)
│   └── notifications              (Outbox queue, delivery records, deduplication)
│
├── DOMAIN 8: AI CHATBOT, LOCAL LLM & RAG KNOWLEDGE ENGINE
│   ├── llm_models                 (GGUF model registry, quantization, context configs)
│   ├── user_ai_preferences        (Patient privacy opt-in & response style)
│   ├── prompt_templates           (Version-controlled system, safety & RAG prompts)
│   ├── knowledge_documents        (Curated medical guidelines & verification status)
│   ├── knowledge_chunks           (Text segments with FAISS embedding references)
│   ├── chat_conversations         (Multi-turn dialogue sessions & category tags)
│   ├── chat_messages              (Turn-by-turn history, token accounting, safety flags)
│   ├── chat_sources               (Traceability links: assistant answers -> RAG chunks)
│   ├── chat_message_feedback      (User quality feedback: helpful / unhelpful ratings)
│   ├── conversation_summaries     (Rolling context condensation for long chats)
│   └── ai_usage_logs              (Execution duration, memory, retrieval & token stats)
│
├── DOMAIN 9: DISTRIBUTED BACKGROUND PROCESSING
│   └── background_jobs            (Celery task execution lifecycle & retry counters)
│
└── DOMAIN 10: ENTERPRISE AUDIT LOGGING & SECURITY
    ├── audit_logs                 (Append-only clinical compliance audit trail)
    └── security_events            (Intrusion detection & authentication failure logs)
```

---

## 4. Multi-Layer Caching Architecture (Redis + In-Memory)

To achieve low-latency responses without redundant model computations, MatriGluco uses a 4-tier caching strategy:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. IN-MEMORY MODEL SINGLETON CACHE (RAM)                                    │
│    - GGUF LLM instance (Llama) kept resident in memory.                     │
│    - XGBoost risk classifier kept in memory.                                │
│    - FAISS vector index loaded in memory for microsecond nearest-neighbor.  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. REDIS CONVERSATION CONTEXT CACHE (TTL: 2 Hours)                          │
│    - Key: matrigluco:chat:context:{conversation_id}                         │
│    - Stores: Token-trimmed sliding window of recent conversation turns.     │
│    - Avoids querying MySQL `chat_messages` on every chat turn.              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. REDIS SEMANTIC / FAQ CACHE (TTL: 24 Hours)                               │
│    - Key: matrigluco:chat:faq:{query_hash}                                  │
│    - Caches responses to common general queries (e.g., "What is OGTT?").    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. REDIS RATE LIMITING & MODEL STATUS (TTL: Dynamic)                        │
│    - Key: matrigluco:rate:{user_id} (e.g., max 20 messages/min)             │
│    - Key: matrigluco:llm:status (tracks model loaded/busy state)            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Redis Key Standard Convention

| Key Pattern | Data Structure | TTL | Purpose |
|---|---|---|---|
| `matrigluco:chat:conv:{conv_id}` | String / JSON | 2h | Cached conversation metadata & participants |
| `matrigluco:chat:context:{conv_id}` | List (JSON) | 2h | Sliding window of last 6-10 chat messages |
| `matrigluco:chat:rate:{user_id}` | String (Counter) | 60s | Rate limiting for chat endpoints |
| `matrigluco:rag:faq:{query_hash}` | String (JSON) | 24h | Grounded answers to frequently asked questions |
| `matrigluco:rag:version` | String | None | Version hash to invalidate cache when docs update |
| `matrigluco:llm:active_model` | String | None | Currently active GGUF model identifier |

---

## 5. Synchronous vs. Asynchronous Task Separation

### Synchronous (Direct FastAPI HTTP / SSE Stream)
Keep user-facing interactions real-time:
- `POST /api/v1/chat/conversations/{id}/messages` → Immediate token streaming via SSE / chunked transfer.
- `POST /api/v1/predictions/gdm` → Immediate risk score calculation (< 20ms).
- `POST /api/v1/auth/login` → Session issuance and JWT creation.

### Asynchronous (Celery Background Workers)
Defer heavy, blocking, or non-urgent operations to Celery queues:
- **`tasks.index_knowledge_document`**: Parses uploaded documents, creates chunks, computes embeddings.
- **`tasks.rebuild_faiss_index`**: Regenerates FAISS vector index when new verified knowledge is published.
- **`tasks.summarize_conversation`**: Condenses long dialogues into `conversation_summaries`.
- **`tasks.process_medical_ocr`**: Runs Tesseract / OCR pipeline on uploaded lab reports.
- **`tasks.cleanup_expired_tokens`**: Housekeeping cron for expired sessions and temporary files.

---

## 6. Directory Structure Blueprint

```text
backend/
├── app/
│   ├── ai/                             # Local LLM & RAG Subsystem
│   │   ├── chatbot/
│   │   │   ├── context_builder.py      # Combines user context, RAG chunks & history
│   │   │   ├── prompts.py              # Prompt template manager with fallback
│   │   │   ├── safety.py               # Safety guardrails & medical disclaimer rules
│   │   │   └── service.py              # Chat service orchestration
│   │   ├── inference/
│   │   │   ├── generation.py           # Token streaming generator
│   │   │   ├── llama_engine.py         # llama-cpp-python wrapper & singleton
│   │   │   └── model_loader.py         # Verifies checksums and loads GGUF
│   │   └── rag/
│   │       ├── embeddings.py           # Local Sentence-Transformers embeddings
│   │       ├── faiss_store.py          # FAISS index persistence & search
│   │       ├── indexer.py              # Document parser & chunk generator
│   │       └── retriever.py            # Top-k similarity retrieval & thresholding
│   │
│   ├── api/
│   │   └── endpoints/
│   │       ├── auth.py                 # Authentication endpoints
│   │       ├── chat.py                 # Conversational assistant endpoints
│   │       ├── health.py               # Measurements & vitals endpoints
│   │       ├── knowledge.py            # Knowledge base management endpoints
│   │       ├── predictions.py          # Tabular GDM risk prediction endpoints
│   │       └── reports.py              # Lab reports & OCR endpoints
│   │
│   ├── core/
│   │   ├── config.py                   # App settings & env configurations
│   │   ├── database.py                 # SQLAlchemy engine & SessionLocal
│   │   ├── redis.py                    # Redis client & cache utility helpers
│   │   └── security.py                 # Password hashing & JWT handling
│   │
│   ├── ml/                             # Tabular ML Subsystem
│   │   ├── gdm_classifier.py           # XGBoost inference wrapper
│   │   ├── preprocessor.py             # Imputation & feature scaling pipeline
│   │   └── risk_engine.py              # Risk level determination logic
│   │
│   └── models/
│       └── schemas.py                  # SQLAlchemy ORM & Pydantic models
│
├── models/                             # Persistent Model Storage (Ignored in Git)
│   ├── llm/
│   │   └── matrigluco-assistant-q4.gguf
│   ├── ml/
│   │   ├── gdm_xgboost_v1.joblib
│   │   └── scaler.joblib
│   └── rag/
│       └── faiss_index.bin
│
├── schema.sql                          # MySQL 8.0+ / MariaDB 10.5+ schema (31 tables)
└── requirements.txt                    # Python dependencies
```

---

## 7. Model Loader Code Reference

### FastAPI Lifespan Singleton Pattern (`backend/app/main.py`)

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.ai.inference.llama_engine import LLMEngine
from app.ml.risk_engine import GDMModelService
from app.ai.rag.faiss_store import FAISSVectorStore
from app.core.database import SessionLocal
from app.models.schemas import LLMModel


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[BOOT] Initializing MatriGluco AI Subsystems...")

    # 1. Initialize Tabular ML Risk Model
    GDMModelService.initialize(model_path="models/ml/gdm_xgboost_v1.joblib")

    # 2. Load FAISS Dense Vector Index for RAG
    FAISSVectorStore.initialize(index_path="models/rag/faiss_index.bin")

    # 3. Query Active Default GGUF Model Config from MySQL
    db = SessionLocal()
    active_llm = (
        db.query(LLMModel).filter(LLMModel.is_default == True, LLMModel.is_active == True).first()
    )
    db.close()

    model_path = active_llm.model_path if active_llm else "models/llm/matrigluco-assistant-q4.gguf"
    context_length = active_llm.context_length if active_llm else 4096

    # 4. Preload GGUF Model into Backend RAM / VRAM
    LLMEngine.initialize(model_path=model_path, n_ctx=context_length)

    print("[BOOT] All AI engines loaded and ready for live requests.")
    yield
    print("[SHUTDOWN] Releasing model resources.")


app = FastAPI(title="MatriGluco API", lifespan=lifespan)
```

---

## 8. Summary Checklist for Faculty / Project Review

- [x] **Local Offline Execution**: Zero dependencies on commercial API keys (OpenAI / Anthropic).
- [x] **Separation of ML & LLM**: Supervised risk classification (XGBoost) is cleanly separated from generative conversational guidance (Llama.cpp).
- [x] **Model Governance**: Model versions, checksums, hyperparameters, and prompt templates are versioned in MySQL.
- [x] **RAG Clinical Traceability**: Assistant responses record foreign-key linkages (`chat_sources`) back to verified medical chunks (`knowledge_chunks`).
- [x] **Patient Privacy by Design**: `user_ai_preferences` enforces explicit patient consent before vitals or history are passed to context.
- [x] **Performance Optimization**: Multi-layer caching with Redis and memory-resident model singletons ensures instant inference.
