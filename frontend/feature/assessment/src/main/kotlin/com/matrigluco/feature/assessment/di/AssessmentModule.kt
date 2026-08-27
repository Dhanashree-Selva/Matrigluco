package com.matrigluco.feature.assessment.di

import com.matrigluco.feature.assessment.data.AssessmentRepository
import com.matrigluco.feature.assessment.data.AssessmentRepositoryImpl
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class AssessmentModule {
    @Binds
    @Singleton
    abstract fun bindAssessmentRepository(impl: AssessmentRepositoryImpl): AssessmentRepository
}
