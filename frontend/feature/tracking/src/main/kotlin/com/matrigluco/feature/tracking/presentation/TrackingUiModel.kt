package com.matrigluco.feature.tracking.presentation

import com.matrigluco.feature.tracking.domain.model.HealthReading
import com.matrigluco.feature.tracking.domain.model.MetricDefinition
import com.matrigluco.feature.tracking.domain.model.TrackingFilter
import com.matrigluco.feature.tracking.domain.model.TrackingPeriod
import com.matrigluco.feature.tracking.domain.model.TrackingSummary
import com.matrigluco.feature.tracking.domain.model.TrackingViewMode

sealed interface TimelineItem {
    val stableId: Long
    data class DateHeader(val title: String, override val stableId: Long) : TimelineItem
    data class ReadingItem(
        val reading: HealthReading,
        val isFirstInGroup: Boolean = false,
        val isLastInGroup: Boolean = false,
        override val stableId: Long = reading.id.hashCode().toLong()
    ) : TimelineItem
}

data class ChartPoint(
    val epochMillis: Long,
    val dateLabel: String,
    val value: Double,
    val formattedValue: String,
    val reading: HealthReading,
)

data class TrackingUiModel(
    val selectedMetric: MetricDefinition,
    val selectedPeriod: TrackingPeriod,
    val viewMode: TrackingViewMode,
    val filter: TrackingFilter,
    val latestReading: HealthReading?,
    val summary: TrackingSummary,
    val chartPoints: List<ChartPoint>,
    val timelineItems: List<TimelineItem>,
    val recordsList: List<HealthReading>,
    val isOffline: Boolean = false,
    val lastUpdatedAt: Long? = null,
)

sealed interface TrackingUiState {
    data object Loading : TrackingUiState
    data class Content(val model: TrackingUiModel) : TrackingUiState
    data class Offline(val model: TrackingUiModel) : TrackingUiState
    data class Error(val model: TrackingUiModel?, val message: String) : TrackingUiState
}
