package com.matrigluco.feature.tracking.data

import com.matrigluco.core.auth.session.SessionRepository
import com.matrigluco.core.auth.session.SessionState
import com.matrigluco.core.database.dao.HealthMeasurementDao
import com.matrigluco.core.database.entity.HealthMeasurementEntity
import com.matrigluco.core.network.error.ApiErrorMapper
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.core.network.error.executeApiCall
import com.matrigluco.feature.tracking.domain.TrackingRepository
import com.matrigluco.feature.tracking.domain.model.HealthReading
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

@Serializable
data class MeasurementItemDto(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    @SerialName("metric_type") val metricType: String = "",
    @SerialName("value_primary") val valuePrimary: Double = 0.0,
    @SerialName("value_secondary") val valueSecondary: Double? = null,
    val value: Double? = null,
    val systolic: Double? = null,
    val diastolic: Double? = null,
    val unit: String = "",
    @SerialName("measured_at") val measuredAt: String = "",
    val source: String = "manual",
    val notes: String? = null,
    @SerialName("created_at") val createdAt: String = "",
)

@Serializable
data class MeasurementListDto(
    val items: List<MeasurementItemDto> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    @SerialName("page_size") val pageSize: Int = 100,
)

@Serializable
data class CreateMeasurementDto(
    @SerialName("metric_type") val metricType: String,
    @SerialName("value_primary") val valuePrimary: Double? = null,
    @SerialName("value_secondary") val valueSecondary: Double? = null,
    val systolic: Double? = null,
    val diastolic: Double? = null,
    val unit: String,
    @SerialName("measured_at") val measuredAt: String? = null,
    val notes: String? = null,
)

interface TrackingApi {
    @GET("api/v1/health-measurements")
    suspend fun listMeasurements(
        @Query("metric_type") metricType: String? = null,
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 100
    ): MeasurementListDto

    @POST("api/v1/health-measurements")
    suspend fun createMeasurement(
        @Body payload: CreateMeasurementDto
    ): MeasurementItemDto

    @DELETE("api/v1/health-measurements/{id}")
    suspend fun deleteMeasurement(
        @Path("id") id: String
    )
}

@Singleton
class TrackingRepositoryImpl @Inject constructor(
    retrofit: Retrofit,
    private val measurementDao: HealthMeasurementDao,
    private val sessionRepository: SessionRepository,
    private val errorMapper: ApiErrorMapper,
) : TrackingRepository {

    private val api = retrofit.create(TrackingApi::class.java)

    override fun observeReadings(ownerUserId: String, metricType: String): Flow<List<HealthReading>> {
        return measurementDao.observe(ownerUserId, 300).map { entities ->
            entities.filter {
                metricType.isBlank() || it.metricType.equals(metricType.trim(), ignoreCase = true)
            }.map { it.toDomain() }
        }
    }

    override suspend fun fetchReadings(metricType: String?): ApiResult<List<HealthReading>> = executeApiCall(errorMapper) {
        val ownerId = getOwnerUserId()
        val response = api.listMeasurements(
            metricType = metricType?.takeIf { it.isNotBlank() },
            page = 1,
            pageSize = 100
        )
        val entities = response.items.map { it.toEntity(ownerId) }
        if (ownerId.isNotBlank() && entities.isNotEmpty()) {
            measurementDao.upsertAll(entities)
        }
        response.items.map { it.toDomain() }
    }

    override suspend fun createReading(
        metricType: String,
        valuePrimary: Double,
        valueSecondary: Double?,
        unit: String,
        measuredAt: String?,
        notes: String?
    ): ApiResult<HealthReading> = executeApiCall(errorMapper) {
        val ownerId = getOwnerUserId()
        val payload = CreateMeasurementDto(
            metricType = metricType,
            valuePrimary = valuePrimary,
            valueSecondary = valueSecondary,
            systolic = if (metricType.equals("blood_pressure", ignoreCase = true)) valuePrimary else null,
            diastolic = if (metricType.equals("blood_pressure", ignoreCase = true)) valueSecondary else null,
            unit = unit,
            measuredAt = measuredAt,
            notes = notes
        )
        val dto = api.createMeasurement(payload)
        val entity = dto.toEntity(ownerId)
        if (ownerId.isNotBlank()) {
            measurementDao.upsertAll(listOf(entity))
        }
        dto.toDomain()
    }

    override suspend fun deleteReading(id: String): ApiResult<Unit> = executeApiCall(errorMapper) {
        api.deleteMeasurement(id)
        measurementDao.deleteById(id)
    }

    private fun getOwnerUserId(): String = when (val s = sessionRepository.sessionState.value) {
        is SessionState.Authenticated -> s.user.id
        is SessionState.OfflineRestored -> s.user.id
        else -> ""
    }
}

private fun MeasurementItemDto.toDomain(): HealthReading {
    val prim = valuePrimary.takeIf { it != 0.0 } ?: value ?: systolic ?: 0.0
    val sec = valueSecondary ?: diastolic
    val epoch = parseIsoToEpochMillis(measuredAt.ifBlank { createdAt })
    return HealthReading(
        id = id,
        metricType = metricType,
        valuePrimary = prim,
        valueSecondary = sec,
        unit = unit,
        measuredAt = measuredAt.ifBlank { createdAt },
        measuredAtEpochMillis = epoch,
        notes = notes,
        source = source,
        isSyncPending = false,
    )
}

private fun MeasurementItemDto.toEntity(ownerUserId: String): HealthMeasurementEntity {
    val prim = valuePrimary.takeIf { it != 0.0 } ?: value ?: systolic ?: 0.0
    val sec = valueSecondary ?: diastolic
    val epoch = parseIsoToEpochMillis(measuredAt.ifBlank { createdAt })
    return HealthMeasurementEntity(
        ownerUserId = ownerUserId,
        serverId = id,
        metricType = metricType,
        numericValueDecimal = prim.toString(),
        systolic = if (metricType.equals("blood_pressure", ignoreCase = true)) prim.toInt() else null,
        diastolic = sec?.toInt(),
        unit = unit,
        measuredAtEpochMillis = epoch,
        cachedAtEpochMillis = System.currentTimeMillis(),
    )
}

private fun HealthMeasurementEntity.toDomain(): HealthReading {
    val prim = numericValueDecimal?.toDoubleOrNull() ?: systolic?.toDouble() ?: 0.0
    val sec = diastolic?.toDouble()
    return HealthReading(
        id = serverId,
        metricType = metricType,
        valuePrimary = prim,
        valueSecondary = sec,
        unit = unit,
        measuredAt = formatEpochToIso(measuredAtEpochMillis),
        measuredAtEpochMillis = measuredAtEpochMillis,
        source = "cached",
        isSyncPending = false,
    )
}

private fun parseIsoToEpochMillis(iso: String): Long {
    if (iso.isBlank()) return System.currentTimeMillis()
    val patterns = arrayOf(
        "yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'",
        "yyyy-MM-dd'T'HH:mm:ss'Z'",
        "yyyy-MM-dd'T'HH:mm:ss.SSS",
        "yyyy-MM-dd'T'HH:mm:ss",
        "yyyy-MM-dd HH:mm:ss",
        "yyyy-MM-dd"
    )
    for (p in patterns) {
        try {
            val sdf = SimpleDateFormat(p, Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }
            return sdf.parse(iso)?.time ?: continue
        } catch (_: Exception) {
            // try next pattern
        }
    }
    return System.currentTimeMillis()
}

private fun formatEpochToIso(epoch: Long): String {
    val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }
    return sdf.format(epoch)
}
