package com.matrigluco.feature.auth.di

import com.matrigluco.core.auth.session.SessionRemote
import com.matrigluco.feature.auth.data.AuthRepositoryImpl
import com.matrigluco.feature.auth.data.SessionRemoteImpl
import com.matrigluco.feature.auth.data.remote.AuthApi
import com.matrigluco.feature.auth.data.remote.RefreshApi
import com.matrigluco.feature.auth.domain.AuthRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Named
import retrofit2.Retrofit

@Module @InstallIn(SingletonComponent::class)
abstract class AuthFeatureBindings {
    @Binds abstract fun remote(value: SessionRemoteImpl): SessionRemote
    @Binds abstract fun repository(value: AuthRepositoryImpl): AuthRepository
}
@Module @InstallIn(SingletonComponent::class)
object AuthApiModule {
    @Provides fun authApi(retrofit: Retrofit): AuthApi = retrofit.create(AuthApi::class.java)
    @Provides fun refreshApi(@Named("refresh") retrofit: Retrofit): RefreshApi = retrofit.create(RefreshApi::class.java)
}
