# MatriGluco — Redis Architecture, Rate Limiting, Idempotency & Distributed Coordination

## 1. Redis Responsibilities & Boundaries

Redis operates strictly as **transient infrastructure**.

```text
MySQL / MariaDB
    = authoritative durable application state

Private Storage
    = authoritative medical file bytes

Redis
    = transient infrastructure only
```

Data loss or Redis restart **never erases** authoritative user records, health telemetry, predictions, reports, consultations, or audit events.

---

## 2. Logical Database Topology

| Logical DB | Purpose | Configuration Variable |
| :--- | :--- | :--- |
| **`/0`** | Application Cache, Rate Limits, Idempotency, Distributed Locks | `REDIS_URL=redis://127.0.0.1:6379/0` |
| **`/1`** | Celery Task Broker | `CELERY_BROKER_URL=redis://127.0.0.1:6379/1` |
| **`/2`** | Celery Short-Lived Result Backend | `CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/2` |

---

## 3. Centralized Key Contract & Namespaces

All Redis keys are constructed centrally via [`app/cache/keys.py`](file:///d:/Matrigluco/backend/app/cache/keys.py).

| Domain | Key Pattern | TTL | Scoping |
| :--- | :--- | :---: | :--- |
| **Dashboard Summary** | `matrigluco:v1:dashboard:user:{user_id}` | 300s | Scoped to authenticated `user_id`. |
| **Rate Limit (IP)** | `matrigluco:rate:{scope}:{sha256(ip)}` | 60s–900s | Hashed client IP. |
| **Rate Limit (Account)** | `matrigluco:rate:{scope}:{sha256(email)}` | 300s | Hashed normalized email (no raw emails). |
| **Idempotency** | `matrigluco:idempotency:user:{user_id}:{scope}:{client_key}` | 900s | Scoped to `user_id` + operation + client key. |
| **Distributed Lock** | `matrigluco:lock:{resource_type}:{resource_id}` | 30s–300s | Scoped to resource identifier with unique token. |

---

## 4. Privacy & Secret-Safe Principles

1. **No Sensitive Data in Keys**: Keys never embed passwords, tokens, full emails, or clinical biomarker values.
2. **JSON-Only Cache Serialization**: Cached payloads use JSON; `pickle` is strictly forbidden.
3. **No Auth Token Caching**: JWT access tokens, refresh tokens, and password hashes are never cached in Redis.
4. **Secret Redaction**: Redis connection URLs and credentials are never emitted in logs, readiness probes, or error responses.

---

## 5. Distributed Locks & Unlock Safety

Distributed locks ([`app/cache/locks.py`](file:///d:/Matrigluco/backend/app/cache/locks.py)) prevent concurrent duplicate processing of medical reports and background tasks:
- **Atomic Acquisition**: `SET key <random_uuid_token> NX EX <timeout_seconds>`.
- **Atomic Lua Unlock**: Releases the key only if the token matches the owner, preventing accidental deletion of expired locks held by new processes.
