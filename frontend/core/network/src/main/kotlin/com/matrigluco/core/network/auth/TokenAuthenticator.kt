package com.matrigluco.core.network.auth

import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route

fun interface TokenRefreshProvider { fun refreshBlocking(failedAccessToken: String?): String? }

class TokenAuthenticator(private val refreshProvider: TokenRefreshProvider) : Authenticator {
    private val refreshLock = Any()
    private var lastFailedToken: String? = null
    private var lastReplacementToken: String? = null

    override fun authenticate(route: Route?, response: Response): Request? {
        if (responseCount(response) >= 2 || response.request.header(RETRY_HEADER) != null) return null
        val failed = response.request.header("Authorization")?.removePrefix("Bearer ")
        val refreshed = synchronized(refreshLock) {
            if (failed != null && failed == lastFailedToken) lastReplacementToken
            else refreshProvider.refreshBlocking(failed).also { replacement ->
                lastFailedToken = failed
                lastReplacementToken = replacement
            }
        } ?: return null
        return response.request.newBuilder().header("Authorization", "Bearer $refreshed").header(RETRY_HEADER, "1").build()
    }
    private fun responseCount(response: Response): Int { var count = 1; var prior = response.priorResponse; while (prior != null) { count++; prior = prior.priorResponse }; return count }

    private companion object { const val RETRY_HEADER = "X-Matrigluco-Auth-Retry" }
}
