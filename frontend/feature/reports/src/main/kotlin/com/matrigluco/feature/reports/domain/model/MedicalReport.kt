package com.matrigluco.feature.reports.domain.model

enum class ReportStatus {
    QUEUED,
    PROCESSING,
    NEEDS_REVIEW,
    REVIEWED,
    FAILED
}

enum class ReportProcessingStage(val stepNumber: Int, val label: String) {
    UPLOADED(1, "Uploaded"),
    PROCESSING(2, "Processing"),
    EXTRACTED(3, "Extracted"),
    REVIEWED(4, "Reviewed")
}

enum class ReportFileType {
    PDF,
    IMAGE,
    UNKNOWN;

    companion object {
        fun fromFileName(name: String?): ReportFileType {
            if (name == null) return UNKNOWN
            val lower = name.lowercase()
            return when {
                lower.endsWith(".pdf") -> PDF
                lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp") -> IMAGE
                else -> UNKNOWN
            }
        }
    }
}

enum class ReportFilter {
    ALL,
    NEEDS_REVIEW,
    REVIEWED
}

data class ExtractedBiomarker(
    val key: String,
    val name: String,
    val value: String,
    val unit: String,
    val isAbnormal: Boolean = false,
    val sourceSnippet: String? = null
)

data class ReportCounts(
    val all: Int = 0,
    val needsReview: Int = 0,
    val reviewed: Int = 0
)

data class MedicalReport(
    val id: String,
    val fileName: String,
    val fileType: ReportFileType,
    val fileUrl: String?,
    val uploadedAt: String,
    val status: ReportStatus,
    val stage: ReportProcessingStage,
    val extractedBiomarkers: List<ExtractedBiomarker>,
    val riskLevel: String?,
    val predictionResult: String?,
    val isReviewed: Boolean,
    val fileSizeBytes: Long? = null
)
