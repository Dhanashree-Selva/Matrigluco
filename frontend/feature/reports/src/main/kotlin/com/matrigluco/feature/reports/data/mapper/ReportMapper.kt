package com.matrigluco.feature.reports.data.mapper

import com.matrigluco.core.database.entity.ReportSummaryEntity
import com.matrigluco.feature.reports.data.remote.dto.ReportDto
import com.matrigluco.feature.reports.domain.model.ExtractedBiomarker
import com.matrigluco.feature.reports.domain.model.MedicalReport
import com.matrigluco.feature.reports.domain.model.ReportFileType
import com.matrigluco.feature.reports.domain.model.ReportProcessingStage
import com.matrigluco.feature.reports.domain.model.ReportStatus
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

object ReportMapper {

    fun toDomain(dto: ReportDto): MedicalReport {
        val safeName = dto.fileName?.ifBlank { null } ?: "Medical_Report_${dto.id.take(6)}.pdf"
        val fileType = ReportFileType.fromFileName(safeName)
        val extractedBiomarkers = extractBiomarkers(dto.extractedValues)
        val isReviewed = dto.extractedValues?.get("_is_reviewed")?.asBoolean() == true ||
                dto.extractedValues?.get("is_reviewed")?.asBoolean() == true ||
                dto.predictionResult != null

        val status = when {
            isReviewed -> ReportStatus.REVIEWED
            extractedBiomarkers.isNotEmpty() -> ReportStatus.NEEDS_REVIEW
            dto.predictionResult != null -> ReportStatus.REVIEWED
            else -> ReportStatus.PROCESSING
        }

        val stage = when {
            isReviewed -> ReportProcessingStage.REVIEWED
            extractedBiomarkers.isNotEmpty() -> ReportProcessingStage.EXTRACTED
            else -> ReportProcessingStage.PROCESSING
        }

        return MedicalReport(
            id = dto.id,
            fileName = safeName,
            fileType = fileType,
            fileUrl = dto.fileUrl,
            uploadedAt = dto.uploadedAt ?: dto.createdAt ?: "",
            status = status,
            stage = stage,
            extractedBiomarkers = extractedBiomarkers,
            riskLevel = dto.riskLevel,
            predictionResult = dto.predictionResult,
            isReviewed = isReviewed
        )
    }

    fun toEntity(domain: MedicalReport, ownerUserId: String): ReportSummaryEntity {
        val epochMillis = parseIsoToEpoch(domain.uploadedAt)
        return ReportSummaryEntity(
            ownerUserId = ownerUserId,
            serverId = domain.id,
            title = domain.fileName,
            status = domain.status.name,
            riskLevel = domain.riskLevel,
            uploadedAtEpochMillis = epochMillis,
            cachedAtEpochMillis = System.currentTimeMillis()
        )
    }

    fun fromEntity(entity: ReportSummaryEntity): MedicalReport {
        val status = try {
            ReportStatus.valueOf(entity.status)
        } catch (_: Exception) {
            ReportStatus.REVIEWED
        }
        val stage = when (status) {
            ReportStatus.REVIEWED -> ReportProcessingStage.REVIEWED
            ReportStatus.NEEDS_REVIEW -> ReportProcessingStage.EXTRACTED
            ReportStatus.PROCESSING -> ReportProcessingStage.PROCESSING
            ReportStatus.QUEUED -> ReportProcessingStage.UPLOADED
            ReportStatus.FAILED -> ReportProcessingStage.PROCESSING
        }
        return MedicalReport(
            id = entity.serverId,
            fileName = entity.title ?: "Medical_Report_${entity.serverId.take(6)}",
            fileType = ReportFileType.fromFileName(entity.title),
            fileUrl = null,
            uploadedAt = formatEpochToIso(entity.uploadedAtEpochMillis ?: System.currentTimeMillis()),
            status = status,
            stage = stage,
            extractedBiomarkers = emptyList(),
            riskLevel = entity.riskLevel,
            predictionResult = null,
            isReviewed = status == ReportStatus.REVIEWED
        )
    }

