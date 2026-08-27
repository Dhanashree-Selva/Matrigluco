package com.matrigluco.feature.reports.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class ReportDto(
    val id: String,
    @SerialName("user_id") val userId: String? = null,
    @SerialName("file_name") val fileName: String? = null,
    @SerialName("file_url") val fileUrl: String? = null,
    @SerialName("extracted_values") val extractedValues: Map<String, JsonElement>? = null,
    @SerialName("prediction_result") val predictionResult: String? = null,
    @SerialName("risk_level") val riskLevel: String? = null,
    @SerialName("uploaded_at") val uploadedAt: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class FileAssetDto(
    val id: String,
    @SerialName("original_filename") val originalFilename: String? = null,
    @SerialName("mime_type") val mimeType: String? = null,
    @SerialName("size_bytes") val sizeBytes: Long? = null,
    @SerialName("download_url") val downloadUrl: String? = null
)

@Serializable
data class SaveReportRequestDto(
    @SerialName("file_name") val fileName: String? = null,
    @SerialName("file_url") val fileUrl: String? = null,
    @SerialName("extracted_values") val extractedValues: Map<String, JsonElement>? = null,
    @SerialName("prediction_result") val predictionResult: String? = null,
    @SerialName("risk_level") val riskLevel: String? = null
)

@Serializable
data class UpdateReportRequestDto(
    @SerialName("file_name") val fileName: String? = null,
    @SerialName("extracted_values") val extractedValues: Map<String, JsonElement>? = null,
    @SerialName("prediction_result") val predictionResult: String? = null,
    @SerialName("risk_level") val riskLevel: String? = null
)
