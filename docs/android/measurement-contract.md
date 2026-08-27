# Measurement Contract

| Metric | API key | Values | Canonical unit | Timestamp | CRUD |
|---|---|---|---|---|---|
| Glucose | `glucose` | `value_primary` | `mg/dL` | `measured_at` UTC ISO-8601 | full |
| Blood pressure | `blood_pressure` | primary=systolic, secondary=diastolic | `mmHg` | same | full |
| Weight | `weight` | primary | `kg` | same | full |
| BMI | `bmi` | primary | `kg/m²` | same | full |
| HbA1c | `hba1c` | primary | `%` | same | full |

Create also accepts compatibility aliases `value`, `systolic`, and `diastolic`; Android must send canonical primary/secondary fields. Blood pressure requires both positive values, systolic ≥ diastolic, and `mmHg`. Create/list/detail/update/delete are authenticated and owner-scoped. List supports metric/date/pregnancy filters and page/page_size. No clinical ranges or diagnoses belong in Android.
