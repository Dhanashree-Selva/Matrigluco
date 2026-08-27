package com.matrigluco.core.network.auth

import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val session: AuthSessionProvider) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        if (request.header("Authorization") != null) return chain.proceed(request)
        val token = session.accessToken()?.takeIf { it.isNotBlank() } ?: return chain.proceed(request)
        return chain.proceed(request.newBuilder().header("Authorization", "Bearer $token").build())
    }
}
