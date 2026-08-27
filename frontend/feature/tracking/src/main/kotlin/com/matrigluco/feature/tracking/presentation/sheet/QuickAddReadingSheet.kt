package com.matrigluco.feature.tracking.presentation.sheet

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.google.android.material.chip.ChipGroup
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.matrigluco.core.designsystem.component.OrbitButton
import com.matrigluco.feature.tracking.R
import com.matrigluco.feature.tracking.domain.model.MetricDefinition
import com.matrigluco.feature.tracking.domain.model.MetricType

class QuickAddReadingSheet : BottomSheetDialogFragment() {

    private var onSaveListener: ((metricType: MetricType, primary: Double, secondary: Double?, unit: String, notes: String?) -> Unit)? = null
    private var preselectedMetric: MetricType = MetricType.GLUCOSE

    fun setPreselectedMetric(type: MetricType) {
        preselectedMetric = type
    }

    fun setOnSaveListener(listener: (metricType: MetricType, primary: Double, secondary: Double?, unit: String, notes: String?) -> Unit) {
        onSaveListener = listener
    }

    override fun getTheme(): Int = com.matrigluco.core.designsystem.R.style.Orbit_BottomSheetDialog

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.sheet_quick_add_reading, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val btnClose = view.findViewById<ImageView>(R.id.btnCloseSheet)
        val chipGroup = view.findViewById<ChipGroup>(R.id.metricChipGroup)
        val primaryInputLayout = view.findViewById<TextInputLayout>(R.id.primaryInputLayout)
        val primaryInputEdit = view.findViewById<TextInputEditText>(R.id.primaryInputEdit)
        val secondaryInputLayout = view.findViewById<TextInputLayout>(R.id.secondaryInputLayout)
        val secondaryInputEdit = view.findViewById<TextInputEditText>(R.id.secondaryInputEdit)
        val notesInputEdit = view.findViewById<TextInputEditText>(R.id.notesInputEdit)
        val saveErrorMessage = view.findViewById<TextView>(R.id.saveErrorMessage)
        val btnSave = view.findViewById<OrbitButton>(R.id.btnSaveReading)

        btnClose.setOnClickListener { dismiss() }

        // Configure preselection
        when (preselectedMetric) {
            MetricType.GLUCOSE -> chipGroup.check(R.id.chipGlucose)
            MetricType.BLOOD_PRESSURE -> chipGroup.check(R.id.chipBp)
            MetricType.WEIGHT -> chipGroup.check(R.id.chipWeight)
            MetricType.BMI -> chipGroup.check(R.id.chipBmi)
            MetricType.HBA1C -> chipGroup.check(R.id.chipHba1c)
        }

        fun updateInputFields(metricType: MetricType) {
            val def = MetricDefinition.forType(metricType)
            if (metricType == MetricType.BLOOD_PRESSURE) {
                primaryInputLayout.hint = "Systolic (mmHg)"
                secondaryInputLayout.visibility = View.VISIBLE
                secondaryInputLayout.hint = "Diastolic (mmHg)"
            } else {
                primaryInputLayout.hint = "Value (${def.unit})"
                secondaryInputLayout.visibility = View.GONE
            }
            saveErrorMessage.visibility = View.GONE
        }

        updateInputFields(preselectedMetric)

        chipGroup.setOnCheckedStateChangeListener { _, checkedIds ->
            val checkedId = checkedIds.firstOrNull() ?: R.id.chipGlucose
            val type = when (checkedId) {
                R.id.chipBp -> MetricType.BLOOD_PRESSURE
                R.id.chipWeight -> MetricType.WEIGHT
                R.id.chipBmi -> MetricType.BMI
                R.id.chipHba1c -> MetricType.HBA1C
                else -> MetricType.GLUCOSE
            }
            updateInputFields(type)
        }

        btnSave.setOnClickListener {
            val checkedId = chipGroup.checkedChipId
            val type = when (checkedId) {
                R.id.chipBp -> MetricType.BLOOD_PRESSURE
                R.id.chipWeight -> MetricType.WEIGHT
                R.id.chipBmi -> MetricType.BMI
                R.id.chipHba1c -> MetricType.HBA1C
                else -> MetricType.GLUCOSE
            }
            val def = MetricDefinition.forType(type)

            val primText = primaryInputEdit.text?.toString()?.trim().orEmpty()
            val primVal = primText.toDoubleOrNull()

            if (primVal == null || primVal <= 0.0) {
                saveErrorMessage.text = "Please enter a valid numeric value."
                saveErrorMessage.visibility = View.VISIBLE
                return@setOnClickListener
            }

            var secVal: Double? = null
            if (type == MetricType.BLOOD_PRESSURE) {
                val secText = secondaryInputEdit.text?.toString()?.trim().orEmpty()
                secVal = secText.toDoubleOrNull()
                if (secVal == null || secVal <= 0.0) {
                    saveErrorMessage.text = "Please enter a valid diastolic blood pressure value."
                    saveErrorMessage.visibility = View.VISIBLE
                    return@setOnClickListener
                }
                if (primVal <= secVal) {
                    saveErrorMessage.text = "Systolic must be greater than diastolic."
                    saveErrorMessage.visibility = View.VISIBLE
                    return@setOnClickListener
                }
            }

            btnSave.setLoading(true)
            val notes = notesInputEdit.text?.toString()?.trim()?.ifBlank { null }
            onSaveListener?.invoke(type, primVal, secVal, def.unit, notes)
            dismiss()
        }
    }

    companion object {
        const val TAG = "QuickAddReadingSheet"
        fun newInstance(preselected: MetricType = MetricType.GLUCOSE): QuickAddReadingSheet {
            return QuickAddReadingSheet().apply {
                setPreselectedMetric(preselected)
            }
        }
    }
}
