package com.matrigluco.feature.history.domain.model

import java.time.Instant
import java.time.LocalDate

enum class ChronicleEventType(val serverKey: String?, val displayName: String) {
    ALL(null, "All"),
    ASSESSMENT("assessment", "Assessments"),
    READING("measurement", "Readings"),
    REPORT("report", "Reports"),
    CONSULTATION("consultation", "Consultations")
}

enum class ChronicleViewMode {
    STORY,
    EVENTS
}

sealed interface ChronicleEvent {
    val id: String
    val occurredAt: Instant
    val resourceId: String
    val title: String
    val type: ChronicleEventType

    data class Assessment(
        override val id: String,
        override val occurredAt: Instant,
        override val resourceId: String,
        override val title: String,
        val probabilityPercentage: Double,
        val riskBand: String,
        val predictionResult: String,
        val modelVersion: String,
        val featuresCount: Int
    ) : ChronicleEvent {
        override val type: ChronicleEventType = ChronicleEventType.ASSESSMENT
    }

    data class Reading(
        override val id: String,
        override val occurredAt: Instant,
        override val resourceId: String,
        override val title: String,
        val metricType: String,
        val valuePrimary: Double,
        val valueSecondary: Double?,
        val unit: String,
        val formattedValue: String,
        val notes: String?,
        val source: String
    ) : ChronicleEvent {
        override val type: ChronicleEventType = ChronicleEventType.READING
    }

    data class Report(
        override val id: String,
        override val occurredAt: Instant,
        override val resourceId: String,
        override val title: String,
        val fileName: String,
        val riskLevel: String?,
        val predictionResult: String?,
        val hasExtractedData: Boolean,
        val summaryText: String
    ) : ChronicleEvent {
        override val type: ChronicleEventType = ChronicleEventType.REPORT
    }

    data class Consultation(
        override val id: String,
        override val occurredAt: Instant,
        override val resourceId: String,
        override val title: String,
        val doctorName: String?,
        val department: String?,
        val appointmentStatus: String,
        val isUpcoming: Boolean
    ) : ChronicleEvent {
        override val type: ChronicleEventType = ChronicleEventType.CONSULTATION
    }
}

data class ChronicleSummary(
    val totalEvents: Int = 0,
    val assessmentsCount: Int = 0,
    val readingsCount: Int = 0,
    val reportsCount: Int = 0,
    val consultationsCount: Int = 0,
    val activeMonth: String? = null,
    val availableMonths: List<String> = emptyList()
)

data class ChronicleDateGroup(
    val date: LocalDate,
    val formattedDate: String,
    val isToday: Boolean,
    val eventCount: Int,
    val events: List<ChronicleEvent>,
    val isExpanded: Boolean = true
)
