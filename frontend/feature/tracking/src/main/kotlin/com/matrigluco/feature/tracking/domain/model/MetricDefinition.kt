package com.matrigluco.feature.tracking.domain.model

import androidx.annotation.DrawableRes
import com.matrigluco.core.designsystem.R

enum class MetricType(val rawValue: String) {
    GLUCOSE("glucose"),
    BLOOD_PRESSURE("blood_pressure"),
    WEIGHT("weight"),
    BMI("bmi"),
    HBA1C("hba1c");

    companion object {
        fun fromRaw(raw: String): MetricType = entries.firstOrNull { it.rawValue.equals(raw.trim(), ignoreCase = true) } ?: GLUCOSE
    }
}

data class MetricDefinition(
    val type: MetricType,
    val displayName: String,
    val shortName: String,
    val unit: String,
    val description: String,
    @DrawableRes val iconRes: Int,
    val isDualValue: Boolean = false,
) {
    companion object {
        val ALL = listOf(
            MetricDefinition(
                type = MetricType.GLUCOSE,
                displayName = "Fasting / Plasma Glucose",
                shortName = "Glucose",
                unit = "mg/dL",
                description = "Fasting and postprandial glucose levels",
                iconRes = R.drawable.ic_huge_droplet_24,
                isDualValue = false,
            ),
            MetricDefinition(
                type = MetricType.BLOOD_PRESSURE,
                displayName = "Blood Pressure",
                shortName = "BP",
                unit = "mmHg",
                description = "Systolic and diastolic arterial vitals",
                iconRes = R.drawable.ic_huge_heart_rate_24,
                isDualValue = true,
            ),
            MetricDefinition(
                type = MetricType.WEIGHT,
                displayName = "Maternal Weight",
                shortName = "Weight",
                unit = "kg",
                description = "Gestational weight progress tracking",
                iconRes = R.drawable.ic_huge_scale_24,
                isDualValue = false,
            ),
            MetricDefinition(
                type = MetricType.BMI,
                displayName = "Body Mass Index",
                shortName = "BMI",
                unit = "kg/m²",
                description = "Maternal body mass index",
                iconRes = R.drawable.ic_huge_scale_24,
                isDualValue = false,
            ),
            MetricDefinition(
                type = MetricType.HBA1C,
                displayName = "Glycated Hemoglobin",
                shortName = "HbA1c",
                unit = "%",
                description = "Longitudinal 3-month glycemic indicator",
                iconRes = R.drawable.ic_huge_droplet_24,
                isDualValue = false,
            ),
        )

        fun forType(type: MetricType): MetricDefinition = ALL.first { it.type == type }
        fun forRaw(raw: String): MetricDefinition = ALL.firstOrNull { it.type.rawValue.equals(raw.trim(), ignoreCase = true) } ?: ALL.first()
    }
}
