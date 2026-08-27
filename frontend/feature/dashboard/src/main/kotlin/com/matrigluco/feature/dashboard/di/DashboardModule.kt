package com.matrigluco.feature.dashboard.di

import com.matrigluco.feature.dashboard.data.DashboardRepositoryImpl
import com.matrigluco.feature.dashboard.domain.DashboardRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module @InstallIn(SingletonComponent::class)
abstract class DashboardModule { @Binds abstract fun repository(implementation: DashboardRepositoryImpl): DashboardRepository }
