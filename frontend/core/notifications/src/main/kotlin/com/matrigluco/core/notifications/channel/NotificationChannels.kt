package com.matrigluco.core.notifications.channel

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi
import com.matrigluco.core.notifications.R

enum class NotificationChannelId(val value: String) {
    HEALTH_REMINDERS("health_reminders"), REPORTS("reports"), CONSULTATIONS("consultations"), ACCOUNT_SECURITY("account_security")
}

class NotificationChannelManager(private val context: Context) {
    fun createKnownChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannels(listOf(
            channel(NotificationChannelId.HEALTH_REMINDERS, R.string.notification_channel_health, R.string.notification_channel_health_description, NotificationManager.IMPORTANCE_DEFAULT),
            channel(NotificationChannelId.REPORTS, R.string.notification_channel_reports, R.string.notification_channel_reports_description, NotificationManager.IMPORTANCE_DEFAULT),
            channel(NotificationChannelId.CONSULTATIONS, R.string.notification_channel_consultations, R.string.notification_channel_consultations_description, NotificationManager.IMPORTANCE_DEFAULT),
            channel(NotificationChannelId.ACCOUNT_SECURITY, R.string.notification_channel_security, R.string.notification_channel_security_description, NotificationManager.IMPORTANCE_HIGH),
        ))
    }

    fun isEnabled(id: NotificationChannelId): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.O || context.getSystemService(NotificationManager::class.java).getNotificationChannel(id.value)?.importance != NotificationManager.IMPORTANCE_NONE

    @RequiresApi(Build.VERSION_CODES.O)
    private fun channel(id: NotificationChannelId, name: Int, description: Int, importance: Int) =
        NotificationChannel(id.value, context.getString(name), importance).apply { this.description = context.getString(description); lockscreenVisibility = android.app.Notification.VISIBILITY_PRIVATE }
}
