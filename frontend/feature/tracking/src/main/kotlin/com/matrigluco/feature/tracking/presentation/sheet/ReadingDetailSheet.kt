package com.matrigluco.feature.tracking.presentation.sheet

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.matrigluco.core.designsystem.component.OrbitButton
import com.matrigluco.feature.tracking.R
import com.matrigluco.feature.tracking.domain.model.HealthReading
import com.matrigluco.feature.tracking.domain.model.MetricDefinition
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class ReadingDetailSheet : BottomSheetDialogFragment() {

    private var reading: HealthReading? = null
    private var onDeleteListener: ((HealthReading) -> Unit)? = null

    fun setReading(r: HealthReading) {
        reading = r
    }

    fun setOnDeleteListener(listener: (HealthReading) -> Unit) {
        onDeleteListener = listener
    }

    override fun getTheme(): Int = com.matrigluco.core.designsystem.R.style.Orbit_BottomSheetDialog

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.sheet_reading_detail, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val r = reading ?: return
        val def = MetricDefinition.forRaw(r.metricType)

        val btnClose = view.findViewById<ImageView>(R.id.btnCloseDetail)
        val detailMetricName = view.findViewById<TextView>(R.id.detailMetricName)
        val detailValue = view.findViewById<TextView>(R.id.detailValue)
        val detailDate = view.findViewById<TextView>(R.id.detailDate)
        val detailSource = view.findViewById<TextView>(R.id.detailSource)
        val detailNotes = view.findViewById<TextView>(R.id.detailNotes)
        val btnDelete = view.findViewById<OrbitButton>(R.id.btnDeleteReading)

        btnClose.setOnClickListener { dismiss() }

        detailMetricName.text = def.displayName
        detailValue.text = "${r.formattedValue} ${r.unit}".trim()
        detailDate.text = formatFullDate(r.measuredAtEpochMillis)
        detailSource.text = "Source: ${r.source.replaceFirstChar(Char::titlecase)}"
        detailNotes.text = "Notes: ${r.notes ?: "None"}"

        btnDelete.setOnClickListener {
            onDeleteListener?.invoke(r)
            dismiss()
        }
    }

    private fun formatFullDate(epochMillis: Long): String {
        val sdf = SimpleDateFormat("EEEE, MMMM dd, yyyy 'at' hh:mm a", Locale.US).apply { timeZone = TimeZone.getDefault() }
        return sdf.format(Date(epochMillis))
    }

    companion object {
        const val TAG = "ReadingDetailSheet"
        fun newInstance(reading: HealthReading): ReadingDetailSheet {
            return ReadingDetailSheet().apply {
                setReading(reading)
            }
        }
    }
}
