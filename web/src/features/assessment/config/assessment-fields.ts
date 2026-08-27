export type AssessmentFieldKey =
  | "age"
  | "pregnancies"
  | "glucose"
  | "bloodPressure"
  | "skinThickness"
  | "insulin"
  | "bmi"
  | "diabetesPedigreeFunction";

export type AssessmentStepId =
  | "personal"
  | "signals"
  | "metabolic"
  | "history"
  | "review";

export interface AssessmentFieldDefinition {
  key: AssessmentFieldKey;
  label: string;
  modelField: string;
  unit?: string;
  inputMode: "numeric" | "decimal";
  min: number;
  max: number;
  stepId: AssessmentStepId;
  stepNumber: number;
  placeholder: string;
  rationale: string;
  detailedExplanation: string;
  clinicalNote?: string;
}

export interface AssessmentStepDefinition {
  id: AssessmentStepId;
  stepNumber: number;
  eyebrow: string;
  title: string;
  description: string;
  fields: AssessmentFieldKey[];
}

export const ASSESSMENT_STEPS: AssessmentStepDefinition[] = [
  {
    id: "personal",
    stepNumber: 1,
    eyebrow: "01 / Personal Context",
    title: "Maternal Profile Baseline",
    description: "Start with basic demographic parameters that establish baseline risk calibration.",
    fields: ["age", "pregnancies"],
  },
  {
    id: "signals",
    stepNumber: 2,
    eyebrow: "02 / Clinical Signals",
    title: "Primary Metabolic Signals",
    description: "Enter your most recent fasting or plasma glucose and resting diastolic blood pressure.",
    fields: ["glucose", "bloodPressure"],
  },
  {
    id: "metabolic",
    stepNumber: 3,
    eyebrow: "03 / Body & Metabolic Context",
    title: "Adipose & Insulin Biomarkers",
    description: "Body Mass Index, skinfold thickness, and 2-hour serum insulin indicate insulin sensitivity.",
    fields: ["skinThickness", "insulin", "bmi"],
  },
  {
    id: "history",
    stepNumber: 4,
    eyebrow: "04 / History Context",
    title: "Genetic Pedigree Function",
    description: "A calculated genetic scoring index representing diabetes history across biological relatives.",
    fields: ["diabetesPedigreeFunction"],
  },
  {
    id: "review",
    stepNumber: 5,
    eyebrow: "05 / Review & Confirmation",
    title: "Model Input Ledger",
    description: "Review all 8 canonical features before executing clinical risk estimation.",
    fields: [],
  },
];

