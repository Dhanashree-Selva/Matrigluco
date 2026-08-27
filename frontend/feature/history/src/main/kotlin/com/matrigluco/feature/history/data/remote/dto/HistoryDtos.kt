package com.matrigluco.feature.history.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

@Serializable
data class HistoryEventDto(
    val id: String,
    val type: String,
    @SerialName("occurred_at") val occurredAt: String,
    @SerialName("resource_id") val resourceId: String,
    val title: String,
    val summary: String? = null,
    val status: String? = null,
    @SerialName("episode_id") val episodeId: String? = null,
    @SerialName("episode_type") val episodeType: String? = null,
    val details: JsonObject? = null
)

@Serializable
data class HistoryListResponseDto(
    val items: List<HistoryEventDto> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    @SerialName("page_size") val pageSize: Int = 20,
    @SerialName("total_pages") val totalPages: Int = 1,
    @SerialName("available_months") val availableMonths: List<String> = emptyList(),
    @SerialName("event_counts") val eventCounts: Map<String, Int> = emptyMap()
)
