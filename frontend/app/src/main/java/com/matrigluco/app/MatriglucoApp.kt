package com.matrigluco.app

import android.app.Application
import android.os.StrictMode
import com.matrigluco.core.notifications.channel.NotificationChannelManager
import com.matrigluco.sync.scheduler.SyncScheduler
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class MatriglucoApp : Application() {
    @Inject lateinit var syncScheduler: SyncScheduler
    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.DEBUG) {
            StrictMode.setThreadPolicy(StrictMode.ThreadPolicy.Builder().detectNetwork().penaltyLog().build())
            StrictMode.setVmPolicy(StrictMode.VmPolicy.Builder().detectLeakedClosableObjects().penaltyLog().build())
        }
        NotificationChannelManager(this).createKnownChannels()
        syncScheduler.scheduleCacheCleanup()
    }
}
