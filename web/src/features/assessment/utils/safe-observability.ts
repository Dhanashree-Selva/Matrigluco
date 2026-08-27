import { SafeObservabilityEvent } from "../types/assessment-state.types";

const SENSITIVE_HEALTH_KEYS = new Set([
  "glucose",
  "bloodPressure",
  "blood_pressure",
  "bmi",
  "age",
  "pregnancies",
  "insulin",
  "skinThickness",
  "skin_thickness",
  "diabetesPedigreeFunction",
  "diabetes_pedigree_function",
  "features",
  "payload",
  "token",
  "password",
  "jwt",
  "authorization",
]);

/**
 * Safely logs contract mismatch or service telemetry without leaking
 * any patient health measurements, tokens, or private medical data.
 */
export function recordSafeObservabilityEvent(event: Omit<SafeObservabilityEvent, "timestamp">): void {
  const safeEvent: SafeObservabilityEvent = {
    ...event,
    impacted_fields: event.impacted_fields?.filter((k) => typeof k === "string"),
    timestamp: new Date().toISOString(),
  };

  // Ensure no values are passed as keys
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn("[Safe Observability Telemetry]", {
      event_type: safeEvent.event_type,
      route: safeEvent.route,
      status_code: safeEvent.status_code,
      error_code: safeEvent.error_code,
      request_id: safeEvent.request_id,
      frontend_schema_version: safeEvent.frontend_schema_version,
      backend_contract_version: safeEvent.backend_contract_version,
      impacted_fields: safeEvent.impacted_fields,
      timestamp: safeEvent.timestamp,
    });
  }
}

/**
 * Sanitizes an error object to extract purely non-medical contract metadata.
 */
export function extractSafeContractContext(error: unknown): {
  statusCode?: number;
  errorCode?: string;
  requestId?: string;
  isContractMismatch: boolean;
  isModelUnavailable: boolean;
  isNetworkInterrupted: boolean;
  backendContractVersion?: string;
  impactedFields?: string[];
} {
  if (!error || typeof error !== "object") {
    return {
      isContractMismatch: false,
      isModelUnavailable: false,
      isNetworkInterrupted: !navigator.onLine,
    };
  }

  const errObj = error as Record<string, any>;
  const statusCode = errObj.status || errObj.statusCode || errObj.response?.status;
  const errorCode = errObj.code || errObj.errorCode || errObj.response?.data?.error?.code;
  const requestId = errObj.requestId || errObj.response?.data?.error?.request_id;
  const message = String(errObj.message || "");

  const isModelUnavailable =
    statusCode === 503 ||
    errorCode === "MODEL_UNAVAILABLE" ||
    errorCode === "ML_SERVICE_DOWN" ||
    message.toLowerCase().includes("model unavailable") ||
    message.toLowerCase().includes("service unavailable");

  const isContractMismatch =
    statusCode === 422 &&
    (errorCode === "SCHEMA_MISMATCH" ||
      errorCode === "CONTRACT_MISMATCH" ||
      errorCode === "ML_FEATURE_INCOMPLETE" ||
      errorCode === "UNPROCESSABLE_ENTITY" ||
      message.toLowerCase().includes("schema") ||
      message.toLowerCase().includes("contract"));

  const isNetworkInterrupted =
    !navigator.onLine ||
    errorCode === "ERR_NETWORK" ||
    errorCode === "ECONNABORTED" ||
    message.toLowerCase().includes("network") ||
    message.toLowerCase().includes("failed to fetch");

  const backendContractVersion =
    errObj.response?.data?.model?.featureContractVersion ||
    errObj.response?.data?.contract_version;

  let impactedFields: string[] | undefined = undefined;
  if (Array.isArray(errObj.response?.data?.error?.details)) {
    impactedFields = errObj.response.data.error.details
      .map((d: any) => (Array.isArray(d?.loc) ? String(d.loc[d.loc.length - 1]) : ""))
      .filter((k: string) => k && !SENSITIVE_HEALTH_KEYS.has(k.toLowerCase()));
  }

  return {
    statusCode,
    errorCode,
    requestId,
    isContractMismatch,
    isModelUnavailable,
    isNetworkInterrupted,
    backendContractVersion,
    impactedFields,
  };
}
