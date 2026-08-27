package com.matrigluco.sync.di

import com.matrigluco.sync.scheduler.SyncScheduler
import com.matrigluco.sync.scheduler.WorkManagerSyncScheduler
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module @InstallIn(SingletonComponent::class)
abstract class SyncModule { @Binds abstract fun scheduler(value: WorkManagerSyncScheduler): SyncScheduler }
