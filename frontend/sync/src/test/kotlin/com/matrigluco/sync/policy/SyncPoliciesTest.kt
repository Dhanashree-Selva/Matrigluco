package com.matrigluco.sync.policy

import java.io.File
import java.nio.file.Files
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SyncPoliciesTest {
    @Test fun `account scope rejects account switch`() {
        val queuedForA = AccountScope.opaque("user-a")
        assertTrue(AccountScope.matches("user-a", queuedForA))
        assertFalse(AccountScope.matches("user-b", queuedForA))
        assertFalse(AccountScope.matches(null, queuedForA))
    }
    @Test fun `only bounded transient failures retry`() {
        assertTrue(RetryPolicy.shouldRetry(WorkerFailureKind.TRANSIENT, 0))
        assertFalse(RetryPolicy.shouldRetry(WorkerFailureKind.TRANSIENT, RetryPolicy.MAX_TRANSIENT_ATTEMPTS))
        assertFalse(RetryPolicy.shouldRetry(WorkerFailureKind.PERMANENT, 0))
        assertFalse(RetryPolicy.shouldRetry(WorkerFailureKind.AUTH_TERMINAL, 0))
    }
    @Test fun `cleanup deletes only expired files in managed directory`() {
        val root = Files.createTempDirectory("matrigluco-sync-test").toFile(); val managed = File(root, "matrigluco_transient").apply { mkdirs() }
        val old = File(managed, "old.tmp").apply { writeText("x"); setLastModified(1) }
        val current = File(managed, "current.tmp").apply { writeText("x"); setLastModified(9_500) }
        val outside = File(root, "draft.txt").apply { writeText("keep"); setLastModified(1) }
        assertEquals(1, TransientCacheCleaner(root) { 10_000 }.cleanup(1_000))
        assertFalse(old.exists()); assertTrue(current.exists()); assertTrue(outside.exists())
        root.deleteRecursively()
    }
}
