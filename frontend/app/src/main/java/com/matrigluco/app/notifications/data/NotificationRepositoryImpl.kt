package com.matrigluco.app.notifications.data

import com.matrigluco.app.notifications.domain.NotificationRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NotificationRepositoryImpl @Inject constructor(
    private val api: NotificationApi
) : NotificationRepository {

    override suspend fun getNotifications(
        isRead: Boolean?,
        notificationType: String?
    ): Result<NotificationListResponseDto> = runCatching {
        api.listNotifications(
            isRead = isRead,
            notificationType = notificationType,
            page = 1,
            pageSize = 50
        )
    }

    override suspend fun markAsRead(id: String): Result<NotificationDto> = runCatching {
        api.markAsRead(id)
    }

    override suspend fun markAllAsRead(): Result<Unit> = runCatching {
        api.markAllAsRead()
        Unit
    }

    override suspend fun deleteNotification(id: String): Result<Unit> = runCatching {
        api.deleteNotification(id)
        Unit
    }
}
