package com.matrigluco.core.notifications.deeplink

import android.app.PendingIntent
import android.content.Context
import android.content.Intent

sealed interface NotificationDestination {
    data object Notifications : NotificationDestination
    data class Report(val id: String) : NotificationDestination
    data class Consultation(val id: String) : NotificationDestination
}

object NotificationDeepLinkContract {
    const val EXTRA_TYPE = "com.matrigluco.notification.TYPE"
    const val EXTRA_RESOURCE_ID = "com.matrigluco.notification.RESOURCE_ID"
    const val TYPE_NOTIFICATIONS = "notifications"
    const val TYPE_REPORT = "report"
    const val TYPE_CONSULTATION = "consultation"

    fun parse(intent: Intent?): NotificationDestination? = parse(intent?.getStringExtra(EXTRA_TYPE), intent?.getStringExtra(EXTRA_RESOURCE_ID))
    fun parse(type: String?, resourceId: String?): NotificationDestination? = when (type) {
        TYPE_NOTIFICATIONS -> NotificationDestination.Notifications
        TYPE_REPORT -> resourceId.safeId()?.let(NotificationDestination::Report)
        TYPE_CONSULTATION -> resourceId.safeId()?.let(NotificationDestination::Consultation)
        else -> null
    }

    private fun String?.safeId() = this?.takeIf { it.length in 1..128 && it.all { c -> c.isLetterOrDigit() || c == '-' || c == '_' } }
}

class NotificationDeepLinkFactory(private val context: Context) {
    fun pendingIntent(notificationId: String, destination: NotificationDestination?): PendingIntent {
        val safeDestination = destination ?: NotificationDestination.Notifications
        val intent = Intent().setClassName(context, "com.matrigluco.app.MainActivity").addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        when (safeDestination) {
            NotificationDestination.Notifications -> intent.putExtra(NotificationDeepLinkContract.EXTRA_TYPE, NotificationDeepLinkContract.TYPE_NOTIFICATIONS)
            is NotificationDestination.Report -> intent.putExtra(NotificationDeepLinkContract.EXTRA_TYPE, NotificationDeepLinkContract.TYPE_REPORT).putExtra(NotificationDeepLinkContract.EXTRA_RESOURCE_ID, safeDestination.id)
            is NotificationDestination.Consultation -> intent.putExtra(NotificationDeepLinkContract.EXTRA_TYPE, NotificationDeepLinkContract.TYPE_CONSULTATION).putExtra(NotificationDeepLinkContract.EXTRA_RESOURCE_ID, safeDestination.id)
        }
        return PendingIntent.getActivity(context, notificationId.hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }
}
