package com.matrigluco.feature.tracking.di

import com.matrigluco.feature.tracking.data.TrackingRepositoryImpl
import com.matrigluco.feature.tracking.domain.TrackingRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class TrackingModule {
    @Binds
    @Singleton
    abstract fun bindTrackingRepository(
        impl: TrackingRepositoryImpl
    ): TrackingRepository
}
