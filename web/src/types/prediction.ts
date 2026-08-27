export type RiskLevel = "low" | "moderate" | "high" | "unknown";

export interface CanonicalPredictionRequest {
  pregnancies: number;
  glucose: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  bmi: number;
  diabetes_pedigree_function: number;
  age: number;
}

export interface PredictionRecord {
  id: string;
  user_id?: string;
  pregnancies: number;
  glucose: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  bmi: number;
  diabetes_pedigree_function: number;
  age: number;
  risk_level: RiskLevel;
  risk_score: number;
  probability_score?: number;
  prediction_result?: string;
  model_version?: string;
  clinical_recommendation?: string;
  created_at: string;
}

export interface PredictionListResponse {
  items: PredictionRecord[];
  total: number;
}
