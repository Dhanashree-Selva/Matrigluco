# MatriGluco — Health Tracking & Telemetry Architecture

## 1. Metric Semantics & Canonical Units

MatriGluco enforces strict metric semantics for maternal metabolic and cardiovascular health telemetry.

| Metric Type | Primary Value (`value_primary`) | Secondary Value (`value_secondary`) | Canonical Unit | Input Range Validation |
| :--- | :--- | :--- | :--- | :--- |
| `glucose` | Fasting / postprandial plasma glucose | `NULL` | `mg/dL` | `> 0.0` |
| `blood_pressure` | Systolic blood pressure | Diastolic blood pressure | `mmHg` | Systolic $>$ Diastolic $> 0.0$ |
| `weight` | Maternal body weight | `NULL` | `kg` | `> 0.0` |
| `bmi` | Body Mass Index | `NULL` | `kg/m²` | `> 0.0` |
| `hba1c` | Glycated hemoglobin percentage | `NULL` | `%` | `> 0.0` |

---

## 2. Blood Pressure Storage Contract

Blood pressure is strictly structured as two numeric columns:
- **`value_primary`**: Systolic pressure in `mmHg`.
- **`value_secondary`**: Diastolic pressure in `mmHg`.
- **`unit`**: `mmHg` (strictly enforced).
- **String Fallback**: String parsing fallbacks (e.g. `"120/80"`) are **strictly forbidden** and rejected at schema validation (`422 Unprocessable Content`).

---

## 3. API Surface

| Method | Route | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/health-measurements` | JWT | Creates a new health measurement for the authenticated user. |
| `GET` | `/api/v1/health-measurements` | JWT | Retrieves paginated health measurements with optional `metric_type`, `date_from`, `date_to`, and `pregnancy_profile_id` filters. |
| `GET` | `/api/v1/health-measurements/{id}` | JWT | Retrieves detail of an owned health record (returns 404 for cross-user requests). |
| `PATCH` | `/api/v1/health-measurements/{id}` | JWT | Updates mutable fields with full revalidation of metric invariants. |
| `DELETE` | `/api/v1/health-measurements/{id}` | JWT | Soft-deletes / archives an owned measurement record. |

---

## 4. Query Optimization & Indexing

The `health_measurements` table utilizes a composite index for optimal multi-column filtering and time-series aggregation:
- **Index Name**: `ix_health_measurements_user_metric_measured`
- **Columns**: `(user_id, metric_type, measured_at)`

This composite index powers:
1. Latest measurement queries (`WHERE user_id = ? AND metric_type = ? ORDER BY measured_at DESC LIMIT 1`).
2. 7-day and 30-day time-series trend queries (`WHERE user_id = ? AND metric_type = ? AND measured_at BETWEEN ? AND ? ORDER BY measured_at ASC`).
3. Date-bounded measurement count aggregates (`COUNT(*)`).
