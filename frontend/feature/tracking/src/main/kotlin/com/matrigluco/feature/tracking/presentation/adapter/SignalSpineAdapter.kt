package com.matrigluco.feature.tracking.presentation.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.matrigluco.feature.tracking.R
import com.matrigluco.feature.tracking.domain.model.HealthReading
import com.matrigluco.feature.tracking.domain.model.MetricDefinition
import com.matrigluco.feature.tracking.presentation.TimelineItem
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class SignalSpineAdapter(
    private val onReadingClicked: (HealthReading) -> Unit
) : ListAdapter<TimelineItem, RecyclerView.ViewHolder>(TimelineDiffCallback()) {

    init {
        setHasStableIds(true)
    }

    override fun getItemId(position: Int): Long = getItem(position).stableId

    override fun getItemViewType(position: Int): Int = when (getItem(position)) {
        is TimelineItem.DateHeader -> TYPE_DATE_HEADER
        is TimelineItem.ReadingItem -> TYPE_READING
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return when (viewType) {
            TYPE_DATE_HEADER -> {
                val v = inflater.inflate(R.layout.item_tracking_date_header, parent, false)
                DateHeaderViewHolder(v)
            }
            else -> {
                val v = inflater.inflate(R.layout.item_tracking_reading, parent, false)
                ReadingViewHolder(v, onReadingClicked)
            }
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (val item = getItem(position)) {
            is TimelineItem.DateHeader -> (holder as DateHeaderViewHolder).bind(item)
            is TimelineItem.ReadingItem -> (holder as ReadingViewHolder).bind(item)
        }
    }

    class DateHeaderViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val titleView: TextView = itemView.findViewById(R.id.dateHeaderTitle)

        fun bind(item: TimelineItem.DateHeader) {
            titleView.text = item.title
            itemView.contentDescription = "Date heading: ${item.title}"
        }
    }

    class ReadingViewHolder(
        itemView: View,
        private val onClick: (HealthReading) -> Unit
    ) : RecyclerView.ViewHolder(itemView) {
        private val readingIcon: ImageView = itemView.findViewById(R.id.readingIcon)
        private val readingTitle: TextView = itemView.findViewById(R.id.readingTitle)
        private val readingValue: TextView = itemView.findViewById(R.id.readingValue)
        private val readingUnit: TextView = itemView.findViewById(R.id.readingUnit)
        private val readingTime: TextView = itemView.findViewById(R.id.readingTime)
        private val readingSyncStatus: TextView = itemView.findViewById(R.id.readingSyncStatus)
        private val cardContainer: View = itemView.findViewById(R.id.cardContainer)
        private val spineLineTop: View = itemView.findViewById(R.id.spineLineTop)
        private val spineLineBottom: View = itemView.findViewById(R.id.spineLineBottom)

        fun bind(item: TimelineItem.ReadingItem) {
            val reading = item.reading
            val def = MetricDefinition.forRaw(reading.metricType)

            readingIcon.setImageResource(def.iconRes)
            readingTitle.text = def.shortName
            readingValue.text = reading.formattedValue
            readingUnit.text = reading.unit
            readingTime.text = formatTime(reading.measuredAtEpochMillis)

            spineLineTop.visibility = if (item.isFirstInGroup) View.INVISIBLE else View.VISIBLE
            spineLineBottom.visibility = if (item.isLastInGroup) View.INVISIBLE else View.VISIBLE

            if (reading.isSyncPending) {
                readingSyncStatus.visibility = View.VISIBLE
                readingSyncStatus.text = "Saved on this device · Sync pending"
            } else {
                readingSyncStatus.visibility = View.GONE
            }

            cardContainer.setOnClickListener { onClick(reading) }

            val syncDesc = if (reading.isSyncPending) "Sync pending. " else ""
            cardContainer.contentDescription = "${def.shortName}, ${reading.formattedValue} ${reading.unit} at ${readingTime.text}. ${syncDesc}Double tap to view reading details."
        }

        private fun formatTime(epochMillis: Long): String {
            val sdf = SimpleDateFormat("hh:mm a", Locale.US).apply { timeZone = TimeZone.getDefault() }
            return sdf.format(Date(epochMillis))
        }
    }

    private class TimelineDiffCallback : DiffUtil.ItemCallback<TimelineItem>() {
        override fun areItemsTheSame(oldItem: TimelineItem, newItem: TimelineItem): Boolean {
            return oldItem.stableId == newItem.stableId
        }

        override fun areContentsTheSame(oldItem: TimelineItem, newItem: TimelineItem): Boolean {
            return oldItem == newItem
        }
    }

    companion object {
        private const val TYPE_DATE_HEADER = 0
        private const val TYPE_READING = 1
    }
}
