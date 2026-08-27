package com.matrigluco.feature.reports.data

import com.matrigluco.feature.reports.data.mapper.ReportMapper
import com.matrigluco.feature.reports.data.remote.dto.ReportDto
import com.matrigluco.feature.reports.domain.model.ReportFileType
import com.matrigluco.feature.reports.domain.model.ReportProcessingStage
import com.matrigluco.feature.reports.domain.model.ReportStatus
import kotlinx.serialization.json.JsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ReportMapperTest {

    @Test
    fun `maps report dto with extracted values to domain model correctly`() {
        val extractedMap = mapOf(
            "fasting_glucose" to JsonPrimitive("92"),
            "postprandial_glucose" to JsonPrimitive("134"),
            "hba1c" to JsonPrimitive("5.4"),
            "systolic_bp" to JsonPrimitive("120"),
            "diastolic_bp" to JsonPrimitive("80"),
            "_is_reviewed" to JsonPrimitive(true)
        )
        val dto = ReportDto(
            id = "rep_12345678",
            fileName = "OGTT_Lab_Report.png",
            fileUrl = "https://storage.local/reports/rep_123.png",
            extractedValues = extractedMap,
            predictionResult = "LOW_RISK",
            riskLevel = "Low",
            uploadedAt = "2026-08-18T15:12:00Z"
        )

        val domain = ReportMapper.toDomain(dto)

        assertEquals("rep_12345678", domain.id)
        assertEquals("OGTT_Lab_Report.png", domain.fileName)
        assertEquals(ReportFileType.IMAGE, domain.fileType)
        assertEquals(ReportStatus.REVIEWED, domain.status)
        assertEquals(ReportProcessingStage.REVIEWED, domain.stage)
        assertTrue(domain.isReviewed)

        // Verify blood pressure combined
        val bpBiomarker = domain.extractedBiomarkers.find { it.key == "blood_pressure" }
        assertEquals("Blood Pressure", bpBiomarker?.name)
        assertEquals("120 / 80", bpBiomarker?.value)
        assertEquals("mmHg", bpBiomarker?.unit)

        // Verify fasting glucose
        val glucose = domain.extractedBiomarkers.find { it.name == "Fasting Glucose" }
        assertEquals("92", glucose?.value)
        assertEquals("mg/dL", glucose?.unit)
        assertFalse(glucose?.isAbnormal ?: true)
    }

    @Test
    fun `unreviewed report with extracted values maps to NEEDS_REVIEW status`() {
        val extractedMap = mapOf(
            "fasting_glucose" to JsonPrimitive("105")
        )
        val dto = ReportDto(
            id = "rep_pending_review",
            fileName = "Lab_Result.pdf",
            extractedValues = extractedMap,
            uploadedAt = "2026-08-18T14:30:00Z"
        )

        val domain = ReportMapper.toDomain(dto)

        assertEquals(ReportFileType.PDF, domain.fileType)
        assertEquals(ReportStatus.NEEDS_REVIEW, domain.status)
        assertEquals(ReportProcessingStage.EXTRACTED, domain.stage)
        assertFalse(domain.isReviewed)

        // 105 >= 95 -> abnormal
        val glucose = domain.extractedBiomarkers.first()
        assertTrue(glucose.isAbnormal)
    }
}
