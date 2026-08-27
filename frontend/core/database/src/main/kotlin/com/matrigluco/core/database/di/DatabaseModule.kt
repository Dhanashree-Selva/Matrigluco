package com.matrigluco.core.database.di

import android.content.Context
import androidx.room.Room
import com.matrigluco.core.database.MatriglucoDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module @InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides @Singleton fun database(@ApplicationContext context: Context): MatriglucoDatabase =
        Room.databaseBuilder(context, MatriglucoDatabase::class.java, "matrigluco_cache.db").build()
    @Provides fun health(db: MatriglucoDatabase) = db.healthMeasurements()
    @Provides fun predictions(db: MatriglucoDatabase) = db.predictions()
    @Provides fun reports(db: MatriglucoDatabase) = db.reports()
}
