package com.matrigluco.app.notifications.data

import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.Path
import retrofit2.http.Query

interface NotificationApi {

    @GET("api/v1/notifications")
    suspend fun listNotifications(
        @Query("is_read") isRead: Boolean? = null,
        @Query("notification_type") notificationType: String? = null,
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 50
    ): NotificationListResponseDto

    @PATCH("api/v1/notifications/{id}/read")
    suspend fun markAsRead(@Path("id") id: String): NotificationDto

    @PATCH("api/v1/notifications/read-all")
    suspend fun markAllAsRead(): Map<String, String>

    @DELETE("api/v1/notifications/{id}")
    suspend fun deleteNotification(@Path("id") id: String): Map<String, String>
}
