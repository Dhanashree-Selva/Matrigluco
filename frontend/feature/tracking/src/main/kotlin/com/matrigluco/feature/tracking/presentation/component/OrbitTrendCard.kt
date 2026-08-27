package com.matrigluco.feature.tracking.presentation.component

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.google.android.material.card.MaterialCardView
import com.matrigluco.core.designsystem.R
import com.matrigluco.feature.tracking.domain.model.DeltaDirection
import com.matrigluco.feature.tracking.domain.model.MetricDefinition
import com.matrigluco.feature.tracking.domain.model.TrackingSummary
import com.matrigluco.feature.tracking.presentation.ChartPoint
import java.util.Locale

class OrbitTrendCard @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : MaterialCardView(context, attrs, defStyleAttr) {

    private val trendTitle: TextView
    private val trendSubtitle: TextView
    private val trendDeltaValue: TextView
    private val trendDeltaDirection: TextView
    private val trackingChartView: OrbitTrackingChartView

    init {
        radius = resources.getDimension(R.dimen.orbit_radius_lg)
        cardElevation = 0f
        strokeWidth = resources.getDimensionPixelSize(R.dimen.orbit_divider)
        setStrokeColor(ContextCompat.getColorStateList(context, R.color.care_border))
        setCardBackgroundColor(ContextCompat.getColor(context, R.color.care_surface))

        LayoutInflater.from(context).inflate(
            com.matrigluco.feature.tracking.R.layout.view_orbit_trend_card,
            this,
            true
        )

        trendTitle = findViewById(com.matrigluco.feature.tracking.R.id.trendTitle)
        trendSubtitle = findViewById(com.matrigluco.feature.tracking.R.id.trendSubtitle)
        trendDeltaValue = findViewById(com.matrigluco.feature.tracking.R.id.trendDeltaValue)
        trendDeltaDirection = findViewById(com.matrigluco.feature.tracking.R.id.trendDeltaDirection)
        trackingChartView = findViewById(com.matrigluco.feature.tracking.R.id.trackingChartView)
    }

    fun bind(
        metric: MetricDefinition,
        summary: TrackingSummary,
        points: List<ChartPoint>
    ) {
        trendTitle.text = "${metric.displayName} over time"
        trendSubtitle.text = "${summary.readingsCount} readings over the selected period"

        if (summary.delta != null) {
            val deltaStr = if (summary.delta % 1.0 == 0.0) summary.delta.toInt().toString() else "%.0f".format(Locale.US, summary.delta)
            val arrow = when (summary.deltaDirection) {
                DeltaDirection.HIGHER -> "↑ "
                DeltaDirection.LOWER -> "↓ "
                DeltaDirection.UNCHANGED -> ""
            }
            val dirText = when (summary.deltaDirection) {
                DeltaDirection.HIGHER -> "(higher)"
                DeltaDirection.LOWER -> "(lower)"
                DeltaDirection.UNCHANGED -> "(unchanged)"
            }
            trendDeltaValue.text = "$arrow$deltaStr ${metric.unit}"
            trendDeltaDirection.text = dirText
        } else {
            trendDeltaValue.text = "--"
            trendDeltaDirection.text = ""
        }

        trackingChartView.setChartData(points, metric.unit)
    }
}
