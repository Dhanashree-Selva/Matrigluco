package com.matrigluco.feature.history.di

import com.matrigluco.feature.history.data.remote.HistoryApi
import com.matrigluco.feature.history.data.repository.HistoryRepositoryImpl
import com.matrigluco.feature.history.domain.repository.HistoryRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class HistoryBindings {
    @Binds
    @Singleton
    abstract fun bindHistoryRepository(impl: HistoryRepositoryImpl): HistoryRepository
}

@Module
@InstallIn(SingletonComponent::class)
object HistoryProviders {

    @Provides
    @Singleton
    fun provideHistoryApi(retrofit: Retrofit): HistoryApi {
        return retrofit.create(HistoryApi::class.java)
    }
}
