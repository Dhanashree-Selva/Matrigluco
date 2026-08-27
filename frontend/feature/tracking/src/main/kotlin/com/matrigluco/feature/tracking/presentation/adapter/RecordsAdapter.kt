package com.matrigluco.feature.tracking.presentation.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.matrigluco.feature.tracking.R
import com.matrigluco.feature.tracking.domain.model.HealthReading
import com.matrigluco.feature.tracking.domain.model.MetricDefinition
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class RecordsAdapter(
    private val onRecordClicked: (HealthReading) -> Unit
) : ListAdapter<HealthReading, RecordsAdapter.RecordViewHolder>(RecordDiffCallback()) {

    init {
        setHasStableIds(true)
    }

    override fun getItemId(position: Int): Long = getItem(position).id.hashCode().toLong()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecordViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_tracking_record_row, parent, false)
        return RecordViewHolder(v, onRecordClicked)
    }

    override fun onBindViewHolder(holder: RecordViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class RecordViewHolder(
        itemView: View,
        private val onClick: (HealthReading) -> Unit
    ) : RecyclerView.ViewHolder(itemView) {
        private val recordDate: TextView = itemView.findViewById(R.id.recordDate)
        private val recordTime: TextView = itemView.findViewById(R.id.recordTime)
        private val recordValue: TextView = itemView.findViewById(R.id.recordValue)
        private val recordMetricName: TextView = itemView.findViewById(R.id.recordMetricName)

        fun bind(reading: HealthReading) {
            val def = MetricDefinition.forRaw(reading.metricType)
            recordDate.text = formatDate(reading.measuredAtEpochMillis)
            recordTime.text = formatTime(reading.measuredAtEpochMillis)
            recordValue.text = "${reading.formattedValue} ${reading.unit}".trim()
            recordMetricName.text = def.displayName

            itemView.setOnClickListener { onClick(reading) }
            itemView.contentDescription = "${def.displayName}, ${recordValue.text} on ${recordDate.text} at ${recordTime.text}."
        }

        private fun formatDate(epochMillis: Long): String {
            val sdf = SimpleDateFormat("MMM dd, yyyy", Locale.US).apply { timeZone = TimeZone.getDefault() }
            return sdf.format(Date(epochMillis))
        }

        private fun formatTime(epochMillis: Long): String {
            val sdf = SimpleDateFormat("hh:mm a", Locale.US).apply { timeZone = TimeZone.getDefault() }
            return sdf.format(Date(epochMillis))
        }
    }

    private class RecordDiffCallback : DiffUtil.ItemCallback<HealthReading>() {
        override fun areItemsTheSame(oldItem: HealthReading, newItem: HealthReading): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: HealthReading, newItem: HealthReading): Boolean {
            return oldItem == newItem
        }
    }
}
