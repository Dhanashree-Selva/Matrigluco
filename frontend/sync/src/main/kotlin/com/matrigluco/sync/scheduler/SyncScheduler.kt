package com.matrigluco.sync.scheduler

import android.content.Context
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.matrigluco.sync.policy.AccountScope
import com.matrigluco.sync.worker.CleanupExpiredCacheWorker
import dagger.hilt.android.qualifiers.ApplicationContext
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

object WorkNames { const val CACHE_CLEANUP = "cache-cleanup"; fun health(scope: String) = "health-sync-$scope"; fun report(localId: String) = "report-upload-$localId" }
object WorkTags { const val USER_SCOPED = "user-scoped"; const val HEALTH_SYNC = "health-sync"; const val REPORT_UPLOAD = "report-upload"; const val CACHE_CLEANUP = "cache-cleanup"; fun account(scope: String) = "account-$scope" }

interface SyncScheduler {
    fun scheduleCacheCleanup()
    fun runCacheCleanupNow()
    fun cancelUserWork(ownerUserId: String)
}

@Singleton class WorkManagerSyncScheduler @Inject constructor(@ApplicationContext context: Context) : SyncScheduler {
    private val work = WorkManager.getInstance(context)
    override fun scheduleCacheCleanup() {
        val request = PeriodicWorkRequestBuilder<CleanupExpiredCacheWorker>(1, TimeUnit.DAYS)
            .setConstraints(Constraints.Builder().setRequiresBatteryNotLow(true).build()).addTag(WorkTags.CACHE_CLEANUP).build()
        work.enqueueUniquePeriodicWork(WorkNames.CACHE_CLEANUP, ExistingPeriodicWorkPolicy.KEEP, request)
    }
    override fun runCacheCleanupNow() {
        val request = OneTimeWorkRequestBuilder<CleanupExpiredCacheWorker>().setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS).addTag(WorkTags.CACHE_CLEANUP).build()
        work.enqueueUniqueWork("${WorkNames.CACHE_CLEANUP}-now", ExistingWorkPolicy.KEEP, request)
    }
    override fun cancelUserWork(ownerUserId: String) { work.cancelAllWorkByTag(WorkTags.account(AccountScope.opaque(ownerUserId))) }
}
