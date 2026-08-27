# WorkManager Decision

Justified: retryable user-authorized report uploads, polling known report/job IDs while work is active, queued measurement sync with idempotency support, periodic stale-cache cleanup, and preparation of local notifications from durable server data. Not justified: access-token refresh timers, live Assistant streaming, consultation video/chat, exact-time appointment alarms, or continuous polling. Workers must use constraints, exponential backoff, unique work, authenticated repositories, safe progress, and cancellation/cleanup on logout.
