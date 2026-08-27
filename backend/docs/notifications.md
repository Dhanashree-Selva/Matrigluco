# MatriGluco — Notifications, Consultation Reminders & Daily Summaries

## 1. Notification Architecture

MatriGluco implements a durable in-app notification inbox backed by MySQL, with asynchronous email delivery orchestrated via Celery and scheduled periodic scanning handled by Celery Beat.

```text
Domain Event / Scheduler
          │
          ▼
  NotificationService
          │
          ├── evaluate preferences
          ├── check dedupe key
          ├── persist notification (MySQL)
          └── dispatch email task (Celery /1) ──> EmailAdapter
```

---

## 2. Notification Types & Triggering

| Notification Type | Trigger Event | Optional? | Dedupe Key Pattern |
| :--- | :--- | :---: | :--- |
| **`consultation_reminder`** | Upcoming appointment window (24h / 1h) | **Yes** | `consultation-reminder:<consultation_id>:<offset_min>` |
| **`risk_update`** | Metabolic risk assessment persisted | **Yes** | `risk-assessment:<assessment_id>:created` |
| **`daily_summary`** | End-of-day health aggregation computed | **Yes** | `daily-summary:<user_id>:<local_date>:1.0.0` |
| **`system`** | Security alerts and account recovery | **No** (Mandatory) | Unique per system event |

---

## 3. Notification Preferences

Users configure their notification delivery preferences via `GET / PATCH /api/v1/notifications/preferences`:
- `consultation_reminders_enabled` (Default: `true`)
- `risk_notifications_enabled` (Default: `true`)
- `daily_summary_notifications_enabled` (Default: `true`)
- `email_notifications_enabled` (Default: `true`)

Preferences are evaluated at creation time and re-evaluated by background tasks immediately prior to external email dispatch.

---

## 4. Timezone-Aware Daily Health Summaries

Daily summaries group health measurements strictly according to the patient's local calendar day (`00:00` to `23:59:59` in their local IANA timezone) converted to precise UTC query bounds.
- Daylight Saving Time (DST) transitions are handled cleanly via standard library `zoneinfo.ZoneInfo`.
- Aggregation computes measurement counts, latest values, and separate systolic/diastolic averages.
- Database uniqueness on `(user_id, summary_date, summary_version)` ensures idempotent updates upon regeneration.
