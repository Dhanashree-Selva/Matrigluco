package com.matrigluco.core.notifications.model

import com.matrigluco.core.notifications.deeplink.NotificationDestination

enum class NotificationCategory { HEALTH_REMINDER, REPORT, CONSULTATION, ACCOUNT_SECURITY }
data class AppNotification(val id: String, val category: NotificationCategory, val destination: NotificationDestination? = null)
