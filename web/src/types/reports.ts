export type ReportProcessingStatus = "pending" | "processing" | "completed" | "failed";

export interface MedicalReportRecord {
  id: string;
  user_id?: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  processing_status: ReportProcessingStatus;
  extracted_data?: {
    glucose?: number;
    glucose_fasting?: number;
    glucose_pp?: number;
    hba1c?: number;
    bmi?: number;
    blood_pressure?: number;
    age?: number;
    [key: string]: unknown;
  } | null;
  error_message?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ReportUploadResponse {
  job_id: string;
  status: string;
  message?: string;
  extracted_data?: Record<string, unknown>;
  health_data?: Record<string, unknown>;
}

export interface ReportListResponse {
  items: MedicalReportRecord[];
  total: number;
}
