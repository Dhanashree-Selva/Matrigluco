# Mobile Data Classification

| Class | Examples | Local rule |
|---|---|---|
| Secret | refresh/access tokens, passwords | Keystore-backed encrypted storage; passwords never persist |
| Restricted health | readings, assessments, reports, pregnancy context, Assistant text | minimize; Room only by explicit feature decision; no logs/backups/screenshots where sensitive |
| Private account | profile, sessions, notification content | user-scoped cache; clear on logout/account switch |
| Operational | request ID, job state, timestamps | safe bounded logging/cache without payloads |
| Public | app copy, model educational notice | normal resources/cache |

Android never accesses MySQL, Redis, Celery or Supabase directly and never receives backend/OCR/AI keys. Disable backup for secret/restricted stores and review manifest backup rules in Phase 1.
