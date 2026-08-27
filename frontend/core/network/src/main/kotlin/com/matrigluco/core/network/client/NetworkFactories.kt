package com.matrigluco.core.network.client

import com.matrigluco.core.common.config.AppConfig
import com.matrigluco.core.common.observability.AppLogger
import com.matrigluco.core.common.observability.DiagnosticEvent
import com.matrigluco.core.common.observability.LogLevel
import com.matrigluco.core.common.observability.NoOpAppLogger
import java.util.UUID
import java.util.concurrent.TimeUnit
import kotlinx.serialization.json.Json
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Authenticator
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

object OkHttpFactory {
    fun create(auth: Interceptor, authenticator: Authenticator, debugToolsEnabled: Boolean, logger: AppLogger = NoOpAppLogger): OkHttpClient {
        val requestId = Interceptor { chain -> chain.proceed(chain.request().newBuilder().header("X-Request-ID", UUID.randomUUID().toString()).build()) }
        val safeMetadata = Interceptor { chain ->
            val request = chain.request()
            val started = System.nanoTime()
            val response = chain.proceed(request)
            if (debugToolsEnabled) {
                val routeFamily = request.url.pathSegments.take(3).joinToString("/")
                logger.log(LogLevel.DEBUG, DiagnosticEvent("http_completed", mapOf(
                    "method" to request.method,
                    "route_family" to routeFamily,
                    "status" to response.code.toString(),
                    "duration_ms" to TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started).toString(),
                    "request_id" to (response.header("X-Request-ID") ?: request.header("X-Request-ID").orEmpty()),
                )), null)
            }
            response
        }
        return OkHttpClient.Builder().connectTimeout(15, TimeUnit.SECONDS).readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS).callTimeout(90, TimeUnit.SECONDS)
            .addInterceptor(requestId).addInterceptor(auth).addInterceptor(safeMetadata).authenticator(authenticator).build()
    }
}

object RetrofitFactory {
    fun create(config: AppConfig, client: OkHttpClient, json: Json): Retrofit = Retrofit.Builder()
        .baseUrl(config.apiBaseUrl).client(client)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType())).build()
}
