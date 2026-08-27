package com.matrigluco.feature.assistant.presentation.conversations

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.matrigluco.feature.assistant.databinding.ItemConversationBinding
import com.matrigluco.feature.assistant.domain.Conversation
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class ConversationAdapter(
    private val onSelected: (String) -> Unit,
    private val onDelete: (String) -> Unit
) : ListAdapter<Conversation, ConversationAdapter.Holder>(Diff) {

    init {
        setHasStableIds(true)
    }

    override fun getItemId(position: Int): Long = getItem(position).id.hashCode().toLong()

    override fun onCreateViewHolder(parent: ViewGroup, type: Int): Holder {
        val binding = ItemConversationBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return Holder(binding)
    }

    override fun onBindViewHolder(holder: Holder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class Holder(
        private val binding: ItemConversationBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: Conversation) {
            binding.conversationTitle.text = item.title
            binding.conversationTime.text = formatTimestamp(item.updatedAt.ifBlank { item.createdAt })

            binding.root.setOnClickListener {
                onSelected(item.id)
            }

            binding.btnDeleteConversation.setOnClickListener {
                onDelete(item.id)
            }

            binding.root.contentDescription = "${item.title}, ${binding.conversationTime.text}"
        }
    }

    private fun formatTimestamp(isoString: String): String {
        if (isoString.isBlank()) return "Recent"
        return try {
            val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            val cleaned = isoString.substringBefore("Z").substringBefore("+")
            val date = sdf.parse(cleaned)
            val out = SimpleDateFormat("MMM d, yyyy · h:mm a", Locale.getDefault())
            if (date != null) out.format(date) else "Recent"
        } catch (_: Exception) {
            "Recent"
        }
    }

    private object Diff : DiffUtil.ItemCallback<Conversation>() {
        override fun areItemsTheSame(a: Conversation, b: Conversation) = a.id == b.id
        override fun areContentsTheSame(a: Conversation, b: Conversation) = a == b
    }
}
