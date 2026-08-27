package com.matrigluco.feature.reports.di

import com.matrigluco.feature.reports.data.remote.ReportsApi
import com.matrigluco.feature.reports.data.repository.ReportsRepositoryImpl
import com.matrigluco.feature.reports.domain.repository.ReportsRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class ReportsBindings {
    @Binds
    @Singleton
    abstract fun bindRepository(impl: ReportsRepositoryImpl): ReportsRepository
}

@Module
@InstallIn(SingletonComponent::class)
object ReportsProviders {

    @Provides
    @Singleton
    fun provideReportsApi(retrofit: Retrofit): ReportsApi {
        return retrofit.create(ReportsApi::class.java)
    }
}
