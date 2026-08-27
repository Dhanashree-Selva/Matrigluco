# MatriGluco — Dashboard Aggregation & Cache Architecture

## 1. Overview

The MatriGluco Maternal Dashboard aggregates clinical biomarkers, historical risk assessments, time-series telemetry, and upcoming consultations into a consolidated, typed summary.

```text
HTTP GET /api/v1/dashboard/summary
                 │
                 ▼
          DashboardService
                 │
          ├── Cache Check (user_dashboard_key)
          │      │
          │      └── Miss / Disabled / Failed
          │
          ├── HealthRepository (Latest, Trends, Counts)
          ├── RiskRepository (Most recent persisted prediction)
          └── ConsultationRepository (Earliest future appointment)
                 │
                 ▼
        Transient Cache Update (120s TTL)
                 │
                 ▼
          JSON Response DTO
```

---

## 2. Aggregated Domains

1. **Latest Measurements**: Structured dictionary of most recent biomarkers (`glucose`, `blood_pressure` with systolic/diastolic, `weight`, `bmi`, `hba1c`).
2. **Recent Prediction**: Stored risk level, probability score, and clinical result from the latest `RiskAssessment` row.
3. **Trends**: Chronological measurement series for rolling 7-day and 30-day windows.
4. **Measurement Counts**: SQL `COUNT(*)` aggregates across 7-day and 30-day periods.
5. **Upcoming Consultation**: Earliest scheduled consultation in the future (`scheduled_at >= UTC now`).

---

## 3. Cache Boundary & Invalidation

- **Source of Truth**: MySQL database is the sole authoritative state.
- **Fail-Open Design**: Caching is an optional transient optimization. Cache failure or disabled mode defaults to direct MySQL execution without error.
- **User-Scoped Keys**: All keys enforce user scoping (e.g. `matrigluco:v1:dashboard:user:{user_id}`).
- **Post-Commit Invalidation**: Writes in `HealthService`, `PredictionService`, and `ConsultationService` invalidate the user's dashboard cache key strictly **after** database transaction commit.
