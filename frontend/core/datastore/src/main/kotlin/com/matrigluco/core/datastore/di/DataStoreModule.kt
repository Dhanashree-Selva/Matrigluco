package com.matrigluco.core.datastore.di

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStoreFile
import com.matrigluco.core.datastore.preference.AppPreferences
import com.matrigluco.core.datastore.preference.DataStoreAppPreferences
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module @InstallIn(SingletonComponent::class)
object DataStoreModule {
    @Provides @Singleton fun dataStore(@ApplicationContext context: Context): DataStore<Preferences> = PreferenceDataStoreFactory.create { context.preferencesDataStoreFile("app_preferences") }
    @Provides @Singleton fun preferences(store: DataStore<Preferences>): AppPreferences = DataStoreAppPreferences(store)
}
