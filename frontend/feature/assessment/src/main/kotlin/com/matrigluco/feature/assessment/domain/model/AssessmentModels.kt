package com.matrigluco.feature.assessment.domain.model

enum class AssessmentFieldKey(
    val modelKey: String,
    val displayName: String,
    val unit: String,
    val min: Double,
    val max: Double,
    val isDecimal: Boolean,
    val stepIndex: Int,
    val placeholder: String,
    val rationale: String,
    val detailedExplanation: String,
    val clinicalNote: String
) {
    AGE(
        modelKey = "Age",
        displayName = "Maternal Age",
        unit = "years",
        min = 15.0,
        max = 110.0,
        isDecimal = false,
        stepIndex = 0,
        placeholder = "e.g. 29",
        rationale = "Age influences baseline metabolic rate and insulin resistance during gestation.",
        detailedExplanation = "Maternal age is an essential epidemiological factor in gestational diabetes risk profiling. The calibrated model accepts age values between 15 and 110 years.",
        clinicalNote = "Accepted model range: 15–110 years."
    ),
    PREGNANCIES(
        modelKey = "Pregnancies",
        displayName = "Total Prior / Current Pregnancies",
        unit = "count",
        min = 0.0,
        max = 25.0,
        isDecimal = false,
        stepIndex = 0,
        placeholder = "e.g. 1",
        rationale = "Parity and gravidity history are correlated with cumulative gestational endocrine load.",
        detailedExplanation = "Total number of times pregnant, including prior deliveries and the current pregnancy. Enter 0 if this is your first pregnancy.",
        clinicalNote = "Accepted model range: 0–25."
    ),
    GLUCOSE(
        modelKey = "Glucose",
        displayName = "Fasting / Plasma Glucose",
        unit = "mg/dL",
        min = 40.0,
        max = 500.0,
        isDecimal = true,
        stepIndex = 1,
        placeholder = "e.g. 102",
        rationale = "Primary circulating blood glucose concentration following overnight fasting.",
        detailedExplanation = "Plasma glucose level measured in milligrams per deciliter (mg/dL). This is one of the strongest predictive features in glycemic risk estimation models.",
        clinicalNote = "Accepted model range: 40–500 mg/dL."
    ),
    BLOOD_PRESSURE(
        modelKey = "BloodPressure",
        displayName = "Diastolic Blood Pressure",
        unit = "mmHg",
        min = 40.0,
        max = 250.0,
        isDecimal = true,
        stepIndex = 1,
        placeholder = "e.g. 72",
        rationale = "The resting diastolic pressure (the bottom number in a 120/80 reading).",
        detailedExplanation = "The clinical prediction model specifically uses Diastolic Blood Pressure in millimeters of mercury (mmHg). If your blood pressure reading was 120/80 mmHg, enter the diastolic number: 80.",
        clinicalNote = "Diastolic component only. Accepted model range: 40–250 mmHg."
    ),
    SKIN_THICKNESS(
        modelKey = "SkinThickness",
        displayName = "Triceps Skinfold Thickness",
        unit = "mm",
        min = 5.0,
        max = 120.0,
        isDecimal = true,
        stepIndex = 2,
        placeholder = "e.g. 23",
        rationale = "Measurement of subcutaneous adipose tissue thickness on the triceps.",
        detailedExplanation = "Triceps skinfold thickness measured in millimeters (mm) provides an estimate of subcutaneous body fat distribution.",
        clinicalNote = "Accepted model range: 5–120 mm."
    ),
    INSULIN(
        modelKey = "Insulin",
        displayName = "2-Hour Serum Insulin",
        unit = "µU/mL",
        min = 1.0,
        max = 1000.0,
        isDecimal = true,
        stepIndex = 2,
        placeholder = "e.g. 85",
        rationale = "Serum insulin measured 2 hours following oral glucose tolerance administration.",
        detailedExplanation = "Serum insulin concentration measured in micro-units per milliliter (µU/mL) following a standardized 2-hour postprandial or OGTT challenge.",
        clinicalNote = "Accepted model range: 1–1000 µU/mL."
    ),
    BMI(
        modelKey = "BMI",
        displayName = "Body Mass Index (BMI)",
        unit = "kg/m²",
        min = 10.0,
        max = 80.0,
        isDecimal = true,
        stepIndex = 2,
        placeholder = "e.g. 24.3",
        rationale = "Body weight relative to square of height (kg/m²), reflecting general adiposity.",
        detailedExplanation = "Body Mass Index in kilograms per square meter (kg/m²). It represents relative weight adjusted for maternal height.",
        clinicalNote = "Accepted model range: 10.0–80.0 kg/m²."
    ),
    DIABETES_PEDIGREE_FUNCTION(
        modelKey = "DiabetesPedigreeFunction",
        displayName = "Diabetes Pedigree Function",
        unit = "score",
        min = 0.05,
        max = 3.0,
        isDecimal = true,
        stepIndex = 3,
        placeholder = "e.g. 0.45",
        rationale = "Genetic scoring function accounting for diabetes history among immediate and extended biological relatives.",
        detailedExplanation = "A mathematically calibrated score quantifying hereditary genetic risk based on diabetes prevalence in family lineage. Typical scores range from 0.08 to 2.42.",
        clinicalNote = "Accepted model range: 0.05–3.00."
    );

    companion object {
        fun forModelKey(key: String): AssessmentFieldKey? =
            entries.firstOrNull { it.modelKey.equals(key, ignoreCase = true) }
    }
}

