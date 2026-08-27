export type ReportProcessingStatus =
  | "uploaded"
  | "processing"
  | "extracted"
  | "reviewed"
  | "failed";

export type ReportReviewStatus = "unreviewed" | "needs_review" | "reviewed";

export type AttachmentPresentationState =
  | "idle"
  | "uploading"
  | "processing"
  | "error"
  | "done";

export type ReportListFilter =
  | "all"
  | "needs_review"
  | "processing"
  | "reviewed"
  | "failed";

export interface ExtractedBiomarkerItem {
  key: string;
  label: string;
  value: string | number;
  unit: string;
  isReviewed?: boolean;
  sourcePage?: number;
  confidenceScore?: number;
}

export interface ReportProvenanceVM {
  provider: string;
  method: string;
  processedAt: string;
  reviewStatus: string;
  isExternal: boolean;
  version: string;
}

export interface ReportViewModel {
  id: string;
  originalFilename: string;
  fileType: "pdf" | "image" | "document";
  mimeType: string;
  fileSizeBytes?: number;
  formattedSize?: string;
  processingStatus: ReportProcessingStatus;
  reviewStatus: ReportReviewStatus;
  attachmentState: AttachmentPresentationState;
  uploadedAt: string;
  formattedDate: string;
  formattedTime: string;
  extractedValues: ExtractedBiomarkerItem[];
  rawExtractedValues: Record<string, any>;
  predictionResult?: string;
  riskLevel?: string;
  fileUrl?: string; // File asset ID or download reference
  isHighlightAction?: boolean;
  errorMessage?: string;
}

export interface RawReportApiItem {
  id: string;
  user_id?: string;
  file_name?: string;
  file_url?: string;
  extracted_values?: Record<string, any>;
  prediction_result?: string;
  risk_level?: string;
  uploaded_at?: string;
  created_at?: string;
}

export interface UpdateReportExtractionPayload {
  extracted_values: Record<string, any>;
  prediction_result?: string;
  risk_level?: string;
}

export interface UploadFileAssetResponse {
  id: string;
  category: string;
  mime_type: string;
  size_bytes: number;
  original_filename: string;
  created_at: string;
}
