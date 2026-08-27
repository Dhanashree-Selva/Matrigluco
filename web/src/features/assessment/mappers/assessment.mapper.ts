import { AssessmentFormValues } from "../types/assessment.types";
import { CanonicalPredictionRequest } from "../../../types/prediction";

export function mapAssessmentFormToDto(
  values: AssessmentFormValues
): CanonicalPredictionRequest {
  const parseStrictNumber = (val: string, fieldName: string): number => {
    if (!val || typeof val !== "string" || val.trim() === "") {
      throw new Error(`Field ${fieldName} is required and cannot be empty.`);
    }
    const num = Number(val.trim());
    if (isNaN(num) || !isFinite(num)) {
      throw new Error(`Field ${fieldName} must be a valid finite number.`);
    }
    return num;
  };

  return {
    pregnancies: parseStrictNumber(values.pregnancies, "pregnancies"),
    glucose: parseStrictNumber(values.glucose, "glucose"),
    blood_pressure: parseStrictNumber(values.bloodPressure, "blood_pressure"),
    skin_thickness: parseStrictNumber(values.skinThickness, "skin_thickness"),
    insulin: parseStrictNumber(values.insulin, "insulin"),
    bmi: parseStrictNumber(values.bmi, "bmi"),
    diabetes_pedigree_function: parseStrictNumber(
      values.diabetesPedigreeFunction,
      "diabetes_pedigree_function"
    ),
    age: parseStrictNumber(values.age, "age"),
  };
}

export function mapApiToAssessmentDetail(apiData: any): AssessmentDetail {
  if (!apiData) return {} as AssessmentDetail;

  const rawFeatures =
    apiData.features_snapshot ||
    apiData.featuresSnapshot ||
    apiData.input_snapshot_json ||
    {};

  const prob = Number(
    apiData.probability ??
      apiData.probability_score ??
      apiData.probabilityScore ??
      0
  );
  // Normalize if 0-100% scale was sent
  const probNormalized = prob > 1 ? prob / 100 : prob;

  const rawRiskBand = (
    apiData.risk_band ||
    apiData.riskBand ||
    apiData.risk_level ||
    apiData.riskLevel ||
    "moderate"
  ).toLowerCase();

  const normalizedRiskBand: "low" | "moderate" | "high" =
    rawRiskBand.includes("high")
      ? "high"
      : rawRiskBand.includes("low")
      ? "low"
      : "moderate";

  const modelObj = apiData.model || {};

  return {
    id: apiData.id || "",
    probability: probNormalized,
    probabilityScore: probNormalized,
    riskBand: normalizedRiskBand,
    predictionResult:
      apiData.prediction_result || apiData.predictionResult || "Diabetes Risk",
    source: apiData.source || "manual",
    model: {
      key: modelObj.key || "diabetes-risk",
      version: modelObj.version || apiData.model_version || "1.0.0",
      featureContractVersion:
        modelObj.feature_contract_version ||
        modelObj.featureContractVersion ||
        "1.0",
    },
    featuresSnapshot: rawFeatures,
    containsImputedValues: Boolean(
      apiData.contains_imputed_values ?? apiData.containsImputedValues
    ),
    mappingVersion:
      apiData.mapping_version || apiData.mappingVersion || "1.0",
    createdAt:
      apiData.created_at || apiData.createdAt || new Date().toISOString(),
    disclaimer:
      apiData.disclaimer ||
      "This algorithmic risk assessment is a research and educational prototype. It does not constitute a clinical medical diagnosis or therapeutic recommendation.",
    explainability: apiData.explainability,
  };
}

export function mapApiToHistoryItem(apiData: any) {
  const prob = Number(
    apiData.probability ??
      apiData.probability_score ??
      apiData.probabilityScore ??
      0
  );
  const probNormalized = prob > 1 ? prob / 100 : prob;

  const rawRiskBand = (
    apiData.risk_band ||
    apiData.riskBand ||
    apiData.risk_level ||
    apiData.riskLevel ||
    "moderate"
  ).toLowerCase();

  const normalizedRiskBand: "low" | "moderate" | "high" =
    rawRiskBand.includes("high")
      ? "high"
      : rawRiskBand.includes("low")
      ? "low"
      : "moderate";

  return {
    id: apiData.id || "",
    probability: probNormalized,
    probabilityScore: probNormalized,
    riskBand: normalizedRiskBand,
    predictionResult:
      apiData.prediction_result || apiData.predictionResult || "Diabetes Risk",
    modelVersion:
      apiData.model_version ||
      apiData.modelVersion ||
      apiData.model?.version ||
      "1.0.0",
    containsImputedValues: Boolean(
      apiData.contains_imputed_values ?? apiData.containsImputedValues
    ),
    createdAt:
      apiData.created_at || apiData.createdAt || new Date().toISOString(),
  };
}

