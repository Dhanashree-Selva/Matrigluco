package com.matrigluco.core.auth.session

import com.matrigluco.core.auth.token.SecureTokenStore
import com.matrigluco.core.auth.token.TokenSnapshot
import java.util.concurrent.atomic.AtomicInteger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test

class SessionManagerTest {
    @Test fun `concurrent 401 responses perform one rotating refresh`() = runBlocking {
        val old = snapshot("old-access", "old-refresh"); val store = MemoryStore(old); val calls = AtomicInteger()
        val remote = object : SessionRemote {
            override suspend fun refresh(refreshToken: String): RefreshOutcome { val call = calls.incrementAndGet(); delay(30); return RefreshOutcome.Success(if (call == 1) remote("new-access", "new-refresh") else remote("rotated-access", "rotated-refresh")) }
            override suspend fun logout(refreshToken: String) = Unit
        }
        val manager = SessionManager(store, remote); manager.resolveSession()
        List(5) { async(Dispatchers.IO) { manager.refreshBlocking("new-access") } }.awaitAll()
        assertEquals(2, calls.get()); assertEquals("rotated-refresh", store.value?.refreshToken)
    }
    @Test fun `invalid restored refresh clears secret and expires session`() = runBlocking {
        val store = MemoryStore(snapshot("access", "refresh")); val manager = SessionManager(store, object : SessionRemote {
            override suspend fun refresh(refreshToken: String) = RefreshOutcome.Terminal(SessionExpiryReason.REVOKED)
            override suspend fun logout(refreshToken: String) = Unit
        }); manager.resolveSession(); assertEquals(SessionState.Expired(SessionExpiryReason.REVOKED), manager.sessionState.value); assertEquals(null, store.value)
    }
    private fun snapshot(access: String, refresh: String) = TokenSnapshot(access, refresh, 10, user(), true)
    private fun remote(access: String, refresh: String) = RemoteSession(access, refresh, 300, user(), true)
    private fun user() = AuthenticatedUser("user", "user@example.com")
    private class MemoryStore(var value: TokenSnapshot?) : SecureTokenStore { override suspend fun read() = value; override suspend fun write(tokens: TokenSnapshot) { value = tokens }; override suspend fun clear() { value = null } }
}
