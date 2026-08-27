package com.matrigluco.sync.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.matrigluco.sync.policy.TransientCacheCleaner

class CleanupExpiredCacheWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result = try {
        TransientCacheCleaner(applicationContext.cacheDir).cleanup()
        Result.success()
    } catch (_: SecurityException) {
        Result.failure()
    } catch (_: java.io.IOException) {
        if (runAttemptCount < 3) Result.retry() else Result.failure()
    }
}
