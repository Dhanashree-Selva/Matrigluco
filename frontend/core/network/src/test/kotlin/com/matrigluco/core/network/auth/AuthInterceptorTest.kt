package com.matrigluco.core.network.auth

import okhttp3.OkHttpClient
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.Assert.assertEquals
import org.junit.Test

class AuthInterceptorTest {
    @Test fun `attaches bearer without replacing explicit authorization`() {
        MockWebServer().use { server ->
            server.enqueue(MockResponse()); server.enqueue(MockResponse())
            val client = OkHttpClient.Builder().addInterceptor(AuthInterceptor(object : AuthSessionProvider { override fun accessToken() = "secret" })).build()
            client.newCall(okhttp3.Request.Builder().url(server.url("/")).build()).execute().close()
            client.newCall(okhttp3.Request.Builder().url(server.url("/")).header("Authorization", "Custom value").build()).execute().close()
            assertEquals("Bearer secret", server.takeRequest().getHeader("Authorization")); assertEquals("Custom value", server.takeRequest().getHeader("Authorization"))
        }
    }
}
