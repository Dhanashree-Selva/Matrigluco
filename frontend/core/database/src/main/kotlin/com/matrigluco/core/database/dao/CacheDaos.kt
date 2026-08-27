package com.matrigluco.core.database.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import androidx.room.Transaction
import com.matrigluco.core.database.entity.HealthMeasurementEntity
import com.matrigluco.core.database.entity.PredictionSummaryEntity
import com.matrigluco.core.database.entity.ReportSummaryEntity
import kotlinx.coroutines.flow.Flow

@Dao interface HealthMeasurementDao {
    @Query("SELECT * FROM health_measurements WHERE ownerUserId = :owner ORDER BY measuredAtEpochMillis DESC LIMIT :limit") fun observe(owner: String, limit: Int): Flow<List<HealthMeasurementEntity>>
    @Upsert suspend fun upsertAll(rows: List<HealthMeasurementEntity>)
    @Query("DELETE FROM health_measurements WHERE serverId = :id") suspend fun deleteById(id: String)
    @Query("DELETE FROM health_measurements WHERE ownerUserId = :owner") suspend fun clear(owner: String)
    @Transaction suspend fun replace(owner: String, rows: List<HealthMeasurementEntity>) { require(rows.all { it.ownerUserId == owner }); clear(owner); upsertAll(rows) }
}
@Dao interface PredictionSummaryDao {
    @Query("SELECT * FROM prediction_summaries WHERE ownerUserId = :owner ORDER BY createdAtEpochMillis DESC LIMIT :limit") fun observe(owner: String, limit: Int): Flow<List<PredictionSummaryEntity>>
    @Upsert suspend fun upsertAll(rows: List<PredictionSummaryEntity>)
    @Query("DELETE FROM prediction_summaries WHERE ownerUserId = :owner") suspend fun clear(owner: String)
    @Transaction suspend fun replace(owner: String, rows: List<PredictionSummaryEntity>) { require(rows.all { it.ownerUserId == owner }); clear(owner); upsertAll(rows) }
}
@Dao interface ReportSummaryDao {
    @Query("SELECT * FROM report_summaries WHERE ownerUserId = :owner ORDER BY uploadedAtEpochMillis DESC LIMIT :limit") fun observe(owner: String, limit: Int): Flow<List<ReportSummaryEntity>>
    @Upsert suspend fun upsertAll(rows: List<ReportSummaryEntity>)
    @Query("DELETE FROM report_summaries WHERE ownerUserId = :owner") suspend fun clear(owner: String)
    @Transaction suspend fun replace(owner: String, rows: List<ReportSummaryEntity>) { require(rows.all { it.ownerUserId == owner }); clear(owner); upsertAll(rows) }
}
