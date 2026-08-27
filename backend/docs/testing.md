# MatriGluco Test Strategy & Test Pyramid Specification

---

## 1. Test Pyramid Hierarchy

| Layer | Primary Focus | Directory | Execution Command |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Pure algorithmic logic, security helpers, ML contracts, cache key generation, upload validation, logging filters | `tests/unit/` | `pytest tests/unit -v` |
| **Repository Integration** | Database query semantics, foreign key constraints, rollback safety, user-scoping | `tests/integration/` | `pytest tests/integration -v` |
| **Infrastructure Integration** | Redis cache TTL, distributed locks, rate limit counters, Celery task idempotency, private storage | `tests/integration/` | `pytest tests/integration -v` |
| **API Endpoints** | HTTP status codes, request/response schemas, JWT authentication, standard error envelopes | `tests/api/` | `pytest tests/api -v` |
| **Ownership Security (IDOR)** | Cross-user tenant isolation across all 9 private domains | `tests/api/test_ownership_security.py` | `pytest tests/api/test_ownership_security.py -v` |
| **Data Migration** | Supabase export import, count parity, UUID preservation, orphan detection, historical equivalence | `tests/migration/` | `pytest tests/migration -v` |

---

## 2. Complete Test Execution

```powershell
# Run entire test suite (180 tests)
.\venv\Scripts\pytest.exe -v

# Run with test coverage
.\venv\Scripts\pytest.exe --cov=app --cov-report=term-missing

# Run linter & static type checks
.\venv\Scripts\ruff.exe check app
.\venv\Scripts\mypy.exe app
```
