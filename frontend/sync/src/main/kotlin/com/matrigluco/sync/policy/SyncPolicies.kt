package com.matrigluco.sync.policy

import java.io.File
import java.security.MessageDigest
import java.util.concurrent.TimeUnit

object CacheRetentionPolicy { val transientMaxAgeMillis: Long = TimeUnit.DAYS.toMillis(7) }

enum class WorkerFailureKind { TRANSIENT, PERMANENT, AUTH_TERMINAL, CANCELLED }
object RetryPolicy { const val MAX_TRANSIENT_ATTEMPTS = 5; fun shouldRetry(kind: WorkerFailureKind, runAttemptCount: Int) = kind == WorkerFailureKind.TRANSIENT && runAttemptCount < MAX_TRANSIENT_ATTEMPTS }

object AccountScope {
    fun opaque(ownerUserId: String): String = MessageDigest.getInstance("SHA-256").digest(ownerUserId.toByteArray()).take(12).joinToString("") { "%02x".format(it) }
    fun matches(activeOwnerId: String?, expectedOpaqueScope: String) = activeOwnerId != null && opaque(activeOwnerId) == expectedOpaqueScope
}

class TransientCacheCleaner(private val root: File, private val nowMillis: () -> Long = System::currentTimeMillis) {
    fun cleanup(maxAgeMillis: Long = CacheRetentionPolicy.transientMaxAgeMillis): Int {
        val managed = File(root, "matrigluco_transient")
        if (!managed.exists()) return 0
        val cutoff = nowMillis() - maxAgeMillis
        return managed.walkBottomUp().filter { it.isFile && it.lastModified() < cutoff }.count { it.delete() }
    }
}
