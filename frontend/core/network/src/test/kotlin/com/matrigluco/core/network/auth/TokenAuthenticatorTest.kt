package com.matrigluco.core.network.auth

import java.util.Collections
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.mockwebserver.Dispatcher
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.RecordedRequest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class TokenAuthenticatorTest {
    @Test fun `expired request refreshes and retries exactly once`() {
        MockWebServer().use { server ->
            server.enqueue(MockResponse().setResponseCode(401)); server.enqueue(MockResponse().setBody("ok"))
            val refreshes = AtomicInteger()
            val client = OkHttpClient.Builder().authenticator(TokenAuthenticator { refreshes.incrementAndGet(); "new-token" }).build()
            client.newCall(request(server, "old-token")).execute().use { assertEquals(200, it.code) }
            assertEquals(1, refreshes.get()); server.takeRequest()
            assertEquals("Bearer new-token", server.takeRequest().getHeader("Authorization"))
        }
    }

    @Test fun `concurrent 401 responses use a single refresh flight`() {
        MockWebServer().use { server ->
            server.dispatcher = object : Dispatcher() { override fun dispatch(request: RecordedRequest) = if (request.getHeader("Authorization") == "Bearer old-token") MockResponse().setResponseCode(401) else MockResponse().setBody("ok") }
            val refreshes = AtomicInteger(); val releaseRefresh = CountDownLatch(1)
            val client = OkHttpClient.Builder().authenticator(TokenAuthenticator { refreshes.incrementAndGet(); releaseRefresh.await(2, TimeUnit.SECONDS); "new-token" }).build()
            val pool = Executors.newFixedThreadPool(3); val results = Collections.synchronizedList(mutableListOf<Int>())
            repeat(3) { pool.submit { client.newCall(request(server, "old-token")).execute().use { results += it.code } } }
            while (refreshes.get() == 0) Thread.yield()
            releaseRefresh.countDown(); pool.shutdown(); pool.awaitTermination(5, TimeUnit.SECONDS)
            assertEquals(listOf(200, 200, 200), results.sorted()); assertEquals(1, refreshes.get())
        }
    }

    @Test fun `refresh failure returns no retry and never loops`() {
        val response = okhttp3.Response.Builder().request(Request.Builder().url("https://example.invalid/protected").header("Authorization", "Bearer expired").build()).protocol(okhttp3.Protocol.HTTP_1_1).code(401).message("Unauthorized").build()
        assertNull(TokenAuthenticator { null }.authenticate(null, response))
    }

    private fun request(server: MockWebServer, token: String) = Request.Builder().url(server.url("/protected")).header("Authorization", "Bearer $token").build()
}
