package com.matrigluco.feature.tracking.presentation.sheet

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.RadioGroup
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.matrigluco.core.designsystem.component.OrbitButton
import com.matrigluco.feature.tracking.R
import com.matrigluco.feature.tracking.domain.model.MetricDefinition
import com.matrigluco.feature.tracking.domain.model.MetricType

class TrackingFilterSheet : BottomSheetDialogFragment() {

    private var currentMetricType: MetricType = MetricType.GLUCOSE
    private var onApplyFilter: ((MetricType) -> Unit)? = null
    private var onResetFilter: (() -> Unit)? = null

    fun setCurrentMetric(type: MetricType) {
        currentMetricType = type
    }

    fun setOnApplyFilterListener(listener: (MetricType) -> Unit) {
        onApplyFilter = listener
    }

    fun setOnResetFilterListener(listener: () -> Unit) {
        onResetFilter = listener
    }

    override fun getTheme(): Int = com.matrigluco.core.designsystem.R.style.Orbit_BottomSheetDialog

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.sheet_tracking_filter, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val btnClose = view.findViewById<ImageView>(R.id.btnCloseFilter)
        val radioGroup = view.findViewById<RadioGroup>(R.id.filterMetricRadioGroup)
        val btnReset = view.findViewById<OrbitButton>(R.id.btnResetFilter)
        val btnApply = view.findViewById<OrbitButton>(R.id.btnApplyFilter)

        btnClose.setOnClickListener { dismiss() }

        when (currentMetricType) {
            MetricType.GLUCOSE -> radioGroup.check(R.id.radioMetricGlucose)
            MetricType.BLOOD_PRESSURE -> radioGroup.check(R.id.radioMetricBp)
            MetricType.WEIGHT -> radioGroup.check(R.id.radioMetricWeight)
            MetricType.BMI -> radioGroup.check(R.id.radioMetricBmi)
            MetricType.HBA1C -> radioGroup.check(R.id.radioMetricHba1c)
        }

        btnReset.setOnClickListener {
            onResetFilter?.invoke()
            dismiss()
        }

        btnApply.setOnClickListener {
            val selectedType = when (radioGroup.checkedRadioButtonId) {
                R.id.radioMetricBp -> MetricType.BLOOD_PRESSURE
                R.id.radioMetricWeight -> MetricType.WEIGHT
                R.id.radioMetricBmi -> MetricType.BMI
                R.id.radioMetricHba1c -> MetricType.HBA1C
                else -> MetricType.GLUCOSE
            }
            onApplyFilter?.invoke(selectedType)
            dismiss()
        }
    }

    companion object {
        const val TAG = "TrackingFilterSheet"
        fun newInstance(current: MetricType = MetricType.GLUCOSE): TrackingFilterSheet {
            return TrackingFilterSheet().apply {
                setCurrentMetric(current)
            }
        }
    }
}
