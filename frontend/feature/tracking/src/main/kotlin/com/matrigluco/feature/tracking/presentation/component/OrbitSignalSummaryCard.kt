package com.matrigluco.feature.tracking.presentation.component

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.google.android.material.card.MaterialCardView
import com.matrigluco.core.designsystem.R
import com.matrigluco.feature.tracking.domain.model.DeltaDirection
import com.matrigluco.feature.tracking.domain.model.TrackingSummary
import java.util.Locale

class OrbitSignalSummaryCard @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : MaterialCardView(context, attrs, defStyleAttr) {

    private val summaryAvgValue: TextView
    private val summaryAvgUnit: TextView
    private val summaryLowValue: TextView
    private val summaryLowUnit: TextView
    private val summaryHighValue: TextView
    private val summaryHighUnit: TextView
    private val summaryDeltaValue: TextView
    private val summaryDeltaLabel: TextView
    private val summaryCountFooter: TextView

    init {
        radius = resources.getDimension(R.dimen.orbit_radius_lg)
        cardElevation = 0f
        strokeWidth = resources.getDimensionPixelSize(R.dimen.orbit_divider)
        setStrokeColor(ContextCompat.getColorStateList(context, R.color.care_border))
        setCardBackgroundColor(ContextCompat.getColor(context, R.color.care_surface))

        LayoutInflater.from(context).inflate(
            com.matrigluco.feature.tracking.R.layout.view_orbit_signal_summary_card,
            this,
            true
        )

        summaryAvgValue = findViewById(com.matrigluco.feature.tracking.R.id.summaryAvgValue)
        summaryAvgUnit = findViewById(com.matrigluco.feature.tracking.R.id.summaryAvgUnit)
        summaryLowValue = findViewById(com.matrigluco.feature.tracking.R.id.summaryLowValue)
        summaryLowUnit = findViewById(com.matrigluco.feature.tracking.R.id.summaryLowUnit)
        summaryHighValue = findViewById(com.matrigluco.feature.tracking.R.id.summaryHighValue)
        summaryHighUnit = findViewById(com.matrigluco.feature.tracking.R.id.summaryHighUnit)
        summaryDeltaValue = findViewById(com.matrigluco.feature.tracking.R.id.summaryDeltaValue)
        summaryDeltaLabel = findViewById(com.matrigluco.feature.tracking.R.id.summaryDeltaLabel)
        summaryCountFooter = findViewById(com.matrigluco.feature.tracking.R.id.summaryCountFooter)
    }

    fun bind(summary: TrackingSummary) {
        val unit = summary.metric.unit

        summaryAvgUnit.text = unit
        summaryLowUnit.text = unit
        summaryHighUnit.text = unit

        if (summary.average != null) {
            val avgStr = if (summary.average % 1.0 == 0.0) summary.average.toInt().toString() else "%.0f".format(Locale.US, summary.average)
            summaryAvgValue.text = avgStr
        } else {
            summaryAvgValue.text = "--"
        }

        if (summary.lowest != null) {
            val lowStr = if (summary.lowest % 1.0 == 0.0) summary.lowest.toInt().toString() else "%.0f".format(Locale.US, summary.lowest)
            summaryLowValue.text = lowStr
        } else {
            summaryLowValue.text = "--"
        }

        if (summary.highest != null) {
            val highStr = if (summary.highest % 1.0 == 0.0) summary.highest.toInt().toString() else "%.0f".format(Locale.US, summary.highest)
            summaryHighValue.text = highStr
        } else {
            summaryHighValue.text = "--"
        }

        if (summary.delta != null) {
            val deltaStr = if (summary.delta % 1.0 == 0.0) summary.delta.toInt().toString() else "%.0f".format(Locale.US, summary.delta)
            val prefix = when (summary.deltaDirection) {
                DeltaDirection.HIGHER -> "+"
                DeltaDirection.LOWER -> "-"
                DeltaDirection.UNCHANGED -> ""
            }
            summaryDeltaValue.text = "$prefix$deltaStr"
            summaryDeltaLabel.text = "$unit (change)"
        } else {
            summaryDeltaValue.text = "--"
            summaryDeltaLabel.text = unit
        }

        summaryCountFooter.text = "${summary.readingsCount} readings in selected period"

        // Accessibility announcement
        val avgRead = summaryAvgValue.text
        val lowRead = summaryLowValue.text
        val highRead = summaryHighValue.text
        val deltaRead = summaryDeltaValue.text
        contentDescription = "Signal summary. Average: $avgRead $unit. Lowest: $lowRead $unit. Highest: $highRead $unit. Change: $deltaRead $unit. ${summary.readingsCount} readings in selected period."
    }
}
