package com.matrigluco.feature.tracking.domain

import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.feature.tracking.domain.model.DeltaDirection
import com.matrigluco.feature.tracking.domain.model.HealthReading
import com.matrigluco.feature.tracking.domain.model.MetricDefinition
import com.matrigluco.feature.tracking.domain.model.TrackingPeriod
import com.matrigluco.feature.tracking.domain.model.TrackingSummary
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.abs

interface TrackingRepository {
    fun observeReadings(ownerUserId: String, metricType: String): Flow<List<HealthReading>>
    suspend fun fetchReadings(metricType: String? = null): ApiResult<List<HealthReading>>
    suspend fun createReading(
        metricType: String,
        valuePrimary: Double,
        valueSecondary: Double?,
        unit: String,
        measuredAt: String? = null,
        notes: String? = null
    ): ApiResult<HealthReading>
    suspend fun deleteReading(id: String): ApiResult<Unit>
}

@Singleton
class CalculateTrackingSummaryUseCase @Inject constructor() {
    operator fun invoke(
        readings: List<HealthReading>,
        metric: MetricDefinition,
        period: TrackingPeriod
    ): TrackingSummary {
        if (readings.isEmpty()) {
            return TrackingSummary(
                average = null,
                lowest = null,
                highest = null,
                delta = null,
                deltaDirection = DeltaDirection.UNCHANGED,
                readingsCount = 0,
                metric = metric,
                period = period,
            )
        }

        val primaryValues = readings.map { it.valuePrimary }
        val avg = primaryValues.average()
        val low = primaryValues.minOrNull()
        val high = primaryValues.maxOrNull()

        // Delta is defined as: latest reading value - earliest reading value in the filtered dataset
        // Sort chronologically ascending to find earliest and latest
        val chronological = readings.sortedBy { it.measuredAtEpochMillis }
        val earliest = chronological.first().valuePrimary
        val latest = chronological.last().valuePrimary
        val diff = latest - earliest
        val deltaDirection = when {
            diff > 0.001 -> DeltaDirection.HIGHER
            diff < -0.001 -> DeltaDirection.LOWER
            else -> DeltaDirection.UNCHANGED
        }

        return TrackingSummary(
            average = avg,
            lowest = low,
            highest = high,
            delta = abs(diff),
            deltaDirection = deltaDirection,
            readingsCount = readings.size,
            metric = metric,
            period = period,
        )
    }
}