    private fun extractBiomarkers(values: Map<String, JsonElement>?): List<ExtractedBiomarker> {
        if (values.isNullOrEmpty()) return emptyList()
        val list = mutableListOf<ExtractedBiomarker>()

        var systolic: String? = null
        var diastolic: String? = null

        values.forEach { (key, elem) ->
            if (key.startsWith("_")) return@forEach // skip internal flags

            val rawVal = elem.asString() ?: return@forEach

            when (key.lowercase()) {
                "fasting_glucose", "fasting_blood_sugar", "glucose_fasting", "glucose" -> {
                    list.add(
                        ExtractedBiomarker(
                            key = key,
                            name = "Fasting Glucose",
                            value = rawVal,
                            unit = "mg/dL",
                            isAbnormal = rawVal.toDoubleOrNull()?.let { it >= 95.0 } ?: false
                        )
                    )
                }
                "postprandial_glucose", "postprandial", "pp_glucose", "glucose_pp" -> {
                    list.add(
                        ExtractedBiomarker(
                            key = key,
                            name = "Postprandial Glucose (PP)",
                            value = rawVal,
                            unit = "mg/dL",
                            isAbnormal = rawVal.toDoubleOrNull()?.let { it >= 120.0 } ?: false
                        )
                    )
                }
                "hba1c", "glycated_hemoglobin", "glyco_hemoglobin" -> {
                    list.add(
                        ExtractedBiomarker(
                            key = key,
                            name = "Glycated Hemoglobin (HbA1c)",
                            value = rawVal,
                            unit = "%",
                            isAbnormal = rawVal.toDoubleOrNull()?.let { it >= 5.7 } ?: false
                        )
                    )
                }
                "systolic", "systolic_bp", "blood_pressure_systolic" -> {
                    systolic = rawVal
                }
                "diastolic", "diastolic_bp", "blood_pressure_diastolic" -> {
                    diastolic = rawVal
                }
                "blood_pressure", "bp" -> {
                    list.add(
                        ExtractedBiomarker(
                            key = key,
                            name = "Blood Pressure",
                            value = rawVal,
                            unit = "mmHg"
                        )
                    )
                }
                "bmi", "body_mass_index" -> {
                    list.add(
                        ExtractedBiomarker(
                            key = key,
                            name = "Body Mass Index (BMI)",
                            value = rawVal,
                            unit = "kg/m²"
                        )
                    )
                }
                "gestational_age", "gestational_week", "weeks" -> {
                    list.add(
                        ExtractedBiomarker(
                            key = key,
                            name = "Gestational Age",
                            value = rawVal,
                            unit = "weeks"
                        )
                    )
                }
                else -> {
                    val humanName = key.replace("_", " ").split(" ")
                        .joinToString(" ") { word -> word.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.ROOT) else it.toString() } }
                    list.add(
                        ExtractedBiomarker(
                            key = key,
                            name = humanName,
                            value = rawVal,
                            unit = ""
                        )
                    )
                }
            }
        }

        if (systolic != null && diastolic != null) {
            list.add(
                0,
                ExtractedBiomarker(
                    key = "blood_pressure",
                    name = "Blood Pressure",
                    value = "$systolic / $diastolic",
                    unit = "mmHg"
                )
            )
        } else if (systolic != null) {
            list.add(
                ExtractedBiomarker(
                    key = "systolic_bp",
                    name = "Systolic Blood Pressure",
                    value = systolic!!,
                    unit = "mmHg"
                )
            )
        } else if (diastolic != null) {
            list.add(
                ExtractedBiomarker(
                    key = "diastolic_bp",
                    name = "Diastolic Blood Pressure",
                    value = diastolic!!,
                    unit = "mmHg"
                )
            )
        }

        return list
    }

    private fun JsonElement.asString(): String? {
        if (this is JsonPrimitive) {
            return this.contentOrNull
        }
        return this.toString()
    }

    private fun JsonElement.asBoolean(): Boolean? {
        if (this is JsonPrimitive) {
            return this.booleanOrNull ?: (this.contentOrNull == "true")
        }
        return null
    }

    private fun parseIsoToEpoch(iso: String): Long {
        return try {
            val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            parser.parse(iso)?.time ?: System.currentTimeMillis()
        } catch (_: Exception) {
            System.currentTimeMillis()
        }
    }

    private fun formatEpochToIso(epoch: Long): String {
        return try {
            val formatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            formatter.format(epoch)
        } catch (_: Exception) {
            ""
        }
    }
}
