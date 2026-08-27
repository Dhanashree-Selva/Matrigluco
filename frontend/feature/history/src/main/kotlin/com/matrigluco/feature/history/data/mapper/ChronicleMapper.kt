package com.matrigluco.feature.history.data.mapper

import com.matrigluco.core.database.entity.HealthMeasurementEntity
import com.matrigluco.core.database.entity.PredictionSummaryEntity
import com.matrigluco.core.database.entity.ReportSummaryEntity
import com.matrigluco.feature.history.data.remote.dto.HistoryEventDto
import com.matrigluco.feature.history.data.remote.dto.HistoryListResponseDto
import com.matrigluco.feature.history.domain.model.ChronicleDateGroup
import com.matrigluco.feature.history.domain.model.ChronicleEvent
import com.matrigluco.feature.history.domain.model.ChronicleSummary
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonPrimitive
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.roundToInt

object ChronicleMapper {

    private val headerDateFormatter = DateTimeFormatter.ofPattern("EEE, MMM d", Locale.ENGLISH)
    private val fullDateFormatter = DateTimeFormatter.ofPattern("EEE, MMM d, yyyy", Locale.ENGLISH)

    fun mapDtoToEvents(
        response: HistoryListResponseDto,
        zoneId: ZoneId = ZoneId.systemDefault()
    ): List<ChronicleEvent> {
        return response.items.mapNotNull { dto ->
            mapSingleDto(dto)
        }.sortedWith(
            compareByDescending<ChronicleEvent> { it.occurredAt }
                .thenBy { it.id }
        )
    }

    fun mapSingleDto(dto: HistoryEventDto): ChronicleEvent? {
        val instant = parseIsoInstant(dto.occurredAt) ?: return null
        val details = dto.details

        return when (dto.type.lowercase().trim()) {
            "assessment" -> {
                val probScore = details?.get("probability_score")?.jsonPrimitive?.doubleOrNull ?: 0.0
                val riskBand = details?.get("risk_band")?.jsonPrimitive?.contentOrNull
                    ?: details?.get("risk_level")?.jsonPrimitive?.contentOrNull
                    ?: dto.status
                    ?: "LOW_RISK"
                val prediction = details?.get("prediction_result")?.jsonPrimitive?.contentOrNull
                    ?: "Low"
                val modelVer = details?.get("model_version")?.jsonPrimitive?.contentOrNull
                    ?: "v1.0.0"
                val featCount = details?.get("features_count")?.jsonPrimitive?.intOrNull
                    ?: 8

                ChronicleEvent.Assessment(
                    id = dto.id,
                    occurredAt = instant,
                    resourceId = dto.resourceId,
                    title = dto.title.ifBlank { "AI Risk Evaluation" },
                    probabilityPercentage = (probScore * 100.0),
                    riskBand = riskBand,
                    predictionResult = prediction,
                    modelVersion = modelVer,
                    featuresCount = featCount
                )
            }
            "measurement" -> {
                val metricType = details?.get("metric_type")?.jsonPrimitive?.contentOrNull ?: "glucose"
                val valPrimary = details?.get("value_primary")?.jsonPrimitive?.doubleOrNull ?: 0.0
                val valSecondary = details?.get("value_secondary")?.jsonPrimitive?.doubleOrNull
                val unit = details?.get("unit")?.jsonPrimitive?.contentOrNull ?: "mg/dL"
                val notes = details?.get("notes")?.jsonPrimitive?.contentOrNull
                val source = details?.get("source")?.jsonPrimitive?.contentOrNull ?: "Manually logged"

                val formatted = if (metricType == "blood_pressure" && valSecondary != null) {
                    "${valPrimary.roundToInt()} / ${valSecondary.roundToInt()} $unit"
                } else {
                    val valueStr = if (valPrimary % 1.0 == 0.0) valPrimary.toInt().toString() else "%.1f".format(Locale.US, valPrimary)
                    "$valueStr $unit"
                }

                ChronicleEvent.Reading(
                    id = dto.id,
                    occurredAt = instant,
                    resourceId = dto.resourceId,
                    title = dto.title.ifBlank { "${metricType.replace('_', ' ').replaceFirstChar { it.uppercase() }} Reading" },
                    metricType = metricType,
                    valuePrimary = valPrimary,
                    valueSecondary = valSecondary,
                    unit = unit,
                    formattedValue = formatted,
                    notes = notes,
                    source = source
                )
            }
            "report" -> {
                val fileName = details?.get("file_name")?.jsonPrimitive?.contentOrNull ?: dto.title
                val riskLevel = details?.get("risk_level")?.jsonPrimitive?.contentOrNull ?: dto.status
                val prediction = details?.get("prediction_result")?.jsonPrimitive?.contentOrNull
                val hasExtracted = details?.get("has_extracted_data")?.jsonPrimitive?.booleanOrNull ?: false
                val summary = dto.summary ?: "Lab record processed"

                ChronicleEvent.Report(
                    id = dto.id,
                    occurredAt = instant,
                    resourceId = dto.resourceId,
                    title = dto.title.ifBlank { "Medical Report" },
                    fileName = fileName,
                    riskLevel = riskLevel,
                    predictionResult = prediction,
                    hasExtractedData = hasExtracted,
                    summaryText = summary
                )
            }
            "consultation" -> {
                val docName = details?.get("doctor_name")?.jsonPrimitive?.contentOrNull
                    ?: details?.get("provider_name")?.jsonPrimitive?.contentOrNull
                val dept = details?.get("department")?.jsonPrimitive?.contentOrNull
                val apptStatus = dto.status ?: "Completed"
                val isUpcoming = apptStatus.equals("SCHEDULED", ignoreCase = true)

                ChronicleEvent.Consultation(
                    id = dto.id,
                    occurredAt = instant,
                    resourceId = dto.resourceId,
                    title = dto.title.ifBlank { "Doctor Consultation" },
                    doctorName = docName,
                    department = dept,
                    appointmentStatus = apptStatus,
                    isUpcoming = isUpcoming
                )
            }
            else -> null
        }
    }

