package com.matrigluco.feature.tracking.presentation.component

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.google.android.material.card.MaterialCardView
import com.matrigluco.core.designsystem.R
import com.matrigluco.feature.tracking.domain.model.HealthReading
import com.matrigluco.feature.tracking.domain.model.MetricDefinition

class OrbitMetricSelectorCard @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : MaterialCardView(context, attrs, defStyleAttr) {

    private val metricIcon: ImageView
    private val metricTitle: TextView
    private val metricUnit: TextView
    private val lastReadingValue: TextView

    init {
        radius = resources.getDimension(R.dimen.orbit_radius_lg)
        cardElevation = 0f
        strokeWidth = resources.getDimensionPixelSize(R.dimen.orbit_divider)
        setStrokeColor(ContextCompat.getColorStateList(context, R.color.care_border))
        setCardBackgroundColor(ContextCompat.getColor(context, R.color.care_surface))
        isClickable = true
        isFocusable = true

        LayoutInflater.from(context).inflate(
            com.matrigluco.feature.tracking.R.layout.view_orbit_metric_selector_card,
            this,
            true
        )

        metricIcon = findViewById(com.matrigluco.feature.tracking.R.id.metricIcon)
        metricTitle = findViewById(com.matrigluco.feature.tracking.R.id.metricTitle)
        metricUnit = findViewById(com.matrigluco.feature.tracking.R.id.metricUnit)
        lastReadingValue = findViewById(com.matrigluco.feature.tracking.R.id.lastReadingValue)
    }

    fun bind(metric: MetricDefinition, latestReading: HealthReading?) {
        metricIcon.setImageResource(metric.iconRes)
        metricTitle.text = metric.displayName
        metricUnit.text = metric.unit

        if (latestReading != null) {
            lastReadingValue.text = "${latestReading.formattedValue} ${latestReading.unit}".trim()
            contentDescription = "${metric.displayName}, unit ${metric.unit}. Last reading: ${latestReading.formattedValue} ${latestReading.unit}. Double tap to change metric."
        } else {
            lastReadingValue.text = "No reading yet"
            contentDescription = "${metric.displayName}, unit ${metric.unit}. No reading yet. Double tap to change metric."
        }
    }
}
