package com.matrigluco.core.designsystem.component

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import com.matrigluco.core.designsystem.R
import com.matrigluco.core.designsystem.accessibility.MetricSemanticDescription

class OrbitMetricSurface @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) : LinearLayout(context, attrs) {
    private val label: TextView; private val value: TextView; private val unit: TextView; private val timestamp: TextView; private val status: TextView
    init { orientation = VERTICAL; background = context.getDrawable(R.drawable.orbit_surface_outline); descendantFocusability = FOCUS_BLOCK_DESCENDANTS; isFocusable = true; importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_YES; val p = resources.getDimensionPixelSize(R.dimen.orbit_space_20); setPadding(p,p,p,p); LayoutInflater.from(context).inflate(R.layout.view_orbit_metric_surface, this, true); label=findViewById(R.id.orbit_metric_label); value=findViewById(R.id.orbit_metric_value); unit=findViewById(R.id.orbit_metric_unit); timestamp=findViewById(R.id.orbit_metric_timestamp); status=findViewById(R.id.orbit_metric_status) }
    fun bind(metricLabel: CharSequence, exactValue: CharSequence, metricUnit: CharSequence, measuredAt: CharSequence, suppliedStatus: CharSequence? = null) { label.text=metricLabel; value.text=exactValue; unit.text=metricUnit; timestamp.text=measuredAt; status.text=suppliedStatus; status.visibility=if(suppliedStatus.isNullOrBlank()) View.GONE else View.VISIBLE; contentDescription=MetricSemanticDescription.build(metricLabel, exactValue, metricUnit, measuredAt, suppliedStatus) }
}
