# MatriGluco Backend Architecture Specification & Responsibility Map

## 1. System Overview & Dependency Direction
MatriGluco is built as a **production-grade modular monolith**.
Every layer maintains a strict forward-only dependency graph:

```text
API / Endpoints (Thin HTTP adapters, validation, serialization)
      │
      ▼
   Services (Business rules, authorization, transactions, orchestration)
      │
      ├─────────────► Repositories (SQLAlchemy 2.0 query persistence, ownership scoping)
      │                    │
      │                    ▼
      │                  Models (Declarative persistence entities & relationships)
      │
      ├─────────────► ML Subsystem (Canonical feature contracts, validation, tabular risk predictor)
      ├─────────────► AI Subsystem (Offline llama.cpp runtime, safety guardrails, RAG retriever, prompts)
      ├─────────────► Cache (Redis transient caching, distributed locks, rate counters)
      ├─────────────► Integrations (OCR parser, private storage, email adapters)
      └─────────────► Task Gateway (Celery asynchronous job entrypoints)
```

Shared foundational infrastructure modules (`core/`, `db/`, `observability/`, `utils/`) support the application without introducing reverse dependencies.

---

## 2. Core Layer Responsibility Matrix

| Layer | May Do | Must NOT Do |
|---|---|---|
| `api/endpoints` | HTTP request parsing, path/query validation, dependency injection wiring, response serialization, HTTP status decisions | Raw SQL, direct SQLAlchemy query logic, model loading, Redis business logic, direct Celery configuration |
| `services` | Business rules, authorization, transaction ownership, repository coordination, cache invalidation, task enqueueing, ML/AI/storage orchestration | Depend unnecessarily on FastAPI HTTP objects, construct raw SQL, expose ORM implementation details |
| `repositories` | SQLAlchemy persistence, filtered queries, pagination, aggregates, ownership-scoped queries (`get_owned`, `list_owned`) | UI decisions, HTTP responses, business workflows, trust arbitrary request-provided `user_id`, call external APIs |
| `schemas` | Pydantic request/response contracts, field constraints, input validation, serialization | ORM queries, database commits, Redis access, Celery calls, model inference |
| `models` | SQLAlchemy table mappings, relationships, indexes, constraints, database-level defaults | Serve directly as public API response contracts, access HTTP requests, call Celery/Redis/ML/AI |
| `ml/inference` | Canonical feature contract (`DiabetesRiskFeatures`), feature validation, feature mapping, model loading, inference, risk classification | Read frontend form semantics implicitly, perform user authorization, write prediction history directly |
| `ml/training` | Dataset preparation, preprocessing, training, evaluation, artifact creation | Run during normal API startup, serve HTTP requests, mutate production prediction records |
| `ai/runtime` | GGUF loading, llama.cpp execution, generation parameters, runtime health, model metadata | Database authorization, conversation ownership logic, direct endpoint concerns |
| `ai/chatbot` | Context building, orchestration, conversation memory assembly, response generation flow | Direct SQLAlchemy persistence, endpoint-level auth handling, raw storage access |
| `ai/rag` | Knowledge chunking, embeddings, retrieval, ranking, RAG contracts | Decide user authorization, expose arbitrary untrusted documents, write HTTP responses |
| `ai/safety` | Medical-scope enforcement, emergency triage interception, output safety validation, privacy controls (PII redaction), disclaimers | Diagnose users, store arbitrary patient state, bypass service authorization |
| `ai/prompts` | Versioned system prompts, safety prompts, prompt templates | Query databases directly, include secrets, contain persistence logic |
| `cache` | Redis connections, key construction, TTLs, counters, locks, short-lived context/cache | Become source of truth, store authoritative medical history only, contain domain workflows |
| `workers` | Celery app/configuration, task infrastructure, retry hooks, worker lifecycle | Domain-specific business workflows, HTTP request processing |
| `tasks` | Background task entrypoints, retry/idempotency behavior, calling services using durable IDs | Receive large file bytes, ORM objects, raw secrets, duplicated service logic |
| `integrations` | OCR, email, storage provider adapters | Domain authorization, business ownership decisions, HTTP route behavior |
| `observability` | Metrics, tracing, health instrumentation, latency/error measurements | Mutate domain records arbitrarily, expose sensitive medical content |
| `utils` | Small domain-neutral reusable helpers | Become a dumping ground for services, database workflows, chatbot orchestration |
| `scripts/migration` | Repeatable export/transform/import/verification tooling | Run automatically during API startup, become runtime dependencies |

---

## 3. Forbidden Reverse Dependencies

The following dependency directions are strictly prohibited and enforced by static architectural tests:
- `models` $\rightarrow$ `services` / `api` (Forbidden)
- `repositories` $\rightarrow$ `api` / `fastapi.HTTPException` (Forbidden)
- `schemas` $\rightarrow$ `repositories` / `sqlalchemy.orm.Session` (Forbidden)
- `ai/runtime` $\rightarrow$ `api` / `services` (Forbidden)
- `ml/inference` $\rightarrow$ `api` / Frontend semantics (Forbidden)
- `integrations` $\rightarrow$ domain authorization (Forbidden)

---

## 4. Key Architectural Invariants

### 4.1. Transaction Ownership
- **Services own transactions**: A service coordinates multi-step operations (e.g. creating medical report $\rightarrow$ saving file metadata $\rightarrow$ enqueuing background job $\rightarrow$ invalidating cache), committing only upon complete workflow success, and rolling back upon failure.
- **Repositories flush**: Repository persistence methods (`create`, `update`, `delete`) add and flush to the session without independent commits, allowing the service to manage atomicity.

### 4.2. Authenticated Ownership Scoping
- User-owned APIs must never trust request body or query parameters (e.g., `?user_id=123`) as proof of authorization.
- Repositories provide explicit methods (`get_owned`, `list_owned`, `exists_owned`) that constrain ownership directly in SQL:
  ```python
  stmt = select(Prediction).where(
      Prediction.id == prediction_id, Prediction.user_id == authenticated_owner_user_id
  )
  ```

### 4.3. Authoritative vs Transient Data Sources
- **MySQL / MariaDB**: Sole durable source of truth for patient records, metabolic measurements, risk assessments, reports, conversations, and background job metadata.
- **Redis**: Strictly transient infrastructure for rate limits, session caches, distributed locks, and Celery broker queues.

### 4.4. Offline Local Generative AI Architecture
- Runs 100% offline via `llama-cpp-python` and GGUF quantized models with zero reliance on cloud LLM keys or external cloud APIs.
- Execution flow:
  `Endpoint` $\rightarrow$ `ChatbotService (Authorization & Persistence)` $\rightarrow$ `ChatOrchestrator (Memory + RAG + Safety)` $\rightarrow$ `LlamaCppRuntime (GGUF)` $\rightarrow$ `ChatbotService (Commit)` $\rightarrow$ `Response`.

### 4.5. Celery Task Queue Payload Rule
- Background task messages must contain only minimal durable identifiers (`report_id`, `document_id`, `user_id`).
- Never pass raw file bytes, ORM objects, JWT tokens, or secrets through task broker messages.
