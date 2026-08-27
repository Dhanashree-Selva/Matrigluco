package com.matrigluco.app.notifications.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class NotificationDto(
    val id: String,
    @SerialName("user_id") val userId: String = "",
    val title: String,
    val message: String,
    @SerialName("notification_type") val notificationType: String = "system",
    @SerialName("resource_type") val resourceType: String? = null,
    @SerialName("resource_id") val resourceId: String? = null,
    @SerialName("is_read") val isRead: Boolean = false,
    @SerialName("read_at") val readAt: String? = null,
    @SerialName("created_at") val createdAt: String
)

@Serializable
data class NotificationListResponseDto(
    val items: List<NotificationDto> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    @SerialName("page_size") val pageSize: Int = 20,
    @SerialName("unread_count") val unreadCount: Int = 0
)