export const ASSESSMENT_FIELDS: Record<AssessmentFieldKey, AssessmentFieldDefinition> = {
  age: {
    key: "age",
    label: "Maternal Age",
    modelField: "Age",
    unit: "years",
    inputMode: "numeric",
    min: 15,
    max: 110,
    stepId: "personal",
    stepNumber: 1,
    placeholder: "e.g. 29",
    rationale: "Age influences baseline metabolic rate and insulin resistance during gestation.",
    detailedExplanation:
      "Maternal age is an essential epidemiological factor in gestational diabetes risk profiling. The calibrated model accepts age values between 15 and 110 years.",
    clinicalNote: "Accepted model range: 15–110 years.",
  },
  pregnancies: {
    key: "pregnancies",
    label: "Total Prior / Current Pregnancies",
    modelField: "Pregnancies",
    unit: "count",
    inputMode: "numeric",
    min: 0,
    max: 25,
    stepId: "personal",
    stepNumber: 1,
    placeholder: "e.g. 1",
    rationale: "Parity and gravidity history are correlated with cumulative gestational endocrine load.",
    detailedExplanation:
      "Total number of times pregnant, including prior deliveries and the current pregnancy. Enter 0 if this is your first pregnancy.",
    clinicalNote: "Accepted model range: 0–25.",
  },
  glucose: {
    key: "glucose",
    label: "Fasting / Plasma Glucose",
    modelField: "Glucose",
    unit: "mg/dL",
    inputMode: "decimal",
    min: 40,
    max: 500,
    stepId: "signals",
    stepNumber: 2,
    placeholder: "e.g. 102",
    rationale: "Primary circulating blood glucose concentration following overnight fasting.",
    detailedExplanation:
      "Plasma glucose level measured in milligrams per deciliter (mg/dL). This is one of the strongest predictive features in glycemic risk estimation models.",
    clinicalNote: "Accepted model range: 40–500 mg/dL.",
  },
  bloodPressure: {
    key: "bloodPressure",
    label: "Diastolic Blood Pressure",
    modelField: "BloodPressure",
    unit: "mmHg",
    inputMode: "decimal",
    min: 40,
    max: 250,
    stepId: "signals",
    stepNumber: 2,
    placeholder: "e.g. 72",
    rationale: "The resting diastolic pressure (the bottom number in a 120/80 reading).",
    detailedExplanation:
      "The clinical prediction model specifically uses Diastolic Blood Pressure in millimeters of mercury (mmHg). If your blood pressure reading was 120/80 mmHg, enter the diastolic number: 80.",
    clinicalNote: "Diastolic component only. Accepted model range: 40–250 mmHg.",
  },
  skinThickness: {
    key: "skinThickness",
    label: "Triceps Skinfold Thickness",
    modelField: "SkinThickness",
    unit: "mm",
    inputMode: "decimal",
    min: 5,
    max: 120,
    stepId: "metabolic",
    stepNumber: 3,
    placeholder: "e.g. 23",
    rationale: "Measurement of subcutaneous adipose tissue thickness on the triceps.",
    detailedExplanation:
      "Triceps skinfold thickness measured in millimeters (mm) provides an estimate of subcutaneous body fat distribution.",
    clinicalNote: "Accepted model range: 5–120 mm.",
  },
  insulin: {
    key: "insulin",
    label: "2-Hour Serum Insulin",
    modelField: "Insulin",
    unit: "µU/mL",
    inputMode: "decimal",
    min: 1,
    max: 1000,
    stepId: "metabolic",
    stepNumber: 3,
    placeholder: "e.g. 85",
    rationale: "Serum insulin measured 2 hours following oral glucose tolerance administration.",
    detailedExplanation:
      "Serum insulin concentration measured in micro-units per milliliter (µU/mL) following a standardized 2-hour postprandial or OGTT challenge.",
    clinicalNote: "Accepted model range: 1–1000 µU/mL.",
  },
  bmi: {
    key: "bmi",
    label: "Body Mass Index (BMI)",
    modelField: "BMI",
    unit: "kg/m²",
    inputMode: "decimal",
    min: 10,
    max: 80,
    stepId: "metabolic",
    stepNumber: 3,
    placeholder: "e.g. 24.3",
    rationale: "Body weight relative to square of height (kg/m²), reflecting general adiposity.",
    detailedExplanation:
      "Body Mass Index in kilograms per square meter (kg/m²). It represents relative weight adjusted for maternal height.",
    clinicalNote: "Accepted model range: 10.0–80.0 kg/m².",
  },
  diabetesPedigreeFunction: {
    key: "diabetesPedigreeFunction",
    label: "Diabetes Pedigree Function",
    modelField: "DiabetesPedigreeFunction",
    unit: "score",
    inputMode: "decimal",
    min: 0.05,
    max: 3.0,
    stepId: "history",
    stepNumber: 4,
    placeholder: "e.g. 0.45",
    rationale: "Genetic scoring function accounting for diabetes history among immediate and extended biological relatives.",
    detailedExplanation:
      "A mathematically calibrated score quantifying hereditary genetic risk based on diabetes prevalence in family lineage. Typical scores range from 0.08 to 2.42.",
    clinicalNote: "Accepted model range: 0.05–3.00.",
  },
};

export const ASSESSMENT_FIELDS_LIST: AssessmentFieldDefinition[] =
  Object.values(ASSESSMENT_FIELDS);
