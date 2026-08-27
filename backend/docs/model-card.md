# Model Card: MatriGluco Diabetes Risk Estimation (`diabetes-risk:1.0.0`)

## 1. Model Details
- **Model Key**: `diabetes-risk`
- **Model Version**: `1.0.0`
- **Framework**: `scikit-learn 1.6.1`
- **Model Class**: `sklearn.linear_model.LogisticRegression`
- **Preprocessor Class**: `sklearn.preprocessing.StandardScaler`
- **Feature Contract Version**: `1.0`
- **Positive Class**: `1` (Diabetic / Elevated Risk)
- **Model Artifact SHA-256**: `2afeec25473009af6ed529bee9466fffa3abe0b24d70f0e311c474ed21f1aafe`
- **Preprocessor SHA-256**: `68b3082714f0220e1c58a00a3d41b7ef68bb291711263533107871f2f3aef1c2`
- **Feature Schema SHA-256**: `84dbef92a5671f501b18a060688cd9d2e7c89cae8496ee1aa1f156b63459bcfa`

---

## 2. Intended Use & Clinical Positioning
- **Primary Purpose**: Educational and research risk-estimation prototype for academic demonstration in healthcare informatics.
- **Out-of-Scope Use**: 
  - **NOT** a medical diagnostic device or software (SaMD).
  - Must **NOT** be used to confirm or rule out Gestational Diabetes Mellitus (GDM) or Type 2 Diabetes.
  - Must **NOT** be used to prescribe medication, insulin dosages, or alter patient care pathways.
- **Clinical Validation Status**: Not clinically validated or calibrated for live clinical deployment.

---

## 3. Training & Evaluation Data
- **Dataset**: Pima Indians Diabetes Dataset (`diabetes.csv`).
- **Total Records**: 768 patient samples.
- **Split Strategy**: 80% Training (614 samples), 20% Holdout Test (154 samples), `random_state=42`.
- **Target Variable**: `Outcome` (0 = Non-Diabetic, 1 = Diabetic).

---

## 4. Quantitative Evaluation Metrics
Evaluated on holdout test partition (154 samples):

| Metric | Holdout Score |
|---|---|
| **Accuracy** | `75.32%` (0.7532) |
| **Precision** | `64.91%` (0.6491) |
| **Recall (Sensitivity)** | `67.27%` (0.6727) |
| **F1 Score** | `66.07%` (0.6607) |
| **ROC AUC** | `0.8147` |

---

## 5. Canonical Eight-Feature Contract

The model requires exactly eight ordered features. No other variables influence this model.

| # | Feature Name | PascalCase Column | Clinical Meaning | Unit | Accepted Physiological Bounds |
|---|---|---|---|---|---|
| 0 | `pregnancies` | `Pregnancies` | Prior completed pregnancies | count | `0` to `25` |
| 1 | `glucose` | `Glucose` | Plasma / Fasting glucose | mg/dL | `40.0` to `500.0` |
| 2 | `blood_pressure` | `BloodPressure` | Diastolic blood pressure | mmHg | `40.0` to `250.0` |
| 3 | `skin_thickness` | `SkinThickness` | Triceps skinfold thickness | mm | `5.0` to `120.0` |
| 4 | `insulin` | `Insulin` | 2-Hour serum insulin | µU/mL | `1.0` to `1000.0` |
| 5 | `bmi` | `BMI` | Body Mass Index | kg/m² | `10.0` to `80.0` |
| 6 | `diabetes_pedigree_function` | `DiabetesPedigreeFunction` | Genetic pedigree function | score | `0.05` to `3.0` |
| 7 | `age` | `Age` | Patient age | years | `15.0` to `110.0` |

---

## 6. Model Governance & Data Policies

1. **Gestational Diabetes History**: `gestational_diabetes_history` is a distinct clinical flag and is **never** mapped to `pregnancies`.
2. **Unsupported Health Variables**: Measurements such as `HbA1c`, meal context, and gestational week are preserved in domain records but do **not** enter the 8-feature inference pipeline.
3. **Missing Data Policy**: `imputation_enabled = false`. Missing required features cause immediate `422 Unprocessable Content` rejection (`ML_FEATURES_INCOMPLETE`). No default constants (e.g. `0.0`, `20.0`, `dataset_mean`) are injected.
4. **Historical Reproducibility**: Each completed prediction persists an immutable `input_snapshot_json` dictionary and 8 feature rows, guaranteeing 100% reproducible probability reconstruction.

---

## 7. Known Limitations
- **Demographic Bias**: The underlying training dataset represents a specific demographic group (Pima heritage) and is not calibrated across broader maternal demographics.
- **Diagnostic Inadequacy**: GDM screening in clinical practice relies on Oral Glucose Tolerance Tests (OGTT), not single point-in-time risk classifiers.
