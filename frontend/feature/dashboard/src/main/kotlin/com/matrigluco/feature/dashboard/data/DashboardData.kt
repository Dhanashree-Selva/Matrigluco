package com.matrigluco.feature.dashboard.data

import com.matrigluco.core.auth.session.SessionRepository
import com.matrigluco.core.auth.session.SessionState
import com.matrigluco.core.network.error.ApiErrorMapper
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.core.network.error.executeApiCall
import com.matrigluco.feature.dashboard.domain.ActivitySnapshot
import com.matrigluco.feature.dashboard.domain.DashboardRepository
import com.matrigluco.feature.dashboard.domain.DashboardSnapshot
import com.matrigluco.feature.dashboard.domain.MeasurementSnapshot
import com.matrigluco.feature.dashboard.domain.PredictionSnapshot
import javax.inject.Inject
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import retrofit2.Retrofit
import retrofit2.http.GET

@Serializable
data class DashboardDto(
    @SerialName("latest_measurements") val latestMeasurements: Map<String, JsonElement?> = emptyMap(),
    @SerialName("recent_prediction") val recentPrediction: PredictionDto? = null,
    @SerialName("recent_activities") val recentActivities: List<ActivityDto> = emptyList(),
    @SerialName("measurement_counts") val measurementCounts: MeasurementCountsDto? = null,
)

@Serializable
data class PredictionDto(
    val id: String = "",
    val probability: Double = 0.0,
    @SerialName("probability_score") val probabilityScore: Double? = null,
    @SerialName("risk_band") val riskBand: String = "low",
    @SerialName("prediction_result") val predictionResult: String? = null,
    @SerialName("created_at") val createdAt: String? = null,
)

@Serializable
data class ActivityDto(
    val id: String = "",
    val type: String = "",
    val title: String = "",
    val description: String = "",
    val timestamp: String = "",
    val path: String? = null,
    @SerialName("is_upcoming") val isUpcoming: Boolean = false,
)

@Serializable
data class MeasurementCountsDto(
    @SerialName("total_7_days") val total7Days: Int = 0,
    @SerialName("total_30_days") val total30Days: Int = 0,
)

interface DashboardApi {
    @GET("api/v1/dashboard/summary")
    suspend fun summary(): DashboardDto
}

class DashboardRepositoryImpl @Inject constructor(
    retrofit: Retrofit,
    private val sessionRepository: SessionRepository,
    private val errorMapper: ApiErrorMapper,
) : DashboardRepository {
    private val api = retrofit.create(DashboardApi::class.java)

    override suspend fun load(): ApiResult<DashboardSnapshot> = executeApiCall(errorMapper) {
        val dto = api.summary()
        val userName = when (val s = sessionRepository.sessionState.value) {
            is SessionState.Authenticated -> s.user.fullName ?: s.user.email.substringBefore('@')
            is SessionState.OfflineRestored -> s.user.fullName ?: s.user.email.substringBefore('@')
            else -> null
        }
        val measurements = dto.latestMeasurements.mapNotNull { (key, raw) ->
            if (raw != null && raw !is JsonNull) {
                raw.asMeasurement(key)
            } else {
                null
            }
        }
        val activities = dto.recentActivities.map {
            ActivitySnapshot(
                id = it.id,
                type = it.type,
                title = it.title,
                description = it.description,
                timestamp = it.timestamp,
                isUpcoming = it.isUpcoming,
            )
        }
        DashboardSnapshot(
            userName = userName,
            prediction = dto.recentPrediction?.let { PredictionSnapshot(it.id, it.riskBand, it.probability, it.createdAt.orEmpty()) },
            measurements = measurements,
            recentActivities = activities,
            totalMeasurements7Days = dto.measurementCounts?.total7Days ?: 0,
            totalMeasurements30Days = dto.measurementCounts?.total30Days ?: 0,
        )
    }
}

private fun JsonElement.asMeasurement(metricKey: String): MeasurementSnapshot? = runCatching {
    if (this !is JsonObject) return null
    val obj = this.jsonObject
    val metric = obj["metric_type"]?.jsonPrimitive?.content ?: metricKey
    val systolic = obj["systolic"]?.jsonPrimitive?.content
    val diastolic = obj["diastolic"]?.jsonPrimitive?.content
    val valuePrim = obj["value"]?.jsonPrimitive?.content ?: obj["value_primary"]?.jsonPrimitive?.content ?: systolic
        ?: return null

    val (formattedValue, secondaryVal) = if (systolic != null && diastolic != null) {
        val s = systolic.toDoubleOrNull()?.let { if (it % 1.0 == 0.0) it.toInt().toString() else "%.1f".format(java.util.Locale.US, it) } ?: systolic
        val d = diastolic.toDoubleOrNull()?.let { if (it % 1.0 == 0.0) it.toInt().toString() else "%.1f".format(java.util.Locale.US, it) } ?: diastolic
        "$s/$d" to d
    } else {
        val v = valuePrim.toDoubleOrNull()?.let { if (it % 1.0 == 0.0) it.toInt().toString() else "%.1f".format(java.util.Locale.US, it) } ?: valuePrim
        v to null
    }

    val unit = obj["unit"]?.jsonPrimitive?.content.orEmpty()
    val measuredAt = obj["measured_at"]?.jsonPrimitive?.content.orEmpty()

    val displayName = when (metric.lowercase()) {
        "glucose", "blood_glucose" -> "Blood Glucose"
        "blood_pressure" -> "Blood Pressure"
        "weight", "maternal_weight" -> "Maternal Weight"
        "bmi" -> "Body Mass Index"
        "hba1c" -> "HbA1c / Glycated"
        else -> metric.replace("_", " ").split(" ").joinToString(" ") { it.replaceFirstChar(Char::titlecase) }
    }

    MeasurementSnapshot(
        metric = metric,
        displayName = displayName,
        value = formattedValue,
        secondaryValue = secondaryVal,
        unit = unit,
        measuredAt = measuredAt,
    )
}.getOrNull()
