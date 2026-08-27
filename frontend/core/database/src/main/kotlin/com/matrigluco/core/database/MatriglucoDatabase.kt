package com.matrigluco.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.matrigluco.core.database.dao.HealthMeasurementDao
import com.matrigluco.core.database.dao.PredictionSummaryDao
import com.matrigluco.core.database.dao.ReportSummaryDao
import com.matrigluco.core.database.entity.HealthMeasurementEntity
import com.matrigluco.core.database.entity.PredictionSummaryEntity
import com.matrigluco.core.database.entity.ReportSummaryEntity

@Database(entities = [HealthMeasurementEntity::class, PredictionSummaryEntity::class, ReportSummaryEntity::class], version = 1, exportSchema = true)
abstract class MatriglucoDatabase : RoomDatabase() {
    abstract fun healthMeasurements(): HealthMeasurementDao
    abstract fun predictions(): PredictionSummaryDao
    abstract fun reports(): ReportSummaryDao
}
