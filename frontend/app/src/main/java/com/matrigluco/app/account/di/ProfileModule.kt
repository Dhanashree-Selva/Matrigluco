package com.matrigluco.app.account.di

import com.matrigluco.app.account.data.ProfileApi
import com.matrigluco.app.account.data.ProfileRepositoryImpl
import com.matrigluco.app.account.domain.ProfileRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class ProfileBindings {
    @Binds
    @Singleton
    abstract fun bindProfileRepository(impl: ProfileRepositoryImpl): ProfileRepository
}

@Module
@InstallIn(SingletonComponent::class)
object ProfileProviders {

    @Provides
    @Singleton
    fun provideProfileApi(retrofit: Retrofit): ProfileApi {
        return retrofit.create(ProfileApi::class.java)
    }
}
