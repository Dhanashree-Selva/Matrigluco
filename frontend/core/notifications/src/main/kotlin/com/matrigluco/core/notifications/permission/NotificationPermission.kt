package com.matrigluco.core.notifications.permission

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

enum class NotificationPermissionState { NOT_REQUIRED, GRANTED, NOT_REQUESTED, DENIED, SETTINGS_REQUIRED }

object NotificationPermissionPolicy {
    fun resolve(required: Boolean, granted: Boolean, requestedBefore: Boolean, shouldShowRationale: Boolean) = when {
        !required -> NotificationPermissionState.NOT_REQUIRED
        granted -> NotificationPermissionState.GRANTED
        !requestedBefore -> NotificationPermissionState.NOT_REQUESTED
        shouldShowRationale -> NotificationPermissionState.DENIED
        else -> NotificationPermissionState.SETTINGS_REQUIRED
    }
}

class NotificationPermissionCoordinator {
    fun state(activity: Activity, requestedBefore: Boolean): NotificationPermissionState {
        return NotificationPermissionPolicy.resolve(
            required = Build.VERSION.SDK_INT >= 33,
            granted = ContextCompat.checkSelfPermission(activity, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED,
            requestedBefore = requestedBefore,
            shouldShowRationale = ActivityCompat.shouldShowRequestPermissionRationale(activity, Manifest.permission.POST_NOTIFICATIONS),
        )
    }

    fun settingsIntent(context: Context) = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${context.packageName}"))
}
