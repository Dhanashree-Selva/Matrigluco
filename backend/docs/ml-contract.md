# MatriGluco — Clinical ML Inference & Feature Contract Specification

## 1. Overview and Architecture

The MatriGluco diabetes prediction pipeline evaluates maternal risk using a calibrated scikit-learn tabular model (`diabetes-risk:1.0.0`). 

To prevent historical bugs where pregnancy-oriented UI fields were loosely or incorrectly mapped into the classic eight-feature diabetes shape, this specification defines the **authoritative, non-negotiable inference, model governance, and data provenance contract**.

```text
Domain Input (PredictionCreateRequest)
            │
            ▼
FeatureMapper (Explicit Deterministic Translation)
            │
            ├── Gestational Diabetes History NEVER mapped to Pregnancies
            ├── HbA1c isolated from 8-Feature Contract
            └── Unit Conversion & Provenance Tracking
            │
            ▼
FeatureValidator (Completeness, Type, & Physiological Range Checks)
            │
            ▼
PreparedInferenceInput (Canonical 8-Feature Contract + Lineage)
            │
            ▼
Immutable Normalized Pre-Preprocessor Snapshot (input_snapshot_json)
            │
            ▼
Versioned Preprocessor (preprocessor.joblib / StandardScaler)
            │
            ▼
Versioned Model (model.joblib / LogisticRegression)
            │
            ▼
predict_proba (Extract Positive Class Probability)
            │
            ▼
RiskClassifier (Versioned Threshold Classification)
            │
            ▼
Atomic Persistence (RiskAssessment + input_snapshot_json + 8 Feature Rows + Audit Log)
```

---

## 2. Canonical Eight-Feature Contract

The model requires exactly **eight features** in the exact order below. No feature may be omitted, guessed, or silently defaulted to zero.

| # | Canonical Feature (`snake_case`) | Model Column (`PascalCase`) | Clinical Meaning | Canonical Unit | Accepted Physiological Range |
|---|---|---|---|---|---|
| 0 | `pregnancies` | `Pregnancies` | Number of previous / completed pregnancies | count | `0` to `25` |
| 1 | `glucose` | `Glucose` | Fasting / 2-hour plasma glucose | mg/dL | `40.0` to `500.0` |
| 2 | `blood_pressure` | `BloodPressure` | Diastolic blood pressure | mmHg | `40.0` to `250.0` |
| 3 | `skin_thickness` | `SkinThickness` | Triceps skinfold thickness | mm | `5.0` to `120.0` |
| 4 | `insulin` | `Insulin` | 2-Hour serum insulin | µU/mL | `1.0` to `1000.0` |
| 5 | `bmi` | `BMI` | Body Mass Index ($\text{weight}_{\text{kg}} / \text{height}_{\text{m}}^2$) | kg/m² | `10.0` to `80.0` |
| 6 | `diabetes_pedigree_function` | `DiabetesPedigreeFunction` | Genetic pedigree function score | score | `0.05` to `3.0` |
| 7 | `age` | `Age` | Maternal patient age in completed years | years | `15.0` to `110.0` |

---

## 3. Domain-to-Model Mapping Contract

| Domain Input | Canonical Feature | Mapping / Derivation Rule | Required |
|---|---|---|---|
| `pregnancies`, `previous_pregnancies`, `pregnancy_count` | `pregnancies` | Direct integer count of completed/prior pregnancies. | Yes |
| `glucose`, `fasting_glucose`, `blood_sugar` | `glucose` | Direct float measurement in mg/dL. | Yes |
| `blood_pressure`, `bp`, `diastolic_bp` | `blood_pressure` | Diastolic blood pressure measurement in mmHg. | Yes |
| `skin_thickness`, `skinthickness`, `triceps_skinfold` | `skin_thickness` | Direct triceps skinfold thickness in mm. | Yes |
| `insulin`, `serum_insulin` | `insulin` | 2-hour serum insulin in µU/mL. | Yes |
| `bmi`, `body_mass_index` | `bmi` | Direct BMI if provided, OR deterministically derived from $\text{weight}_{\text{kg}} / (\text{height}_{\text{m}})^2$. | Yes |
| `diabetes_pedigree_function`, `diabetes_pedigree`, `dpf` | `diabetes_pedigree_function` | Validated genetic pedigree score. **Never derived from a boolean family history flag**. | Yes |
| `age`, `maternal_age` | `age` | Maternal patient age in completed years. | Yes |

---

## 4. Non-Negotiable Model Governance Rules

1. **Gestational Diabetes History is NOT Pregnancy Count**:
   - `gestational_diabetes_history` and `pregnancies` are distinct domain entities.
   - `pregnancies = 1 if has_gdm else 0` is **strictly forbidden**.
2. **Unsupported Health Variables**:
   - Health values not present in the 8-feature contract (e.g. `HbA1c`, meal context, gestational week) are stored in general health tables but **never injected into model inference**.
   - The API and UI must **never claim HbA1c influenced the probability** produced by model `1.0.0`.
3. **No Hidden Defaults or Zero Filling**:
   - Missing required features trigger `422 Unprocessable Content` (`ML_FEATURES_INCOMPLETE`).
   - Hardcoded constants (e.g. `skin_thickness = 20`, `insulin = 80`) are forbidden.
4. **Missing Data & Imputation Policy**:
   - For `diabetes-risk:1.0.0`, `imputation_enabled = false` because `StandardScaler` cannot impute missing values.
   - Imputation may only occur if an explicit, versioned imputation policy is registered. Every imputed value must be persisted with `is_imputed = true`.
5. **Exact Pre-Preprocessor Input Snapshot**:
   - Every completed `RiskAssessment` records `input_snapshot_json` containing the exact 8 canonical float values before feature scaling, ensuring permanent mathematical reproducibility.

---

## 5. Model Versioning, Artifact Integrity & Checksums

Active production model version `1.0.0`:
- **Directory**: `app/ml/artifacts/diabetes-risk/1.0.0/`
- **Model Class**: `sklearn.linear_model.LogisticRegression`
- **Model Checksum**: `2afeec25473009af6ed529bee9466fffa3abe0b24d70f0e311c474ed21f1aafe`
- **Preprocessor Class**: `sklearn.preprocessing.StandardScaler`
- **Preprocessor Checksum**: `68b3082714f0220e1c58a00a3d41b7ef68bb291711263533107871f2f3aef1c2`
- **Feature Schema Checksum**: `84dbef92a5671f501b18a060688cd9d2e7c89cae8496ee1aa1f156b63459bcfa`
- **Holdout Evaluation Metrics**: Accuracy: `75.32%`, Precision: `64.91%`, Recall: `67.27%`, F1: `66.07%`, ROC AUC: `0.8147`.

---

## 6. Risk Classification Policy

Threshold boundaries are versioned in `metadata.json`:
- **Low Risk (`low`)**: $\text{probability} \le 0.33$
- **Moderate Risk (`moderate`)**: $0.33 < \text{probability} \le 0.66$
- **High Risk (`high`)**: $\text{probability} > 0.66$
- **Clinical Prediction Result**: `Diabetic` if $\text{probability} \ge 0.50$, otherwise `Non-Diabetic`.

---

## 7. Educational & Clinical Positioning

- **Intended Use**: Academic and educational prototype risk estimation.
- **Regulatory Status**: Not approved as a medical device or diagnostic instrument.
- **UI & API Terminology**: Results are framed as "Estimated Risk Level" and "Model Probability", with explicit disclaimers that clinical diagnosis requires medical practitioner evaluation and laboratory OGTT testing.
