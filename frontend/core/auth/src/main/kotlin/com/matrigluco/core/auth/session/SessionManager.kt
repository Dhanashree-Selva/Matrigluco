package com.matrigluco.core.auth.session

import com.matrigluco.core.auth.token.SecureTokenStore
import com.matrigluco.core.auth.token.TokenSnapshot
import com.matrigluco.core.network.auth.AuthSessionProvider
import com.matrigluco.core.network.auth.TokenRefreshProvider
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

@Singleton
class SessionManager @Inject constructor(private val store: SecureTokenStore, private val remote: SessionRemote) : SessionRepository, AuthSessionProvider, TokenRefreshProvider {
    private val mutableState = MutableStateFlow<SessionState>(SessionState.Restoring)
    override val sessionState: StateFlow<SessionState> = mutableState
    private val refreshMutex = Mutex()
    @Volatile private var tokens: TokenSnapshot? = null
    @Volatile private var generation = 0L
    override fun accessToken(): String? = tokens?.accessToken

    override suspend fun resolveSession() {
        if (mutableState.value != SessionState.Restoring) return
        val restored = try { store.read() } catch (cancelled: CancellationException) { throw cancelled } catch (_: Exception) { store.clear(); mutableState.value = SessionState.Expired(SessionExpiryReason.KEYSTORE_FAILURE); return }
        if (restored == null) { mutableState.value = SessionState.Public; return }
        tokens = restored
        when (val outcome = remote.refresh(restored.refreshToken)) {
            is RefreshOutcome.Success -> establish(outcome.session)
            RefreshOutcome.NetworkUnavailable, RefreshOutcome.ServiceUnavailable -> mutableState.value = SessionState.OfflineRestored(restored.user, restored.onboardingComplete)
            is RefreshOutcome.Terminal -> expire(outcome.reason)
        }
    }

    suspend fun establish(session: RemoteSession) {
        val snapshot = TokenSnapshot(session.accessToken, session.refreshToken, nowSeconds() + session.expiresInSeconds, session.user, session.onboardingComplete)
        store.write(snapshot); tokens = snapshot; generation++; mutableState.value = SessionState.Authenticated(session.user, session.onboardingComplete)
    }

    override suspend fun updateCurrentUser(user: AuthenticatedUser) {
        val currentTokens = tokens ?: return
        val updatedTokens = currentTokens.copy(user = user)
        try { store.write(updatedTokens) } catch (_: Exception) {}
        tokens = updatedTokens
        generation++
        when (val state = mutableState.value) {
            is SessionState.Authenticated -> mutableState.value = state.copy(user = user)
            is SessionState.OfflineRestored -> mutableState.value = state.copy(user = user)
            else -> {}
        }
    }

    suspend fun logout() {
        val refresh = tokens?.refreshToken
        try {
            if (refresh != null) remote.logout(refresh)
        } catch (cancelled: CancellationException) {
            clearLocal(SessionState.Public)
            throw cancelled
        } catch (_: Exception) {
            // A failed server revocation must never leave local credentials behind.
        }
        clearLocal(SessionState.Public)
    }
    override suspend fun markSignedOut() = logout()

    private suspend fun refreshIfNeeded(failed: String?): String? = refreshMutex.withLock {
        val current = tokens ?: return@withLock null
        if (failed != null && current.accessToken != failed) return@withLock current.accessToken
        val startGeneration = generation
        return@withLock when (val outcome = remote.refresh(current.refreshToken)) {
            is RefreshOutcome.Success -> { if (generation == startGeneration) establish(outcome.session); tokens?.accessToken }
            RefreshOutcome.NetworkUnavailable, RefreshOutcome.ServiceUnavailable -> null
            is RefreshOutcome.Terminal -> { expire(outcome.reason); null }
        }
    }
    override fun refreshBlocking(failedAccessToken: String?): String? = runBlocking(Dispatchers.IO) { refreshIfNeeded(failedAccessToken) }
    private suspend fun expire(reason: SessionExpiryReason) = clearLocal(SessionState.Expired(reason))
    private suspend fun clearLocal(next: SessionState) { generation++; tokens = null; store.clear(); mutableState.value = next }
    private fun nowSeconds() = System.currentTimeMillis() / 1000
}
