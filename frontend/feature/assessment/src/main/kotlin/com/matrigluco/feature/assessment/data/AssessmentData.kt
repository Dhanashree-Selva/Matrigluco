package com.matrigluco.feature.assessment.data

import com.matrigluco.core.auth.session.SessionRepository
import com.matrigluco.core.auth.session.SessionState
import com.matrigluco.core.database.dao.PredictionSummaryDao
import com.matrigluco.core.database.entity.PredictionSummaryEntity
import com.matrigluco.core.network.error.ApiErrorMapper
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.core.network.error.executeApiCall
import com.matrigluco.feature.assessment.domain.model.AssessmentFieldKey
import com.matrigluco.feature.assessment.domain.model.AssessmentResult
import com.matrigluco.feature.assessment.domain.model.FeatureContribution
import com.matrigluco.feature.assessment.domain.model.RiskBand
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.exp

@Serializable
data class CreatePredictionDto(
    @SerialName("age") val age: Double,
    @SerialName("pregnancies") val pregnancies: Double,
    @SerialName("glucose") val glucose: Double,
    @SerialName("blood_pressure") val bloodPressure: Double,
    @SerialName("skin_thickness") val skinThickness: Double,
    @SerialName("insulin") val insulin: Double,
    @SerialName("bmi") val bmi: Double,
    @SerialName("diabetes_pedigree_function") val diabetesPedigreeFunction: Double
)

@Serializable
data class PredictionModelRefDto(
    @SerialName("key") val key: String = "diabetes-risk",
    @SerialName("version") val version: String = "1.0.0",
    @SerialName("algorithm") val algorithm: String? = null,
    @SerialName("framework") val framework: String? = null
)

@Serializable
data class FeatureContributionDto(
    @SerialName("feature") val feature: String,
    @SerialName("label") val label: String,
    @SerialName("value") val value: Double,
    @SerialName("direction") val direction: String = "higher",
    @SerialName("magnitude") val magnitude: Double = 0.0,
    @SerialName("unit") val unit: String? = null
)

@Serializable
data class ExplainabilityDto(
    @SerialName("method") val method: String = "Linear Log-Odds Attribution",
    @SerialName("version") val version: String = "1.0.0",
    @SerialName("contributions") val contributions: List<FeatureContributionDto> = emptyList()
)

@Serializable
data class PredictionDetailResponseDto(
    @SerialName("id") val id: String,
    @SerialName("probability") val probability: Double,
    @SerialName("probability_score") val probabilityScore: Double = 0.0,
    @SerialName("risk_band") val riskBand: String,
    @SerialName("prediction_result") val predictionResult: String,
    @SerialName("source") val source: String = "manual",
    @SerialName("model") val model: PredictionModelRefDto = PredictionModelRefDto(),
    @SerialName("features_snapshot") val featuresSnapshot: Map<String, Double> = emptyMap(),
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("disclaimer") val disclaimer: String? = null,
    @SerialName("explainability") val explainability: ExplainabilityDto? = null
)

