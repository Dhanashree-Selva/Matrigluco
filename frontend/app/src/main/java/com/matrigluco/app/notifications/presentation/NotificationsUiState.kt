package com.matrigluco.app.notifications.presentation

import com.matrigluco.app.notifications.data.NotificationDto

enum class NotificationFilter(val displayName: String, val apiType: String?) {
    ALL("All", null),
    UNREAD("Unread", null),
    CLINICAL("Clinical Alerts", "clinical_alert"),
    REMINDERS("Reminders", "reminder"),
    SYSTEM("System", "system")
}

data class NotificationsUiState(
    val loading: Boolean = false,
    val filter: NotificationFilter = NotificationFilter.ALL,
    val items: List<NotificationDto> = emptyList(),
    val unreadCount: Int = 0,
    val error: String? = null
) {
    val displayedItems: List<NotificationDto> get() = when (filter) {
        NotificationFilter.ALL -> items
        NotificationFilter.UNREAD -> items.filter { !it.isRead }
        NotificationFilter.CLINICAL -> items.filter { it.notificationType.contains("clinical", ignoreCase = true) || it.notificationType.contains("risk", ignoreCase = true) }
        NotificationFilter.REMINDERS -> items.filter { it.notificationType.contains("reminder", ignoreCase = true) || it.notificationType.contains("vital", ignoreCase = true) }
        NotificationFilter.SYSTEM -> items.filter { it.notificationType.equals("system", ignoreCase = true) }
    }

    val isEmpty: Boolean get() = displayedItems.isEmpty()
}
