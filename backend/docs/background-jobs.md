# MatriGluco — Celery Workers & Background Jobs Architecture

## 1. Architecture Overview

MatriGluco uses Celery for non-blocking asynchronous processing (OCR, report parsing, notifications, analytics, and cleanup) with strict queue routing and durable background job tracking.

```text
FastAPI Endpoint
       │
       ▼
Application Service
       │
  (Durable MySQL Write + Commit)
       │
       ▼
  Enqueue IDs
       │
       ▼
  Redis /1 Broker
       │
       ▼
  Celery Worker (Solo on Windows / Prefork on Linux)
       │
  (Idempotent Execution + Lock + State Update)
       │
       ▼
  MySQL background_jobs
```

---

## 2. Queue Topology & Routing

| Queue Name | Responsibilities | Routing Key Pattern |
| :--- | :--- | :--- |
| **`reports`** | CPU-intensive OCR extraction, PDF parsing, biomarker mapping. | `app.tasks.report_tasks.*`, `app.tasks.export_tasks.*` |
| **`notifications`** | Email delivery, appointment reminders, system alerts. | `app.tasks.notification_tasks.*` |
| **`analytics`** | Daily aggregation, trend computation, data summaries. | `app.tasks.analytics_tasks.*` |
| **`default`** | Session cleanup, expired token purging, stale job reconciliation. | `app.tasks.cleanup_tasks.*` |

---

## 3. Durable Job State

- **Authoritative Source**: The `background_jobs` table in MySQL stores all user-visible progress, status, and completion timestamps.
- **Result Backend Role**: Redis DB `/2` is strictly short-lived technical state with a 3600s TTL; the frontend never reads Celery `AsyncResult` directly.
- **Status Lifecycle**: `pending_dispatch` $\rightarrow$ `queued` $\rightarrow$ `running` $\rightarrow$ `succeeded` / `failed`.

---

## 4. Local & Production Operating Model

- **Windows (Development)**:
  ```powershell
  celery --app app.workers.celery_app:celery_app worker --loglevel=INFO --pool=solo -Q default,reports,notifications,analytics
  ```
- **Linux (Production)**:
  ```bash
  celery --app app.workers.celery_app:celery_app worker --loglevel=INFO --queues=default,reports,notifications,analytics
  ```
- **Celery Beat (Periodic Scheduler)**:
  ```powershell
  celery --app app.workers.celery_app:celery_app beat --loglevel=INFO
  ```
