package com.matrigluco.app.notifications.presentation

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.matrigluco.app.R
import com.matrigluco.app.databinding.ItemNotificationCardBinding
import com.matrigluco.app.notifications.data.NotificationDto
import com.matrigluco.core.designsystem.R as DesignR
import java.time.Duration
import java.time.Instant
import java.util.Locale

class NotificationsAdapter(
    private val onOpen: (NotificationDto) -> Unit
) : ListAdapter<NotificationDto, NotificationsAdapter.NotificationViewHolder>(NotificationDiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NotificationViewHolder {
        val binding = ItemNotificationCardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return NotificationViewHolder(binding, onOpen)
    }

    override fun onBindViewHolder(holder: NotificationViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class NotificationViewHolder(
        private val b: ItemNotificationCardBinding,
        private val onOpen: (NotificationDto) -> Unit
    ) : RecyclerView.ViewHolder(b.root) {

        fun bind(item: NotificationDto) {
            b.notificationTitle.text = item.title
            b.notificationMessage.text = item.message
            b.unreadDot.visibility = if (item.isRead) View.GONE else View.VISIBLE

            // Format relative time
            b.timeAgoLabel.text = formatRelativeTime(item.createdAt)

            // Category tag and icon
            val type = item.notificationType.lowercase(Locale.ENGLISH)
            when {
                type.contains("clinical") || type.contains("risk") -> {
                    b.categoryTag.text = "CLINICAL ALERT"
                    b.notificationIcon.setImageResource(DesignR.drawable.ic_huge_assessment_24)
                }
                type.contains("reminder") || type.contains("vital") || type.contains("glucose") -> {
                    b.categoryTag.text = "CARE REMINDER"
                    b.notificationIcon.setImageResource(DesignR.drawable.ic_huge_clock_24)
                }
                type.contains("report") -> {
                    b.categoryTag.text = "REPORT UPDATE"
                    b.notificationIcon.setImageResource(DesignR.drawable.ic_huge_document_24)
                }
                type.contains("consultation") -> {
                    b.categoryTag.text = "CONSULTATION"
                    b.notificationIcon.setImageResource(DesignR.drawable.ic_huge_calendar_24)
                }
                else -> {
                    b.categoryTag.text = "SYSTEM NOTICE"
                    b.notificationIcon.setImageResource(DesignR.drawable.ic_huge_info_24)
                }
            }

            b.notificationCardRoot.setOnClickListener {
                onOpen(item)
            }
        }

        private fun formatRelativeTime(isoString: String): String {
            return try {
                val instant = Instant.parse(isoString)
                val now = Instant.now()
                val duration = Duration.between(instant, now)
                val minutes = duration.toMinutes()
                val hours = duration.toHours()
                val days = duration.toDays()

                when {
                    minutes < 1 -> "Just now"
                    minutes < 60 -> "${minutes}m ago"
                    hours < 24 -> "${hours}h ago"
                    days == 1L -> "Yesterday"
                    days < 7 -> "${days}d ago"
                    else -> "${days / 7}w ago"
                }
            } catch (_: Exception) {
                "Recent"
            }
        }
    }

    private object NotificationDiffCallback : DiffUtil.ItemCallback<NotificationDto>() {
        override fun areItemsTheSame(oldItem: NotificationDto, newItem: NotificationDto): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: NotificationDto, newItem: NotificationDto): Boolean {
            return oldItem == newItem
        }
    }
}
