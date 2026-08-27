package com.matrigluco.feature.history.data.repository

import com.matrigluco.core.auth.session.SessionRepository
import com.matrigluco.core.auth.session.SessionState
import com.matrigluco.core.database.dao.HealthMeasurementDao
import com.matrigluco.core.database.dao.PredictionSummaryDao
import com.matrigluco.core.database.dao.ReportSummaryDao
import com.matrigluco.feature.history.data.mapper.ChronicleMapper
import com.matrigluco.feature.history.data.remote.HistoryApi
import com.matrigluco.feature.history.data.remote.dto.HistoryListResponseDto
import com.matrigluco.feature.history.domain.model.ChronicleEventType
import com.matrigluco.feature.history.domain.model.ChronicleSummary
import com.matrigluco.feature.history.domain.repository.ChronicleFeed
import com.matrigluco.feature.history.domain.repository.HistoryRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HistoryRepositoryImpl @Inject constructor(
    private val api: HistoryApi,
    private val sessionRepository: SessionRepository,
    private val predictionDao: PredictionSummaryDao,
    private val measurementDao: HealthMeasurementDao,
    private val reportDao: ReportSummaryDao
) : HistoryRepository {

    private val latestNetworkFeed = MutableStateFlow<HistoryListResponseDto?>(null)

    override fun observeChronicle(
        selectedType: ChronicleEventType,
        selectedMonth: String?
    ): Flow<ChronicleFeed> = flow {
        val session = sessionRepository.sessionState.value
        val ownerUserId = when (session) {
            is SessionState.Authenticated -> session.user.id
            is SessionState.OfflineRestored -> session.user.id
            else -> ""
        }

        // 1. Initial attempt to load network data or fallback to Room cache
        try {
            val networkDto = api.getHistory(
                types = selectedType.serverKey,
                month = selectedMonth,
                page = 1,
                pageSize = 100
            )
            latestNetworkFeed.value = networkDto
            val events = ChronicleMapper.mapDtoToEvents(networkDto)
            val groups = ChronicleMapper.groupEventsByDate(events)
            val summary = ChronicleMapper.buildSummary(networkDto, events, selectedMonth)
            emit(ChronicleFeed(summary = summary, dateGroups = groups, isOffline = false))
        } catch (_: Exception) {
            // Network failed -> Use cached data from Room
            val cachedPredictions = predictionDao.observe(ownerUserId, 50).firstOrNull().orEmpty()
            val cachedMeasurements = measurementDao.observe(ownerUserId, 50).firstOrNull().orEmpty()
            val cachedReports = reportDao.observe(ownerUserId, 50).firstOrNull().orEmpty()

            val offlineEvents = ChronicleMapper.mapRoomEntitiesToEvents(
                predictions = cachedPredictions,
                measurements = cachedMeasurements,
                reports = cachedReports
            ).filter { event ->
                when (selectedType) {
                    ChronicleEventType.ALL -> true
                    else -> event.type == selectedType
                }
            }

            val groups = ChronicleMapper.groupEventsByDate(offlineEvents)
            val summary = ChronicleSummary(
                totalEvents = offlineEvents.size,
                assessmentsCount = cachedPredictions.size,
                readingsCount = cachedMeasurements.size,
                reportsCount = cachedReports.size,
                consultationsCount = 0,
                activeMonth = selectedMonth
            )
            emit(ChronicleFeed(summary = summary, dateGroups = groups, isOffline = true))
        }
    }

    override suspend fun refreshChronicle(
        selectedType: ChronicleEventType,
        selectedMonth: String?
    ): Result<Unit> {
        return runCatching {
            val response = api.getHistory(
                types = selectedType.serverKey,
                month = selectedMonth,
                page = 1,
                pageSize = 100
            )
            latestNetworkFeed.value = response
        }
    }
}
