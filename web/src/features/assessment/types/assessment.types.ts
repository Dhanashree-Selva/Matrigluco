import { AssessmentFieldKey, AssessmentStepId } from "../config/assessment-fields";

export interface AssessmentFormValues {
  age: string;
  pregnancies: string;
  glucose: string;
  bloodPressure: string;
  skinThickness: string;
  insulin: string;
  bmi: string;
  diabetesPedigreeFunction: string;
}

export type AssessmentStepStatus =
  | "completed"
  | "current"
  | "available"
  | "locked"
  | "error";

export interface StepNavigationState {
  currentStep: AssessmentStepId;
  currentStepIndex: number;
  completedSteps: Set<AssessmentStepId>;
  isReviewing: boolean;
  focusedField: AssessmentFieldKey | null;
}

export interface ModelMetadata {
  key: string;
  version: string;
  name: string;
  algorithm?: string;
  framework?: string;
  featureCount: number;
  canonicalFeatures: string[];
}

export type RiskBand = "low" | "moderate" | "high";

export interface FeatureContribution {
  feature: string;
  label: string;
  value: number;
  direction: "higher" | "lower";
  magnitude: number;
  unit?: string;
}

export interface ExplainabilityPayload {
  method: string;
  version: string;
  contributions: FeatureContribution[];
}

export interface AssessmentDetail {
  id: string;
  probability: number;
  probabilityScore: number;
  riskBand: RiskBand;
  predictionResult: string;
  source: string;
  model: {
    key: string;
    version: string;
    featureContractVersion: string;
  };
  featuresSnapshot: {
    Pregnancies?: number;
    Glucose?: number;
    BloodPressure?: number;
    SkinThickness?: number;
    Insulin?: number;
    BMI?: number;
    DiabetesPedigreeFunction?: number;
    Age?: number;
    pregnancies?: number;
    glucose?: number;
    blood_pressure?: number;
    skin_thickness?: number;
    insulin?: number;
    bmi?: number;
    diabetes_pedigree_function?: number;
    age?: number;
    [key: string]: number | undefined;
  };
  containsImputedValues: boolean;
  mappingVersion: string;
  createdAt: string;
  disclaimer: string;
  explainability?: ExplainabilityPayload;
}

export interface AssessmentHistoryItem {
  id: string;
  probability: number;
  probabilityScore?: number;
  riskBand: RiskBand;
  predictionResult?: string;
  modelVersion: string;
  containsImputedValues?: boolean;
  createdAt: string;
}

export interface AssessmentComparisonResult {
  currentAssessment: AssessmentDetail;
  previousAssessment: AssessmentHistoryItem | null;
  probabilityDelta: number | null; // arithmetic difference in percentage points (e.g. -7.2)
  isSameModelVersion: boolean;
  hasPrevious: boolean;
}

