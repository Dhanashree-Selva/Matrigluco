package com.matrigluco.app.notifications.domain

import com.matrigluco.app.notifications.data.NotificationDto
import com.matrigluco.app.notifications.data.NotificationListResponseDto

interface NotificationRepository {
    suspend fun getNotifications(
        isRead: Boolean? = null,
        notificationType: String? = null
    ): Result<NotificationListResponseDto>

    suspend fun markAsRead(id: String): Result<NotificationDto>

    suspend fun markAllAsRead(): Result<Unit>

    suspend fun deleteNotification(id: String): Result<Unit>
}
