package com.matrigluco.feature.history.domain.repository

import com.matrigluco.feature.history.domain.model.ChronicleDateGroup
import com.matrigluco.feature.history.domain.model.ChronicleEventType
import com.matrigluco.feature.history.domain.model.ChronicleSummary
import kotlinx.coroutines.flow.Flow

data class ChronicleFeed(
    val summary: ChronicleSummary,
    val dateGroups: List<ChronicleDateGroup>,
    val isOffline: Boolean
)

interface HistoryRepository {
    fun observeChronicle(
        selectedType: ChronicleEventType,
        selectedMonth: String?
    ): Flow<ChronicleFeed>

    suspend fun refreshChronicle(
        selectedType: ChronicleEventType,
        selectedMonth: String?
    ): Result<Unit>
}
