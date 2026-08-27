package com.matrigluco.feature.history.data

import com.matrigluco.core.database.entity.HealthMeasurementEntity
import com.matrigluco.core.database.entity.PredictionSummaryEntity
import com.matrigluco.core.database.entity.ReportSummaryEntity
import com.matrigluco.feature.history.data.mapper.ChronicleMapper
import com.matrigluco.feature.history.data.remote.dto.HistoryEventDto
import com.matrigluco.feature.history.data.remote.dto.HistoryListResponseDto
import com.matrigluco.feature.history.domain.model.ChronicleEvent
import com.matrigluco.feature.history.domain.model.ChronicleEventType
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

class ChronicleMapperTest {

    @Test
    fun mapDtoToEvents_mapsAssessmentCorrectly() {
        val details = buildJsonObject {
            put("probability_score", 0.07)
            put("risk_band", "LOW_RISK")
            put("prediction_result", "Low")
            put("model_version", "v1.0.0")
            put("features_count", 8)
        }
        val dto = HistoryEventDto(
            id = "assessment-1",
            type = "assessment",
            occurredAt = "2026-08-27T15:13:00Z",
            resourceId = "pred-123",
            title = "AI Risk Evaluation",
            details = details
        )

        val event = ChronicleMapper.mapSingleDto(dto)
        assertNotNull(event)
        assertTrue(event is ChronicleEvent.Assessment)

        val assessment = event as ChronicleEvent.Assessment
        assertEquals("assessment-1", assessment.id)
        assertEquals("pred-123", assessment.resourceId)
        assertEquals(7.0, assessment.probabilityPercentage, 0.01)
        assertEquals("LOW_RISK", assessment.riskBand)
        assertEquals("Low", assessment.predictionResult)
        assertEquals("v1.0.0", assessment.modelVersion)
    }

    @Test
    fun mapDtoToEvents_mapsPairedBloodPressureReading() {
        val details = buildJsonObject {
            put("metric_type", "blood_pressure")
            put("value_primary", 120.0)
            put("value_secondary", 80.0)
            put("unit", "mmHg")
            put("source", "Manually logged")
        }
        val dto = HistoryEventDto(
            id = "measurement-1",
            type = "measurement",
            occurredAt = "2026-08-27T14:57:00Z",
            resourceId = "meas-456",
            title = "Blood Pressure Reading",
            details = details
        )

        val event = ChronicleMapper.mapSingleDto(dto)
        assertNotNull(event)
        assertTrue(event is ChronicleEvent.Reading)

        val reading = event as ChronicleEvent.Reading
        assertEquals("120 / 80 mmHg", reading.formattedValue)
        assertEquals("Manually logged", reading.source)
    }

    @Test
    fun mapDtoToEvents_ordersChronologicallyDescending() {
        val event1 = HistoryEventDto(
            id = "e1",
            type = "measurement",
            occurredAt = "2026-08-26T10:00:00Z",
            resourceId = "1",
            title = "Reading 1"
        )
        val event2 = HistoryEventDto(
            id = "e2",
            type = "assessment",
            occurredAt = "2026-08-27T12:00:00Z",
            resourceId = "2",
            title = "Assessment 2"
        )

        val response = HistoryListResponseDto(items = listOf(event1, event2))
        val events = ChronicleMapper.mapDtoToEvents(response)

        assertEquals(2, events.size)
        assertEquals("e2", events[0].id)
        assertEquals("e1", events[1].id)
    }

    @Test
    fun groupEventsByDate_groupsCorrectlyIntoDateBuckets() {
        val zone = ZoneId.of("UTC")
        val fixedToday = LocalDate.of(2026, 8, 27)

        val eventToday = ChronicleEvent.Reading(
            id = "t1",
            occurredAt = Instant.parse("2026-08-27T15:00:00Z"),
            resourceId = "r1",
            title = "Glucose Reading",
            metricType = "glucose",
            valuePrimary = 92.0,
            valueSecondary = null,
            unit = "mg/dL",
            formattedValue = "92 mg/dL",
            notes = null,
            source = "Manual"
        )

        val eventYesterday = ChronicleEvent.Reading(
            id = "y1",
            occurredAt = Instant.parse("2026-08-26T10:00:00Z"),
            resourceId = "r2",
            title = "Glucose Reading",
            metricType = "glucose",
            valuePrimary = 95.0,
            valueSecondary = null,
            unit = "mg/dL",
            formattedValue = "95 mg/dL",
            notes = null,
            source = "Manual"
        )

        val groups = ChronicleMapper.groupEventsByDate(
            events = listOf(eventToday, eventYesterday),
            zoneId = zone,
            today = fixedToday
        )

        assertEquals(2, groups.size)
        assertTrue(groups[0].isToday)
        assertTrue(groups[0].formattedDate.startsWith("Today"))
        assertEquals(1, groups[0].eventCount)

        assertTrue(groups[1].formattedDate.startsWith("Yesterday"))
        assertEquals(1, groups[1].eventCount)
    }

    @Test
    fun mapRoomEntitiesToEvents_projectsOfflineCache() {
        val prediction = PredictionSummaryEntity(
            ownerUserId = "user-1",
            serverId = "pred-offline-1",
            riskLevel = "LOW",
            probabilityDecimal = "0.08",
            createdAtEpochMillis = Instant.parse("2026-08-27T12:00:00Z").toEpochMilli(),
            cachedAtEpochMillis = Instant.parse("2026-08-27T12:00:00Z").toEpochMilli()
        )
        val measurement = HealthMeasurementEntity(
            ownerUserId = "user-1",
            serverId = "meas-offline-1",
            metricType = "glucose",
            numericValueDecimal = "90.0",
            systolic = null,
            diastolic = null,
            unit = "mg/dL",
            measuredAtEpochMillis = Instant.parse("2026-08-27T13:00:00Z").toEpochMilli(),
            cachedAtEpochMillis = Instant.parse("2026-08-27T13:00:00Z").toEpochMilli()
        )
        val report = ReportSummaryEntity(
            ownerUserId = "user-1",
            serverId = "rep-offline-1",
            title = "ogtt.pdf",
            status = "COMPLETED",
            riskLevel = "LOW",
            uploadedAtEpochMillis = Instant.parse("2026-08-27T14:00:00Z").toEpochMilli(),
            cachedAtEpochMillis = Instant.parse("2026-08-27T14:00:00Z").toEpochMilli()
        )

        val events = ChronicleMapper.mapRoomEntitiesToEvents(
            predictions = listOf(prediction),
            measurements = listOf(measurement),
            reports = listOf(report)
        )

        assertEquals(3, events.size)
        // Ordered newest first
        assertEquals("report-rep-offline-1", events[0].id)
        assertEquals("measurement-meas-offline-1", events[1].id)
        assertEquals("assessment-pred-offline-1", events[2].id)
    }
}
