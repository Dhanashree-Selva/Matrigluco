package com.matrigluco.core.auth.di

import android.content.Context
import com.matrigluco.core.auth.session.SessionManager
import com.matrigluco.core.auth.session.SessionRepository
import com.matrigluco.core.auth.token.KeystoreTokenStore
import com.matrigluco.core.auth.token.SecureTokenStore
import com.matrigluco.core.network.auth.AuthSessionProvider
import com.matrigluco.core.network.auth.TokenRefreshProvider
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton
import kotlinx.serialization.json.Json

@Module @InstallIn(SingletonComponent::class)
abstract class AuthSessionBindings {
    @Binds abstract fun repository(value: SessionManager): SessionRepository
    @Binds abstract fun session(value: SessionManager): AuthSessionProvider
    @Binds abstract fun refresh(value: SessionManager): TokenRefreshProvider
}
@Module @InstallIn(SingletonComponent::class)
object AuthTokenModule {
    @Provides @Singleton fun tokenStore(@ApplicationContext context: Context, json: Json): SecureTokenStore = KeystoreTokenStore(context, json)
}
