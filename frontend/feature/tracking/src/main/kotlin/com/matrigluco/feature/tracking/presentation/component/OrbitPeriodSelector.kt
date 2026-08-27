package com.matrigluco.feature.tracking.presentation.component

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.matrigluco.core.designsystem.R
import com.matrigluco.feature.tracking.domain.model.TrackingPeriod
import com.matrigluco.feature.tracking.domain.model.TrackingViewMode

class OrbitPeriodSelector @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    private val btn7D: TextView
    private val btn30D: TextView
    private val btn90D: TextView
    private val btnCustom: LinearLayout
    private val customCalendarIcon: ImageView
    private val customDateText: TextView

    private val btnModeChart: FrameLayout
    private val btnModeRecords: FrameLayout
    private val chartIcon: ImageView
    private val recordsIcon: ImageView

    private var onPeriodSelected: ((TrackingPeriod) -> Unit)? = null
    private var onCustomDateClicked: (() -> Unit)? = null
    private var onViewModeSelected: ((TrackingViewMode) -> Unit)? = null

    private var currentPeriod = TrackingPeriod.THIRTY_DAYS
    private var currentMode = TrackingViewMode.CHART

    init {
        orientation = HORIZONTAL
        LayoutInflater.from(context).inflate(
            com.matrigluco.feature.tracking.R.layout.view_orbit_period_selector,
            this,
            true
        )

        btn7D = findViewById(com.matrigluco.feature.tracking.R.id.btnPeriod7D)
        btn30D = findViewById(com.matrigluco.feature.tracking.R.id.btnPeriod30D)
        btn90D = findViewById(com.matrigluco.feature.tracking.R.id.btnPeriod90D)
        btnCustom = findViewById(com.matrigluco.feature.tracking.R.id.btnPeriodCustom)
        customCalendarIcon = findViewById(com.matrigluco.feature.tracking.R.id.customCalendarIcon)
        customDateText = findViewById(com.matrigluco.feature.tracking.R.id.customDateText)

        btnModeChart = findViewById(com.matrigluco.feature.tracking.R.id.btnModeChart)
        btnModeRecords = findViewById(com.matrigluco.feature.tracking.R.id.btnModeRecords)
        chartIcon = findViewById(com.matrigluco.feature.tracking.R.id.chartIcon)
        recordsIcon = findViewById(com.matrigluco.feature.tracking.R.id.recordsIcon)

        btn7D.setOnClickListener {
            selectPeriod(TrackingPeriod.SEVEN_DAYS)
            onPeriodSelected?.invoke(TrackingPeriod.SEVEN_DAYS)
        }
        btn30D.setOnClickListener {
            selectPeriod(TrackingPeriod.THIRTY_DAYS)
            onPeriodSelected?.invoke(TrackingPeriod.THIRTY_DAYS)
        }
        btn90D.setOnClickListener {
            selectPeriod(TrackingPeriod.NINETY_DAYS)
            onPeriodSelected?.invoke(TrackingPeriod.NINETY_DAYS)
        }
        btnCustom.setOnClickListener {
            selectPeriod(TrackingPeriod.CUSTOM)
            onPeriodSelected?.invoke(TrackingPeriod.CUSTOM)
            onCustomDateClicked?.invoke()
        }

        btnModeChart.setOnClickListener {
            selectViewMode(TrackingViewMode.CHART)
            onViewModeSelected?.invoke(TrackingViewMode.CHART)
        }
        btnModeRecords.setOnClickListener {
            selectViewMode(TrackingViewMode.RECORDS)
            onViewModeSelected?.invoke(TrackingViewMode.RECORDS)
        }

        render()
    }

    fun setPeriod(period: TrackingPeriod, customRangeLabel: String? = null) {
        currentPeriod = period
        if (customRangeLabel != null && period == TrackingPeriod.CUSTOM) {
            customDateText.text = customRangeLabel
        } else {
            customDateText.text = "Custom"
        }
        render()
    }

    fun setViewMode(mode: TrackingViewMode) {
        currentMode = mode
        render()
    }

    fun setOnPeriodSelectedListener(listener: (TrackingPeriod) -> Unit) {
        onPeriodSelected = listener
    }

    fun setOnCustomDateClickListener(listener: () -> Unit) {
        onCustomDateClicked = listener
    }

    fun setOnViewModeSelectedListener(listener: (TrackingViewMode) -> Unit) {
        onViewModeSelected = listener
    }

    private fun selectPeriod(period: TrackingPeriod) {
        currentPeriod = period
        render()
    }

    private fun selectViewMode(mode: TrackingViewMode) {
        currentMode = mode
        render()
    }

    private fun render() {
        val pinkColor = ContextCompat.getColor(context, R.color.care_pink)
        val onAccentColor = ContextCompat.getColor(context, R.color.care_on_accent)
        val inkColor = ContextCompat.getColor(context, R.color.care_ink)
        val mutedColor = ContextCompat.getColor(context, R.color.care_text_muted)
        val softSurface = ContextCompat.getColor(context, R.color.care_surface)
        val elevatedSurface = ContextCompat.getColor(context, R.color.care_surface_elevated)

        // 7D
        val is7D = currentPeriod == TrackingPeriod.SEVEN_DAYS
        btn7D.setBackgroundResource(if (is7D) R.drawable.orbit_soft_surface else 0)
        btn7D.backgroundTintList = if (is7D) ContextCompat.getColorStateList(context, R.color.care_pink) else null
        btn7D.setTextColor(if (is7D) onAccentColor else inkColor)

        // 30D
        val is30D = currentPeriod == TrackingPeriod.THIRTY_DAYS
        btn30D.setBackgroundResource(if (is30D) R.drawable.orbit_soft_surface else 0)
        btn30D.backgroundTintList = if (is30D) ContextCompat.getColorStateList(context, R.color.care_pink) else null
        btn30D.setTextColor(if (is30D) onAccentColor else inkColor)

        // 90D
        val is90D = currentPeriod == TrackingPeriod.NINETY_DAYS
        btn90D.setBackgroundResource(if (is90D) R.drawable.orbit_soft_surface else 0)
        btn90D.backgroundTintList = if (is90D) ContextCompat.getColorStateList(context, R.color.care_pink) else null
        btn90D.setTextColor(if (is90D) onAccentColor else inkColor)

        // Custom
        val isCustom = currentPeriod == TrackingPeriod.CUSTOM
        btnCustom.setBackgroundResource(if (isCustom) R.drawable.orbit_soft_surface else 0)
        btnCustom.backgroundTintList = if (isCustom) ContextCompat.getColorStateList(context, R.color.care_pink) else null
        customDateText.setTextColor(if (isCustom) onAccentColor else inkColor)
        customCalendarIcon.imageTintList = ContextCompat.getColorStateList(context, if (isCustom) R.color.care_on_accent else R.color.care_ink)

        // View Mode: Chart vs Records
        val isChart = currentMode == TrackingViewMode.CHART
        btnModeChart.setBackgroundResource(if (isChart) R.drawable.orbit_soft_surface else 0)
        btnModeChart.backgroundTintList = if (isChart) ContextCompat.getColorStateList(context, R.color.care_surface_elevated) else null
        chartIcon.imageTintList = ContextCompat.getColorStateList(context, if (isChart) R.color.care_pink else R.color.care_text_muted)

        btnModeRecords.setBackgroundResource(if (!isChart) R.drawable.orbit_soft_surface else 0)
        btnModeRecords.backgroundTintList = if (!isChart) ContextCompat.getColorStateList(context, R.color.care_surface_elevated) else null
        recordsIcon.imageTintList = ContextCompat.getColorStateList(context, if (!isChart) R.color.care_pink else R.color.care_text_muted)
    }
}