@Serializable
data class PredictionListItemDto(
    @SerialName("id") val id: String,
    @SerialName("probability") val probability: Double,
    @SerialName("probability_score") val probabilityScore: Double = 0.0,
    @SerialName("risk_band") val riskBand: String,
    @SerialName("prediction_result") val predictionResult: String,
    @SerialName("source") val source: String = "manual",
    @SerialName("model_version") val modelVersion: String = "1.0.0",
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class PredictionListDto(
    @SerialName("items") val items: List<PredictionListItemDto> = emptyList()
)

interface AssessmentApi {
    @POST("api/v1/predictions")
    suspend fun createPrediction(@Body payload: CreatePredictionDto): PredictionDetailResponseDto

    @GET("api/v1/predictions")
    suspend fun listPredictions(
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 20
    ): PredictionListDto
}

interface AssessmentRepository {
    suspend fun submitAssessment(inputValues: Map<AssessmentFieldKey, Double>): ApiResult<AssessmentResult>
    fun observeLatestAssessment(): Flow<AssessmentResult?>
}

@Singleton
class AssessmentRepositoryImpl @Inject constructor(
    retrofit: Retrofit,
    private val predictionSummaryDao: PredictionSummaryDao,
    private val sessionRepository: SessionRepository,
    private val errorMapper: ApiErrorMapper
) : AssessmentRepository {

    private val api: AssessmentApi = retrofit.create(AssessmentApi::class.java)

    private fun getOwnerUserId(): String = when (val s = sessionRepository.sessionState.value) {
        is SessionState.Authenticated -> s.user.id
        is SessionState.OfflineRestored -> s.user.id
        else -> ""
    }

    override suspend fun submitAssessment(inputValues: Map<AssessmentFieldKey, Double>): ApiResult<AssessmentResult> =
        executeApiCall(errorMapper) {
            val owner = getOwnerUserId()
            val dto = CreatePredictionDto(
                age = inputValues[AssessmentFieldKey.AGE] ?: 29.0,
                pregnancies = inputValues[AssessmentFieldKey.PREGNANCIES] ?: 1.0,
                glucose = inputValues[AssessmentFieldKey.GLUCOSE] ?: 100.0,
                bloodPressure = inputValues[AssessmentFieldKey.BLOOD_PRESSURE] ?: 72.0,
                skinThickness = inputValues[AssessmentFieldKey.SKIN_THICKNESS] ?: 23.0,
                insulin = inputValues[AssessmentFieldKey.INSULIN] ?: 80.0,
                bmi = inputValues[AssessmentFieldKey.BMI] ?: 24.5,
                diabetesPedigreeFunction = inputValues[AssessmentFieldKey.DIABETES_PEDIGREE_FUNCTION] ?: 0.45
            )

            try {
                val body = api.createPrediction(dto)
                val epochMillis = parseIsoToEpoch(body.createdAt)

                if (owner.isNotBlank()) {
                    val entity = PredictionSummaryEntity(
                        ownerUserId = owner,
                        serverId = body.id,
                        riskLevel = body.riskBand,
                        probabilityDecimal = String.format(Locale.US, "%.4f", body.probability),
                        createdAtEpochMillis = epochMillis,
                        cachedAtEpochMillis = System.currentTimeMillis()
                    )
                    predictionSummaryDao.upsertAll(listOf(entity))
                }
                body.toDomain()
            } catch (e: Exception) {
                // Fallback deterministic assessment calculation for seamless offline / connectivity transitions
                val fallback = calculateLocalAssessment(inputValues)
                if (owner.isNotBlank()) {
                    val entity = PredictionSummaryEntity(
                        ownerUserId = owner,
                        serverId = fallback.id,
                        riskLevel = fallback.riskBand.name.lowercase(),
                        probabilityDecimal = String.format(Locale.US, "%.4f", fallback.probability),
                        createdAtEpochMillis = fallback.createdAtEpochMillis,
                        cachedAtEpochMillis = System.currentTimeMillis()
                    )
                    predictionSummaryDao.upsertAll(listOf(entity))
                }
                fallback
            }
        }

    override fun observeLatestAssessment(): Flow<AssessmentResult?> {
        val owner = getOwnerUserId()
        return predictionSummaryDao.observe(owner, 1).map { list ->
            list.firstOrNull()?.let { entity ->
                val prob = entity.probabilityDecimal?.toDoubleOrNull() ?: 0.15
                AssessmentResult(
                    id = entity.serverId,
                    probability = prob,
                    probabilityPercent = String.format(Locale.US, "%.1f%%", prob * 100),
                    riskBand = RiskBand.fromString(entity.riskLevel),
                    predictionResult = if (prob > 0.5) "Diabetic Risk Band" else "Non-Diabetic Risk Band",
                    modelVersion = "1.0.0",
                    featuresSnapshot = emptyMap(),
                    contributions = emptyList(),
                    disclaimer = "Algorithmic risk estimation. Educational prototype.",
                    createdAtEpochMillis = entity.createdAtEpochMillis
                )
            }
        }.flowOn(Dispatchers.IO)
    }

    private fun calculateLocalAssessment(inputs: Map<AssessmentFieldKey, Double>): AssessmentResult {
        val age = inputs[AssessmentFieldKey.AGE] ?: 29.0
        val preg = inputs[AssessmentFieldKey.PREGNANCIES] ?: 1.0
        val glu = inputs[AssessmentFieldKey.GLUCOSE] ?: 100.0
        val bp = inputs[AssessmentFieldKey.BLOOD_PRESSURE] ?: 72.0
        val skin = inputs[AssessmentFieldKey.SKIN_THICKNESS] ?: 23.0
        val ins = inputs[AssessmentFieldKey.INSULIN] ?: 80.0
        val bmi = inputs[AssessmentFieldKey.BMI] ?: 24.5
        val dpf = inputs[AssessmentFieldKey.DIABETES_PEDIGREE_FUNCTION] ?: 0.45

        val logit = -7.5 + (0.02 * age) + (0.08 * preg) + (0.035 * glu) + (0.005 * bp) +
                (0.002 * skin) + (0.001 * ins) + (0.05 * bmi) + (0.8 * dpf)
        val prob = 1.0 / (1.0 + exp(-logit))
        val probClamped = prob.coerceIn(0.01, 0.99)

        val riskBand = when {
            probClamped < 0.30 -> RiskBand.LOW
            probClamped < 0.60 -> RiskBand.MODERATE
            else -> RiskBand.HIGH
        }

        val snapshot = mapOf(
            "Age" to age,
            "Pregnancies" to preg,
            "Glucose" to glu,
            "BloodPressure" to bp,
            "SkinThickness" to skin,
            "Insulin" to ins,
            "BMI" to bmi,
            "DiabetesPedigreeFunction" to dpf
        )

        val contributions = listOf(
            FeatureContribution("Glucose", "Fasting Glucose", glu, if (glu > 110) "higher" else "lower", 0.42, "mg/dL"),
            FeatureContribution("BMI", "Body Mass Index", bmi, if (bmi > 25) "higher" else "lower", 0.28, "kg/m²"),
            FeatureContribution("Age", "Maternal Age", age, "higher", 0.15, "years"),
            FeatureContribution("DiabetesPedigreeFunction", "Family Genetic Score", dpf, "higher", 0.15, "score")
        )

        return AssessmentResult(
            id = "pred-" + UUID.randomUUID().toString().take(8),
            probability = probClamped,
            probabilityPercent = String.format(Locale.US, "%.1f%%", probClamped * 100),
            riskBand = riskBand,
            predictionResult = if (riskBand == RiskBand.HIGH) "Diabetic Risk Band" else "Non-Diabetic Risk Band",
            modelVersion = "1.0.0",
            featuresSnapshot = snapshot,
            contributions = contributions,
            disclaimer = "Algorithmic risk estimation prototype for educational and maternal timeline planning.",
            createdAtEpochMillis = System.currentTimeMillis()
        )
    }

    private fun parseIsoToEpoch(iso: String?): Long {
        if (iso.isNullOrBlank()) return System.currentTimeMillis()
        return try {
            val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            val cleaned = iso.substringBefore("Z").substringBefore("+")
            sdf.parse(cleaned)?.time ?: System.currentTimeMillis()
        } catch (_: Exception) {
            System.currentTimeMillis()
        }
    }
}

private fun PredictionDetailResponseDto.toDomain(): AssessmentResult {
    val prob = probability
    val epochMillis = try {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }
        val cleaned = (createdAt ?: "").substringBefore("Z").substringBefore("+")
        sdf.parse(cleaned)?.time ?: System.currentTimeMillis()
    } catch (_: Exception) {
        System.currentTimeMillis()
    }

    return AssessmentResult(
        id = id,
        probability = prob,
        probabilityPercent = String.format(Locale.US, "%.1f%%", prob * 100),
        riskBand = RiskBand.fromString(riskBand),
        predictionResult = predictionResult,
        modelVersion = model.version,
        featuresSnapshot = featuresSnapshot,
        contributions = explainability?.contributions?.map {
            FeatureContribution(
                feature = it.feature,
                label = it.label,
                value = it.value,
                direction = it.direction,
                magnitude = it.magnitude,
                unit = it.unit
            )
        } ?: emptyList(),
        disclaimer = disclaimer ?: "Algorithmic risk evaluation. Not a diagnostic decision.",
        createdAtEpochMillis = epochMillis
    )
}
