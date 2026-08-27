package com.matrigluco.core.designsystem.accessibility

object MetricSemanticDescription {
    fun build(label: CharSequence, value: CharSequence, unit: CharSequence, timestamp: CharSequence, status: CharSequence? = null): String =
        listOfNotNull(label, value, unit, timestamp, status?.takeIf { it.isNotBlank() }).joinToString(", ")
}
