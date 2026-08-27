package com.matrigluco.feature.tracking.domain.model

enum class TrackingPeriod(val label: String, val days: Int) {
    SEVEN_DAYS("7D", 7),
    THIRTY_DAYS("30D", 30),
    NINETY_DAYS("90D", 90),
    CUSTOM("Custom Date", -1),
}

enum class TrackingViewMode {
    CHART,
    RECORDS,
}

enum class DeltaDirection {
    HIGHER,
    LOWER,
    UNCHANGED,
}

data class HealthReading(
    val id: String,
    val metricType: String,
    val valuePrimary: Double,
    val valueSecondary: Double? = null,
    val unit: String,
    val measuredAt: String,
    val measuredAtEpochMillis: Long,
    val notes: String? = null,
    val source: String = "manual",
    val isSyncPending: Boolean = false,
) {
    val formattedValue: String
        get() = if (valueSecondary != null) {
            val s = if (valuePrimary % 1.0 == 0.0) valuePrimary.toInt().toString() else "%.1f".format(java.util.Locale.US, valuePrimary)
            val d = if (valueSecondary % 1.0 == 0.0) valueSecondary.toInt().toString() else "%.1f".format(java.util.Locale.US, valueSecondary)
            "$s/$d"
        } else {
            if (valuePrimary % 1.0 == 0.0) valuePrimary.toInt().toString() else "%.1f".format(java.util.Locale.US, valuePrimary)
        }
}

data class TrackingSummary(
    val average: Double?,
    val lowest: Double?,
    val highest: Double?,
    val delta: Double?,
    val deltaDirection: DeltaDirection,
    val readingsCount: Int,
    val metric: MetricDefinition,
    val period: TrackingPeriod,
)

data class TrackingFilter(
    val metric: MetricDefinition = MetricDefinition.forType(MetricType.GLUCOSE),
    val period: TrackingPeriod = TrackingPeriod.THIRTY_DAYS,
    val customDateStartEpochMillis: Long? = null,
    val customDateEndEpochMillis: Long? = null,
    val viewMode: TrackingViewMode = TrackingViewMode.CHART,
)
