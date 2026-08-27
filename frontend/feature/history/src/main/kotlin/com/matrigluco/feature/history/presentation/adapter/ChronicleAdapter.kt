package com.matrigluco.feature.history.presentation.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.ViewCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.matrigluco.core.designsystem.R as DesignR
import com.matrigluco.feature.history.R
import com.matrigluco.feature.history.databinding.ItemChronicleDateHeaderBinding
import com.matrigluco.feature.history.databinding.ItemChronicleEventDenseBinding
import com.matrigluco.feature.history.databinding.ItemChronicleEventStoryBinding
import com.matrigluco.feature.history.domain.model.ChronicleDateGroup
import com.matrigluco.feature.history.domain.model.ChronicleEvent
import com.matrigluco.feature.history.presentation.TimelineItem
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

class ChronicleAdapter(
    private val onToggleGroup: (ChronicleDateGroup) -> Unit,
    private val onOpenEvent: (ChronicleEvent) -> Unit
) : ListAdapter<TimelineItem, RecyclerView.ViewHolder>(TimelineDiffCallback) {

    companion object {
        private const val VIEW_TYPE_HEADER = 0
        private const val VIEW_TYPE_STORY = 1
        private const val VIEW_TYPE_DENSE = 2

        private val timeFormatter = DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH)
    }

    override fun getItemViewType(position: Int): Int = when (getItem(position)) {
        is TimelineItem.Header -> VIEW_TYPE_HEADER
        is TimelineItem.EventStory -> VIEW_TYPE_STORY
        is TimelineItem.EventDense -> VIEW_TYPE_DENSE
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return when (viewType) {
            VIEW_TYPE_HEADER -> {
                val binding = ItemChronicleDateHeaderBinding.inflate(inflater, parent, false)
                HeaderViewHolder(binding, onToggleGroup)
            }
            VIEW_TYPE_STORY -> {
                val binding = ItemChronicleEventStoryBinding.inflate(inflater, parent, false)
                StoryViewHolder(binding, onOpenEvent)
            }
            else -> {
                val binding = ItemChronicleEventDenseBinding.inflate(inflater, parent, false)
                DenseViewHolder(binding, onOpenEvent)
            }
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (val item = getItem(position)) {
            is TimelineItem.Header -> (holder as HeaderViewHolder).bind(item.dateGroup)
            is TimelineItem.EventStory -> (holder as StoryViewHolder).bind(item)
            is TimelineItem.EventDense -> (holder as DenseViewHolder).bind(item.event)
        }
    }

    class HeaderViewHolder(
        private val b: ItemChronicleDateHeaderBinding,
        private val onToggle: (ChronicleDateGroup) -> Unit
    ) : RecyclerView.ViewHolder(b.root) {

        fun bind(group: ChronicleDateGroup) {
            b.dateLabel.text = group.formattedDate
            b.eventCountBadge.text = "(${group.eventCount})"

            b.spineNode.setBackgroundResource(
                if (group.isToday) R.drawable.bg_spine_dot_today
                else R.drawable.bg_spine_dot_regular
            )

            b.chevronExpand.rotation = if (group.isExpanded) 0f else 180f

            b.dateHeaderRoot.setOnClickListener {
                onToggle(group)
            }

            ViewCompat.setAccessibilityHeading(b.dateLabel, true)
            b.dateHeaderRoot.contentDescription = "${group.formattedDate}, ${group.eventCount} events, ${if (group.isExpanded) "expanded" else "collapsed"}"
        }
    }

    class StoryViewHolder(
        private val b: ItemChronicleEventStoryBinding,
        private val onOpen: (ChronicleEvent) -> Unit
    ) : RecyclerView.ViewHolder(b.root) {

        fun bind(item: TimelineItem.EventStory) {
            val event = item.event
            val context = b.root.context
            val zoneId = ZoneId.systemDefault()
            val timeStr = event.occurredAt.atZone(zoneId).format(timeFormatter)

            b.timeLabel.text = timeStr
            b.eventTitle.text = event.title

            // Connect spine line
            b.spineTopLine.visibility = if (item.isFirstInGroup) View.INVISIBLE else View.VISIBLE
            b.spineBottomLine.visibility = if (item.isLastInGroup) View.INVISIBLE else View.VISIBLE

            when (event) {
                is ChronicleEvent.Assessment -> {
                    b.categoryBadge.text = "ASSESSMENT"
                    b.categoryBadge.setBackgroundResource(R.drawable.bg_category_badge_assessment)
                    b.categoryBadge.setTextColor(context.getColor(DesignR.color.care_pink))

                    b.statusChip.visibility = View.VISIBLE
                    b.statusChip.text = event.predictionResult.uppercase(Locale.ENGLISH) + " RISK"

                    val probStr = "%.1f%%".format(Locale.US, event.probabilityPercentage)
                    b.primaryResult.text = "$probStr Calculated Probability"
                    b.supportingContext.text = "Model ${event.modelVersion} · Metabolic indicators and clinical biomarkers evaluated."
                    b.actionText.text = context.getString(R.string.history_action_view_result) + " >"
                }
                is ChronicleEvent.Reading -> {
                    b.categoryBadge.text = "READING"
                    b.categoryBadge.setBackgroundResource(R.drawable.bg_category_badge_reading)
                    b.categoryBadge.setTextColor(context.getColor(DesignR.color.care_text_primary))

                    b.statusChip.visibility = View.GONE
                    b.primaryResult.text = event.formattedValue
                    b.supportingContext.text = "${event.source}${if (!event.notes.isNullOrBlank()) " · ${event.notes}" else ""}"
                    b.actionText.text = context.getString(R.string.history_action_view_reading) + " >"
                }
                is ChronicleEvent.Report -> {
                    b.categoryBadge.text = "REPORT"
                    b.categoryBadge.setBackgroundResource(R.drawable.bg_category_badge_reading)
                    b.categoryBadge.setTextColor(context.getColor(DesignR.color.care_text_primary))

                    b.statusChip.visibility = if (event.riskLevel != null) View.VISIBLE else View.GONE
                    b.statusChip.text = event.riskLevel?.uppercase(Locale.ENGLISH) ?: ""

                    b.primaryResult.text = event.summaryText
                    b.supportingContext.text = event.fileName
                    b.actionText.text = context.getString(R.string.history_action_view_report) + " >"
                }
                is ChronicleEvent.Consultation -> {
                    b.categoryBadge.text = "CONSULTATION"
                    b.categoryBadge.setBackgroundResource(R.drawable.bg_category_badge_reading)
                    b.categoryBadge.setTextColor(context.getColor(DesignR.color.care_text_primary))

                    b.statusChip.visibility = View.VISIBLE
                    b.statusChip.text = event.appointmentStatus.uppercase(Locale.ENGLISH)

                    b.primaryResult.text = event.doctorName ?: "Clinical Consultation"
                    b.supportingContext.text = event.department ?: "Maternal healthcare specialist"
                    b.actionText.text = context.getString(R.string.history_action_view_consultation) + " >"
                }
            }

            b.cardSurface.setOnClickListener {
                onOpen(event)
            }
        }
    }

    class DenseViewHolder(
        private val b: ItemChronicleEventDenseBinding,
        private val onOpen: (ChronicleEvent) -> Unit
    ) : RecyclerView.ViewHolder(b.root) {

        fun bind(event: ChronicleEvent) {
            val zoneId = ZoneId.systemDefault()
            val timeStr = event.occurredAt.atZone(zoneId).format(timeFormatter)

            b.denseTime.text = timeStr
            b.denseTitle.text = event.title

            when (event) {
                is ChronicleEvent.Assessment -> {
                    b.denseCategory.text = "ASSESS"
                    val probStr = "%.1f%%".format(Locale.US, event.probabilityPercentage)
                    b.denseValue.text = "$probStr · ${event.predictionResult} Risk"
                }
                is ChronicleEvent.Reading -> {
                    b.denseCategory.text = "READING"
                    b.denseValue.text = event.formattedValue
                }
                is ChronicleEvent.Report -> {
                    b.denseCategory.text = "REPORT"
                    b.denseValue.text = event.summaryText
                }
                is ChronicleEvent.Consultation -> {
                    b.denseCategory.text = "CONSULT"
                    b.denseValue.text = "${event.appointmentStatus} · ${event.doctorName ?: "Doctor"}"
                }
            }

            b.denseRowRoot.setOnClickListener {
                onOpen(event)
            }
        }
    }

    private object TimelineDiffCallback : DiffUtil.ItemCallback<TimelineItem>() {
        override fun areItemsTheSame(oldItem: TimelineItem, newItem: TimelineItem): Boolean {
            return oldItem.stableId == newItem.stableId
        }

        override fun areContentsTheSame(oldItem: TimelineItem, newItem: TimelineItem): Boolean {
            return oldItem == newItem
        }
    }
}
