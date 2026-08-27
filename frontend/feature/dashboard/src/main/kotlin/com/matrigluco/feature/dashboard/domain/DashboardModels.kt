package com.matrigluco.feature.dashboard.domain

import com.matrigluco.core.network.error.ApiResult

data class DashboardSnapshot(
    val userName: String? = null,
    val prediction: PredictionSnapshot? = null,
    val measurements: List<MeasurementSnapshot> = emptyList(),
    val recentActivities: List<ActivitySnapshot> = emptyList(),
    val totalMeasurements7Days: Int = 0,
    val totalMeasurements30Days: Int = 0,
)

data class PredictionSnapshot(
    val id: String,
    val riskBand: String,
    val probability: Double,
    val createdAt: String,
)

data class MeasurementSnapshot(
    val metric: String,
    val displayName: String,
    val value: String,
    val secondaryValue: String?,
    val unit: String,
    val measuredAt: String,
)

data class ActivitySnapshot(
    val id: String,
    val type: String,
    val title: String,
    val description: String,
    val timestamp: String,
    val isUpcoming: Boolean = false,
)

interface DashboardRepository {
    suspend fun load(): ApiResult<DashboardSnapshot>
}
