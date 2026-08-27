import {
  RawReportApiItem,
  ReportViewModel,
  ExtractedBiomarkerItem,
  ReportProcessingStatus,
  ReportReviewStatus,
  AttachmentPresentationState,
} from "../types/reports.types";
import { KNOWN_BIOMARKER_DICTIONARY } from "../config/reports.config";
import { parseDate } from "../../../lib/dates";

export function formatBytes(bytes?: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function detectFileType(
  filename?: string,
  mimeType?: string
): "pdf" | "image" | "document" {
  const lowerName = (filename || "").toLowerCase();
  const lowerMime = (mimeType || "").toLowerCase();

  if (lowerName.endsWith(".pdf") || lowerMime.includes("pdf")) return "pdf";
  if (
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".webp") ||
    lowerMime.includes("image")
  ) {
    return "image";
  }
  return "document";
}

export function mapRawBiomarkers(
  extracted?: Record<string, any> | null
): ExtractedBiomarkerItem[] {
  if (!extracted || typeof extracted !== "object") return [];

  const items: ExtractedBiomarkerItem[] = [];

  for (const [rawKey, rawVal] of Object.entries(extracted)) {
    if (rawVal === null || rawVal === undefined || rawVal === "") continue;

    // Ignore internal metadata fields if present in dictionary
    if (rawKey.startsWith("_") || rawKey === "reviewed" || rawKey === "reviewed_at") continue;

    const normalizedKey = rawKey.toLowerCase().replace(/[\s-]+/g, "_");
    const meta = KNOWN_BIOMARKER_DICTIONARY[normalizedKey];

    const label =
      meta?.label ||
      rawKey
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

    const unit = meta?.unit || "";

    items.push({
      key: rawKey,
      label,
      value: rawVal,
      unit,
      isReviewed: Boolean(extracted._reviewed_keys?.[rawKey]),
    });
  }

  return items;
}

export function mapApiToReportViewModel(apiItem: RawReportApiItem): ReportViewModel {
  const uploadedAtIso = apiItem.uploaded_at || apiItem.created_at || new Date().toISOString();
  const d = parseDate(uploadedAtIso) || new Date();

  const formattedDate = d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const originalFilename = apiItem.file_name || "Medical Report";
  const fileType = detectFileType(originalFilename);
  const extractedList = mapRawBiomarkers(apiItem.extracted_values);

  // Determine domain processing status
  let processingStatus: ReportProcessingStatus = "extracted";
  const attachmentState: AttachmentPresentationState = "done";
  let reviewStatus: ReportReviewStatus = "needs_review";

  const rawExtracted = apiItem.extracted_values || {};
  const isMarkedReviewed = Boolean(rawExtracted._is_reviewed);

  if (extractedList.length === 0) {
    // If no values were extracted or empty
    processingStatus = "uploaded";
    reviewStatus = "unreviewed";
  } else if (isMarkedReviewed) {
    processingStatus = "reviewed";
    reviewStatus = "reviewed";
  } else {
    processingStatus = "extracted";
    reviewStatus = "needs_review";
  }

  return {
    id: apiItem.id,
    originalFilename,
    fileType,
    mimeType: fileType === "pdf" ? "application/pdf" : "image/jpeg",
    uploadedAt: uploadedAtIso,
    formattedDate,
    formattedTime,
    processingStatus,
    reviewStatus,
    attachmentState,
    extractedValues: extractedList,
    rawExtractedValues: rawExtracted,
    predictionResult: apiItem.prediction_result,
    riskLevel: apiItem.risk_level,
    fileUrl: apiItem.file_url || apiItem.id,
  };
}
