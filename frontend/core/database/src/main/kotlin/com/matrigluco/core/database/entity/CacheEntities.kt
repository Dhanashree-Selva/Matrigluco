package com.matrigluco.core.database.entity

import androidx.room.Entity
import androidx.room.Index

@Entity(tableName = "health_measurements", primaryKeys = ["ownerUserId", "serverId"], indices = [Index(value = ["ownerUserId", "measuredAtEpochMillis"])])
data class HealthMeasurementEntity(
    val ownerUserId: String, val serverId: String, val metricType: String,
    val numericValueDecimal: String?, val systolic: Int?, val diastolic: Int?, val unit: String,
    val measuredAtEpochMillis: Long, val cachedAtEpochMillis: Long,
)

@Entity(tableName = "prediction_summaries", primaryKeys = ["ownerUserId", "serverId"], indices = [Index(value = ["ownerUserId", "createdAtEpochMillis"])])
data class PredictionSummaryEntity(
    val ownerUserId: String, val serverId: String, val riskLevel: String,
    val probabilityDecimal: String?, val createdAtEpochMillis: Long, val cachedAtEpochMillis: Long,
)

@Entity(tableName = "report_summaries", primaryKeys = ["ownerUserId", "serverId"], indices = [Index(value = ["ownerUserId", "uploadedAtEpochMillis"])])
data class ReportSummaryEntity(
    val ownerUserId: String, val serverId: String, val title: String?, val status: String,
    val riskLevel: String?, val uploadedAtEpochMillis: Long?, val cachedAtEpochMillis: Long,
)