data class AssessmentStepDef(
    val stepNumber: Int,
    val eyebrow: String,
    val title: String,
    val description: String,
    val fieldKeys: List<AssessmentFieldKey>
)

object AssessmentStepConfig {
    val STEPS = listOf(
        AssessmentStepDef(
            stepNumber = 1,
            eyebrow = "STAGE 01 / PERSONAL CONTEXT",
            title = "Maternal Demographic Baseline",
            description = "Enter your current age and total number of pregnancies to establish baseline physiological calibration.",
            fieldKeys = listOf(AssessmentFieldKey.AGE, AssessmentFieldKey.PREGNANCIES)
        ),
        AssessmentStepDef(
            stepNumber = 2,
            eyebrow = "STAGE 02 / CLINICAL SIGNALS",
            title = "Primary Metabolic Signals",
            description = "Enter your most recent fasting or plasma glucose and resting diastolic blood pressure.",
            fieldKeys = listOf(AssessmentFieldKey.GLUCOSE, AssessmentFieldKey.BLOOD_PRESSURE)
        ),
        AssessmentStepDef(
            stepNumber = 3,
            eyebrow = "STAGE 03 / BODY & METABOLIC",
            title = "Adipose & Insulin Biomarkers",
            description = "Body Mass Index, skinfold thickness, and 2-hour serum insulin indicate insulin sensitivity.",
            fieldKeys = listOf(AssessmentFieldKey.SKIN_THICKNESS, AssessmentFieldKey.INSULIN, AssessmentFieldKey.BMI)
        ),
        AssessmentStepDef(
            stepNumber = 4,
            eyebrow = "STAGE 04 / HISTORY CONTEXT",
            title = "Genetic Pedigree Function",
            description = "A calculated genetic scoring index representing diabetes history across biological relatives.",
            fieldKeys = listOf(AssessmentFieldKey.DIABETES_PEDIGREE_FUNCTION)
        ),
        AssessmentStepDef(
            stepNumber = 5,
            eyebrow = "STAGE 05 / REVIEW LEDGER",
            title = "Model Input Ledger",
            description = "Review all 8 canonical biometric features before executing clinical risk estimation.",
            fieldKeys = emptyList()
        )
    )
}

enum class RiskBand(val displayName: String, val colorHex: String) {
    LOW("Low Risk", "#10B981"),
    MODERATE("Moderate Risk", "#F59E0B"),
    HIGH("Elevated Risk", "#D94F7D");

    companion object {
        fun fromString(value: String): RiskBand = when (value.trim().lowercase()) {
            "low", "low risk", "non-diabetic" -> LOW
            "moderate", "moderate risk", "elevated" -> MODERATE
            "high", "high risk", "diabetic" -> HIGH
            else -> LOW
        }
    }
}

data class FeatureContribution(
    val feature: String,
    val label: String,
    val value: Double,
    val direction: String,
    val magnitude: Double,
    val unit: String?
)

data class AssessmentResult(
    val id: String,
    val probability: Double,
    val probabilityPercent: String,
    val riskBand: RiskBand,
    val predictionResult: String,
    val modelVersion: String,
    val featuresSnapshot: Map<String, Double>,
    val contributions: List<FeatureContribution>,
    val disclaimer: String,
    val createdAtEpochMillis: Long
)

enum class AssessmentViewMode {
    INTRO,
    GUIDED_STEPS,
    RESULT
}
