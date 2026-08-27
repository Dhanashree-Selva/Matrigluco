package com.matrigluco.app.notifications.di

import com.matrigluco.app.notifications.data.NotificationApi
import com.matrigluco.app.notifications.data.NotificationRepositoryImpl
import com.matrigluco.app.notifications.domain.NotificationRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class NotificationBindings {
    @Binds
    @Singleton
    abstract fun bindNotificationRepository(impl: NotificationRepositoryImpl): NotificationRepository
}

@Module
@InstallIn(SingletonComponent::class)
object NotificationProviders {

    @Provides
    @Singleton
    fun provideNotificationApi(retrofit: Retrofit): NotificationApi {
        return retrofit.create(NotificationApi::class.java)
    }
}
