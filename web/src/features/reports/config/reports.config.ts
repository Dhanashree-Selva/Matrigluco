export const REPORTS_CONFIG = {
  acceptedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
  acceptedExtensionsString: ".pdf, .jpg, .jpeg, .png, .webp",
  maxFileSizeBytes: 15 * 1024 * 1024, // 15 MB
  maxFileSizeLabel: "15 MB",
  ocrProviderName: "OCR.Space & Deterministic Biomarker Parser",
  isExternalOcr: true,
  disclosureText:
    "MatriGluco utilizes optical character recognition (OCR) and structured biomedical extraction to convert visible lab report parameters into auditable review fields. Extracted parameters are candidate values and must be verified against your original report before clinical reliance.",
  privacyNote:
    "Reports are stored in private encrypted application storage behind authenticated patient endpoints. Files are never shared publicly or indexed across external search engines.",
};

export interface BiomarkerDefinition {
  label: string;
  unit: string;
  category: "glucose" | "cardio" | "metabolic" | "general";
  defaultPrecision?: number;
}

export const KNOWN_BIOMARKER_DICTIONARY: Record<string, BiomarkerDefinition> = {
  glucose: { label: "Plasma Glucose", unit: "mg/dL", category: "glucose" },
  fasting_glucose: { label: "Fasting Glucose", unit: "mg/dL", category: "glucose" },
  glucose_fasting: { label: "Fasting Glucose", unit: "mg/dL", category: "glucose" },
  postprandial_glucose: { label: "Postprandial Glucose (PP)", unit: "mg/dL", category: "glucose" },
  glucose_pp: { label: "Postprandial Glucose (PP)", unit: "mg/dL", category: "glucose" },
  hba1c: { label: "Glycated Hemoglobin (HbA1c)", unit: "%", category: "glucose", defaultPrecision: 1 },
  blood_pressure: { label: "Blood Pressure", unit: "mmHg", category: "cardio" },
  bp_systolic: { label: "Systolic Blood Pressure", unit: "mmHg", category: "cardio" },
  bp_diastolic: { label: "Diastolic Blood Pressure", unit: "mmHg", category: "cardio" },
  bmi: { label: "Body Mass Index (BMI)", unit: "kg/m²", category: "metabolic", defaultPrecision: 1 },
  insulin: { label: "Serum Insulin", unit: "µU/mL", category: "metabolic" },
  skin_thickness: { label: "Skinfold Thickness", unit: "mm", category: "metabolic" },
  platelets: { label: "Platelet Count", unit: "10³/µL", category: "general" },
  triglycerides: { label: "Triglycerides", unit: "mg/dL", category: "metabolic" },
  cholesterol: { label: "Total Cholesterol", unit: "mg/dL", category: "metabolic" },
  age: { label: "Patient Age", unit: "years", category: "general" },
  gestational_age: { label: "Gestational Age", unit: "weeks", category: "general" },
};
