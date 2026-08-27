package com.matrigluco.app.di

import com.matrigluco.app.BuildConfig
import com.matrigluco.core.common.config.AppConfig
import com.matrigluco.core.common.config.AppEnvironment
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppConfigModule {
    @Provides
    @Singleton
    fun provideAppConfig(): AppConfig = AppConfig(
        apiBaseUrl = BuildConfig.API_BASE_URL,
        environment = AppEnvironment.from(BuildConfig.APP_ENV),
        debugToolsEnabled = BuildConfig.DEBUG,
    )
}
