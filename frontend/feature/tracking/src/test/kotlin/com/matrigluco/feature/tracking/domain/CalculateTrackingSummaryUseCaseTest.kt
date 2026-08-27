package com.matrigluco.feature.tracking.domain

import com.matrigluco.feature.tracking.domain.model.DeltaDirection
import com.matrigluco.feature.tracking.domain.model.HealthReading
import com.matrigluco.feature.tracking.domain.model.MetricDefinition
import com.matrigluco.feature.tracking.domain.model.MetricType
import com.matrigluco.feature.tracking.domain.model.TrackingPeriod
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class CalculateTrackingSummaryUseCaseTest {

    private val useCase = CalculateTrackingSummaryUseCase()
    private val glucoseDef = MetricDefinition.forType(MetricType.GLUCOSE)

    @Test
    fun returnsNullsForEmptyReadings() {
        val summary = useCase(emptyList(), glucoseDef, TrackingPeriod.THIRTY_DAYS)
        assertNull(summary.average)
        assertNull(summary.lowest)
        assertNull(summary.highest)
        assertNull(summary.delta)
        assertEquals(DeltaDirection.UNCHANGED, summary.deltaDirection)
        assertEquals(0, summary.readingsCount)
    }

    @Test
    fun computesAccurateMathForSingleReading() {
        val reading = HealthReading(
            id = "1",
            metricType = "glucose",
            valuePrimary = 150.0,
            unit = "mg/dL",
            measuredAt = "2026-08-27T07:47:00Z",
            measuredAtEpochMillis = 1787814420000L
        )

        val summary = useCase(listOf(reading), glucoseDef, TrackingPeriod.THIRTY_DAYS)
        assertEquals(150.0, summary.average!!, 0.001)
        assertEquals(150.0, summary.lowest!!, 0.001)
        assertEquals(150.0, summary.highest!!, 0.001)
        assertEquals(0.0, summary.delta!!, 0.001)
        assertEquals(DeltaDirection.UNCHANGED, summary.deltaDirection)
        assertEquals(1, summary.readingsCount)
    }

    @Test
    fun computesAccurateMathAndDeltaForMultipleReadings() {
        val r1 = HealthReading(
            id = "1",
            metricType = "glucose",
            valuePrimary = 90.0,
            unit = "mg/dL",
            measuredAt = "2026-08-17T07:04:00Z",
            measuredAtEpochMillis = 1786950240000L
        )
        val r2 = HealthReading(
            id = "2",
            metricType = "glucose",
            valuePrimary = 104.0,
            unit = "mg/dL",
            measuredAt = "2026-08-18T06:52:00Z",
            measuredAtEpochMillis = 1787035920000L
        )
        val r3 = HealthReading(
            id = "3",
            metricType = "glucose",
            valuePrimary = 150.0,
            unit = "mg/dL",
            measuredAt = "2026-08-27T07:47:00Z",
            measuredAtEpochMillis = 1787814420000L
        )

        val summary = useCase(listOf(r3, r1, r2), glucoseDef, TrackingPeriod.THIRTY_DAYS)

        // Average: (90 + 104 + 150) / 3 = 344 / 3 = 114.666...
        assertEquals(114.666, summary.average!!, 0.01)
        assertEquals(90.0, summary.lowest!!, 0.001)
        assertEquals(150.0, summary.highest!!, 0.001)

        // Delta: latest (150) - earliest (90) = +60 higher
        assertEquals(60.0, summary.delta!!, 0.001)
        assertEquals(DeltaDirection.HIGHER, summary.deltaDirection)
        assertEquals(3, summary.readingsCount)
    }
}
