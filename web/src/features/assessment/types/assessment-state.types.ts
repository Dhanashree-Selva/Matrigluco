import { AssessmentFieldKey, AssessmentStepId } from "../config/assessment-fields";

export type AssessmentFormStatus =
  | "PRISTINE"
  | "EDITING"
  | "INVALID"
  | "REVIEW_READY"
  | "SUBMITTING"
  | "SUCCESS"
  | "BACKEND_UNAVAILABLE"
  | "NETWORK_INTERRUPTED"
  | "VALIDATION_MISMATCH"
  | "MODEL_UNAVAILABLE"
  | "COMPLETED";

export interface FieldValidationError {
  fieldKey: AssessmentFieldKey;
  stepId: AssessmentStepId;
  label: string;
  message: string;
}

export interface SafeObservabilityEvent {
  event_type: "ASSESSMENT_CONTRACT_MISMATCH" | "ASSESSMENT_SERVICE_FAILURE";
  route: string;
  status_code?: number;
  error_code?: string;
  request_id?: string;
  frontend_schema_version: string;
  backend_contract_version?: string;
  impacted_fields?: string[];
  timestamp: string;
}

export interface StateErrorContext {
  statusCode?: number;
  errorCode?: string;
  requestId?: string;
  message?: string;
  impactedFields?: string[];
  backendContractVersion?: string;
}

export interface AssessmentFormStateModel {
  status: AssessmentFormStatus;
  errors: FieldValidationError[];
  firstInvalidField: AssessmentFieldKey | null;
  errorContext: StateErrorContext | null;
}
