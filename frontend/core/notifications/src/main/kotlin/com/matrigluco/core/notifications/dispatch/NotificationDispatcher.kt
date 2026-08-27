package com.matrigluco.core.notifications.dispatch

import android.Manifest
import android.app.Notification
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.matrigluco.core.notifications.R
import com.matrigluco.core.notifications.channel.NotificationChannelId
import com.matrigluco.core.notifications.deeplink.NotificationDeepLinkFactory
import com.matrigluco.core.notifications.model.AppNotification
import com.matrigluco.core.notifications.model.NotificationCategory

data class SafeNotificationCopy(val title: Int, val body: Int, val channel: NotificationChannelId, val group: String)

object NotificationPrivacyPolicy {
    fun copy(category: NotificationCategory) = when (category) {
        NotificationCategory.HEALTH_REMINDER -> SafeNotificationCopy(R.string.notification_title_health, R.string.notification_body_health, NotificationChannelId.HEALTH_REMINDERS, "matrigluco.health")
        NotificationCategory.REPORT -> SafeNotificationCopy(R.string.notification_title_report, R.string.notification_body_report, NotificationChannelId.REPORTS, "matrigluco.reports")
        NotificationCategory.CONSULTATION -> SafeNotificationCopy(R.string.notification_title_consultation, R.string.notification_body_consultation, NotificationChannelId.CONSULTATIONS, "matrigluco.consultations")
        NotificationCategory.ACCOUNT_SECURITY -> SafeNotificationCopy(R.string.notification_title_security, R.string.notification_body_security, NotificationChannelId.ACCOUNT_SECURITY, "matrigluco.security")
    }
}

class NotificationDispatcher(private val context: Context) {
    fun post(value: AppNotification): Boolean {
        if (android.os.Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return false
        val copy = NotificationPrivacyPolicy.copy(value.category)
        val publicVersion = NotificationCompat.Builder(context, copy.channel.value).setSmallIcon(R.drawable.ic_notification_matrigluco).setContentTitle(context.getString(R.string.notification_public_title)).setContentText(context.getString(R.string.notification_public_body)).build()
        val notification = NotificationCompat.Builder(context, copy.channel.value)
            .setSmallIcon(R.drawable.ic_notification_matrigluco)
            .setContentTitle(context.getString(copy.title)).setContentText(context.getString(copy.body))
            .setContentIntent(NotificationDeepLinkFactory(context).pendingIntent(value.id, value.destination))
            .setAutoCancel(true).setVisibility(NotificationCompat.VISIBILITY_PRIVATE).setPublicVersion(publicVersion)
            .setCategory(NotificationCompat.CATEGORY_STATUS).setGroup(copy.group).build()
        context.getSystemService(NotificationManager::class.java).notify(value.id.hashCode(), notification)
        return true
    }

    fun cancel(id: String) = context.getSystemService(NotificationManager::class.java).cancel(id.hashCode())
}
