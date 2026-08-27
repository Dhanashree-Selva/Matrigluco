package com.matrigluco.core.network.di

import android.content.Context
import com.matrigluco.core.common.config.AppConfig
import com.matrigluco.core.network.auth.AuthInterceptor
import com.matrigluco.core.network.auth.AuthSessionProvider
import com.matrigluco.core.network.auth.TokenAuthenticator
import com.matrigluco.core.network.auth.TokenRefreshProvider
import com.matrigluco.core.network.client.OkHttpFactory
import com.matrigluco.core.network.client.RetrofitFactory
import com.matrigluco.core.network.connectivity.AndroidNetworkMonitor
import com.matrigluco.core.network.connectivity.NetworkMonitor
import com.matrigluco.core.network.error.ApiErrorMapper
import com.matrigluco.core.network.serialization.JsonFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton
import javax.inject.Named
import kotlinx.serialization.json.Json
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

@Module @InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides @Singleton fun json(): Json = JsonFactory.strict()
    @Provides @Singleton fun errorMapper(json: Json) = ApiErrorMapper(json)
    @Provides @Singleton fun monitor(@ApplicationContext context: Context): NetworkMonitor = AndroidNetworkMonitor(context)
    @Provides @Singleton fun client(session: AuthSessionProvider, refresh: TokenRefreshProvider, config: AppConfig): OkHttpClient =
        OkHttpFactory.create(AuthInterceptor(session), TokenAuthenticator(refresh), config.debugToolsEnabled)
    @Provides @Singleton fun retrofit(config: AppConfig, client: OkHttpClient, json: Json): Retrofit = RetrofitFactory.create(config, client, json)
    @Provides @Singleton @Named("refresh") fun refreshClient(): OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS).readTimeout(30, TimeUnit.SECONDS).callTimeout(45, TimeUnit.SECONDS).build()
    @Provides @Singleton @Named("refresh") fun refreshRetrofit(config: AppConfig, @Named("refresh") client: OkHttpClient, json: Json): Retrofit = RetrofitFactory.create(config, client, json)
}
