package com.matrigluco.feature.tracking.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.matrigluco.core.auth.session.SessionRepository
import com.matrigluco.core.auth.session.SessionState
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.feature.tracking.domain.CalculateTrackingSummaryUseCase
import com.matrigluco.feature.tracking.domain.TrackingRepository
import com.matrigluco.feature.tracking.domain.model.HealthReading
import com.matrigluco.feature.tracking.domain.model.MetricDefinition
import com.matrigluco.feature.tracking.domain.model.MetricType
import com.matrigluco.feature.tracking.domain.model.TrackingFilter
import com.matrigluco.feature.tracking.domain.model.TrackingPeriod
import com.matrigluco.feature.tracking.domain.model.TrackingViewMode
import dagger.hilt.android.lifecycle.HiltViewModel
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

@HiltViewModel
class TrackingViewModel @Inject constructor(
    private val repository: TrackingRepository,
    private val calculateSummaryUseCase: CalculateTrackingSummaryUseCase,
    private val sessionRepository: SessionRepository,
) : ViewModel() {

    private val filterState = MutableStateFlow(TrackingFilter())
    private val isRefreshing = MutableStateFlow(false)
    private val errorMessage = MutableStateFlow<String?>(null)

    val state: StateFlow<TrackingUiState> = sessionRepository.sessionState
        .flatMapLatest { session ->
            val ownerId = when (session) {
                is SessionState.Authenticated -> session.user.id
                is SessionState.OfflineRestored -> session.user.id
                else -> ""
            }
            combine(
                repository.observeReadings(ownerId, ""),
                filterState,
                isRefreshing,
                errorMessage
            ) { allReadings, filter, loading, error ->
                buildUiState(allReadings, filter, loading, error)
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = TrackingUiState.Loading
        )

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            isRefreshing.value = true
            errorMessage.value = null
            when (val result = repository.fetchReadings(null)) {
                is ApiResult.Success -> {
                    errorMessage.value = null
                }
                is ApiResult.Failure -> {
                    errorMessage.value = result.error.toMessage()
                }
            }
            isRefreshing.value = false
        }
    }

    fun setMetric(type: MetricType) {
        val def = MetricDefinition.forType(type)
        filterState.value = filterState.value.copy(metric = def)
    }

    fun setPeriod(period: TrackingPeriod) {
        filterState.value = filterState.value.copy(period = period)
    }

    fun setCustomRange(startEpoch: Long, endEpoch: Long) {
        filterState.value = filterState.value.copy(
            period = TrackingPeriod.CUSTOM,
            customDateStartEpochMillis = startEpoch,
            customDateEndEpochMillis = endEpoch
        )
    }

    fun setViewMode(mode: TrackingViewMode) {
        filterState.value = filterState.value.copy(viewMode = mode)
    }

    fun addReading(
        type: MetricType,
        primary: Double,
        secondary: Double?,
        unit: String,
        notes: String?
    ) {
        viewModelScope.launch {
            val isoNow = formatEpochToIso(System.currentTimeMillis())
            val result = repository.createReading(
                metricType = type.rawValue,
                valuePrimary = primary,
                valueSecondary = secondary,
                unit = unit,
                measuredAt = isoNow,
                notes = notes
            )
            if (result is ApiResult.Failure) {
                errorMessage.value = result.error.toMessage()
            } else {
                errorMessage.value = null
            }
        }
    }

    fun deleteReading(reading: HealthReading) {
        viewModelScope.launch {
            repository.deleteReading(reading.id)
            refresh()
        }
    }

    private fun buildUiState(
        allReadings: List<HealthReading>,
        filter: TrackingFilter,
        loading: Boolean,
        error: String?
    ): TrackingUiState {
        val metricReadings = allReadings.filter {
            it.metricType.equals(filter.metric.type.rawValue, ignoreCase = true)
        }

        val latestReading = metricReadings.maxByOrNull { it.measuredAtEpochMillis }

        // Filter by selected period
        val now = System.currentTimeMillis()
        val filteredReadings = metricReadings.filter { r ->
            when (filter.period) {
                TrackingPeriod.SEVEN_DAYS -> (now - r.measuredAtEpochMillis) <= 7L * 24 * 60 * 60 * 1000
                TrackingPeriod.THIRTY_DAYS -> (now - r.measuredAtEpochMillis) <= 30L * 24 * 60 * 60 * 1000
                TrackingPeriod.NINETY_DAYS -> (now - r.measuredAtEpochMillis) <= 90L * 24 * 60 * 60 * 1000
                TrackingPeriod.CUSTOM -> {
                    val s = filter.customDateStartEpochMillis ?: 0L
                    val e = filter.customDateEndEpochMillis ?: Long.MAX_VALUE
                    r.measuredAtEpochMillis in s..e
                }
            }
        }

        // Compute summary math
        val summary = calculateSummaryUseCase(filteredReadings, filter.metric, filter.period)

        // Build Chart Points (Sorted chronologically ascending)
        val sortedAsc = filteredReadings.sortedBy { it.measuredAtEpochMillis }
        val chartPoints = sortedAsc.map { r ->
            ChartPoint(
                epochMillis = r.measuredAtEpochMillis,
                dateLabel = formatChartDate(r.measuredAtEpochMillis),
                value = r.valuePrimary,
                formattedValue = r.formattedValue,
                reading = r
            )
        }

        // Build Signal Spine Timeline Items (Sorted chronologically descending, grouped by date)
        val sortedDesc = filteredReadings.sortedByDescending { it.measuredAtEpochMillis }
        val timelineItems = mutableListOf<TimelineItem>()
        val groupedByDate = sortedDesc.groupBy { formatDateHeaderKey(it.measuredAtEpochMillis) }

        for ((headerText, readingsInGroup) in groupedByDate) {
            val groupEpoch = readingsInGroup.first().measuredAtEpochMillis
            timelineItems.add(TimelineItem.DateHeader(headerText, groupEpoch))
            readingsInGroup.forEachIndexed { index, r ->
                timelineItems.add(
                    TimelineItem.ReadingItem(
                        reading = r,
                        isFirstInGroup = index == 0,
                        isLastInGroup = index == readingsInGroup.lastIndex,
                        stableId = r.id.hashCode().toLong()
                    )
                )
            }
        }

        val uiModel = TrackingUiModel(
            selectedMetric = filter.metric,
            selectedPeriod = filter.period,
            viewMode = filter.viewMode,
            filter = filter,
            latestReading = latestReading,
            summary = summary,
            chartPoints = chartPoints,
            timelineItems = timelineItems,
            recordsList = sortedDesc,
            isOffline = error != null && allReadings.isNotEmpty(),
            lastUpdatedAt = System.currentTimeMillis()
        )

        return when {
            loading && allReadings.isEmpty() -> TrackingUiState.Loading
            error != null && allReadings.isEmpty() -> TrackingUiState.Error(null, error)
            error != null -> TrackingUiState.Offline(uiModel)
            else -> TrackingUiState.Content(uiModel)
        }
    }

    private fun formatDateHeaderKey(epochMillis: Long): String {
        val nowCal = Calendar.getInstance()
        val itemCal = Calendar.getInstance().apply { timeInMillis = epochMillis }

        return when {
            nowCal.get(Calendar.YEAR) == itemCal.get(Calendar.YEAR) &&
                    nowCal.get(Calendar.DAY_OF_YEAR) == itemCal.get(Calendar.DAY_OF_YEAR) -> "TODAY"
            nowCal.get(Calendar.YEAR) == itemCal.get(Calendar.YEAR) &&
                    nowCal.get(Calendar.DAY_OF_YEAR) - itemCal.get(Calendar.DAY_OF_YEAR) == 1 -> "YESTERDAY"
            else -> {
                val sdf = SimpleDateFormat("EEE, MMM dd", Locale.US).apply { timeZone = TimeZone.getDefault() }
                sdf.format(Date(epochMillis)).uppercase(Locale.US)
            }
        }
    }

    private fun formatChartDate(epochMillis: Long): String {
        val sdf = SimpleDateFormat("MMM dd", Locale.US).apply { timeZone = TimeZone.getDefault() }
        return sdf.format(Date(epochMillis))
    }

    private fun formatEpochToIso(epoch: Long): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }
        return sdf.format(epoch)
    }

    private fun com.matrigluco.core.network.error.ApiError.toMessage(): String = when (this) {
        com.matrigluco.core.network.error.ApiError.Offline -> "No internet connection. Showing saved readings."
        com.matrigluco.core.network.error.ApiError.Timeout -> "Connection timed out. Please try again."
        com.matrigluco.core.network.error.ApiError.Unauthorized -> "Session expired. Please log in again."
        com.matrigluco.core.network.error.ApiError.Forbidden -> "Access denied."
        com.matrigluco.core.network.error.ApiError.NotFound -> "Reading not found."
        is com.matrigluco.core.network.error.ApiError.Rejected -> "Request rejected (HTTP $statusCode)."
        is com.matrigluco.core.network.error.ApiError.Validation -> "Invalid measurement data provided."
        is com.matrigluco.core.network.error.ApiError.RateLimited -> "Too many requests. Please wait a moment."
        com.matrigluco.core.network.error.ApiError.ServiceUnavailable -> "Server is temporarily unavailable."
        com.matrigluco.core.network.error.ApiError.Server -> "Server encountered an error. Please try again."
        com.matrigluco.core.network.error.ApiError.Contract -> "Data parsing error."
        com.matrigluco.core.network.error.ApiError.Unknown -> "An unexpected error occurred."
    }
}