    fun groupEventsByDate(
        events: List<ChronicleEvent>,
        zoneId: ZoneId = ZoneId.systemDefault(),
        today: LocalDate = LocalDate.now(zoneId)
    ): List<ChronicleDateGroup> {
        val grouped = events.groupBy { event ->
            event.occurredAt.atZone(zoneId).toLocalDate()
        }

        return grouped.entries.sortedByDescending { it.key }.map { (date, dateEvents) ->
            val isToday = date == today
            val isYesterday = date == today.minusDays(1)

            val display = when {
                isToday -> "Today · ${date.format(headerDateFormatter)}"
                isYesterday -> "Yesterday · ${date.format(headerDateFormatter)}"
                date.year == today.year -> date.format(headerDateFormatter)
                else -> date.format(fullDateFormatter)
            }

            ChronicleDateGroup(
                date = date,
                formattedDate = display,
                isToday = isToday,
                eventCount = dateEvents.size,
                events = dateEvents,
                isExpanded = true
            )
        }
    }

    fun buildSummary(
        response: HistoryListResponseDto,
        filteredEvents: List<ChronicleEvent>,
        activeMonth: String?
    ): ChronicleSummary {
        val counts = response.eventCounts
        return ChronicleSummary(
            totalEvents = response.total.takeIf { it > 0 } ?: filteredEvents.size,
            assessmentsCount = counts["assessment"] ?: filteredEvents.count { it is ChronicleEvent.Assessment },
            readingsCount = counts["measurement"] ?: filteredEvents.count { it is ChronicleEvent.Reading },
            reportsCount = counts["report"] ?: filteredEvents.count { it is ChronicleEvent.Report },
            consultationsCount = counts["consultation"] ?: filteredEvents.count { it is ChronicleEvent.Consultation },
            activeMonth = activeMonth,
            availableMonths = response.availableMonths
        )
    }

    fun mapRoomEntitiesToEvents(
        predictions: List<PredictionSummaryEntity>,
        measurements: List<HealthMeasurementEntity>,
        reports: List<ReportSummaryEntity>
    ): List<ChronicleEvent> {
        val events = mutableListOf<ChronicleEvent>()

        predictions.forEach { p ->
            val instant = Instant.ofEpochMilli(p.createdAtEpochMillis)
            val prob = p.probabilityDecimal?.toDoubleOrNull() ?: 0.0
            events.add(
                ChronicleEvent.Assessment(
                    id = "assessment-${p.serverId}",
                    occurredAt = instant,
                    resourceId = p.serverId,
                    title = "AI Risk Evaluation",
                    probabilityPercentage = prob * 100.0,
                    riskBand = p.riskLevel,
                    predictionResult = p.riskLevel,
                    modelVersion = "v1.0.0",
                    featuresCount = 8
                )
            )
        }

        measurements.forEach { m ->
            val instant = Instant.ofEpochMilli(m.measuredAtEpochMillis)
            val numericVal = m.numericValueDecimal?.toDoubleOrNull() ?: 0.0
            val formatted = if (m.metricType == "blood_pressure" && m.systolic != null && m.diastolic != null) {
                "${m.systolic} / ${m.diastolic} ${m.unit}"
            } else {
                val valStr = if (numericVal % 1.0 == 0.0) numericVal.toInt().toString() else "%.1f".format(Locale.US, numericVal)
                "$valStr ${m.unit}"
            }

            events.add(
                ChronicleEvent.Reading(
                    id = "measurement-${m.serverId}",
                    occurredAt = instant,
                    resourceId = m.serverId,
                    title = "${m.metricType.replace('_', ' ').replaceFirstChar { it.uppercase() }} Reading",
                    metricType = m.metricType,
                    valuePrimary = numericVal,
                    valueSecondary = m.diastolic?.toDouble(),
                    unit = m.unit,
                    formattedValue = formatted,
                    notes = null,
                    source = "Cached reading"
                )
            )
        }

        reports.forEach { r ->
            val instant = Instant.ofEpochMilli(r.uploadedAtEpochMillis ?: r.cachedAtEpochMillis)
            val repTitle = r.title ?: "Medical Report"
            events.add(
                ChronicleEvent.Report(
                    id = "report-${r.serverId}",
                    occurredAt = instant,
                    resourceId = r.serverId,
                    title = repTitle,
                    fileName = repTitle,
                    riskLevel = r.riskLevel,
                    predictionResult = r.riskLevel,
                    hasExtractedData = false,
                    summaryText = "Lab record processed"
                )
            )
        }

        return events.sortedWith(
            compareByDescending<ChronicleEvent> { it.occurredAt }
                .thenBy { it.id }
        )
    }

    private fun parseIsoInstant(isoString: String): Instant? {
        return try {
            Instant.parse(isoString)
        } catch (_: Exception) {
            try {
                java.time.OffsetDateTime.parse(isoString).toInstant()
            } catch (_: Exception) {
                null
            }
        }
    }
}
