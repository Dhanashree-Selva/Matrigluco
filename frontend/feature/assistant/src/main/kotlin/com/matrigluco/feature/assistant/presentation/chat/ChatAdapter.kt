package com.matrigluco.feature.assistant.presentation.chat

import android.graphics.Typeface
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.style.StyleSpan
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.matrigluco.feature.assistant.R
import com.matrigluco.feature.assistant.databinding.ItemChatAssistantMessageBinding
import com.matrigluco.feature.assistant.databinding.ItemChatPendingMessageBinding
import com.matrigluco.feature.assistant.databinding.ItemChatUserMessageBinding
import com.matrigluco.feature.assistant.domain.ChatMessage
import com.matrigluco.feature.assistant.domain.ChatRole
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone
import java.util.regex.Pattern

class ChatAdapter(
    private val onSourcesClick: (ChatMessage) -> Unit,
    private val onCopyClick: (String) -> Unit,
    private val onFeedbackClick: (String, Boolean) -> Unit
) : ListAdapter<ChatMessage, RecyclerView.ViewHolder>(MessageDiff) {

    companion object {
        private const val TYPE_USER = 1
        private const val TYPE_ASSISTANT = 2
        private const val TYPE_PENDING = 3
    }

    override fun getItemViewType(position: Int): Int {
        val item = getItem(position)
        return when {
            item.isPending -> TYPE_PENDING
            item.role == ChatRole.USER -> TYPE_USER
            else -> TYPE_ASSISTANT
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return when (viewType) {
            TYPE_USER -> {
                val binding = ItemChatUserMessageBinding.inflate(inflater, parent, false)
                UserViewHolder(binding)
            }
            TYPE_PENDING -> {
                val binding = ItemChatPendingMessageBinding.inflate(inflater, parent, false)
                PendingViewHolder(binding)
            }
            else -> {
                val binding = ItemChatAssistantMessageBinding.inflate(inflater, parent, false)
                AssistantViewHolder(binding)
            }
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val item = getItem(position)
        when (holder) {
            is UserViewHolder -> holder.bind(item)
            is AssistantViewHolder -> holder.bind(item)
            is PendingViewHolder -> holder.bind()
        }
    }

    inner class UserViewHolder(
        private val binding: ItemChatUserMessageBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: ChatMessage) {
            binding.userMessageBody.text = formatMarkdown(item.content)
            binding.userMessageTime.text = formatTime(item.createdAt)
        }
    }

    inner class AssistantViewHolder(
        private val binding: ItemChatAssistantMessageBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: ChatMessage) {
            val (mainText, disclaimerText) = parseDisclaimer(item.content)
            binding.assistantMessageBody.text = formatMarkdown(mainText)
            binding.assistantMessageTime.text = formatTime(item.createdAt)

            if (disclaimerText != null) {
                binding.assistantDisclaimerContainer.visibility = View.VISIBLE
                binding.assistantDisclaimerText.text = disclaimerText
            } else {
                binding.assistantDisclaimerContainer.visibility = View.GONE
            }

            if (item.sources.isNotEmpty()) {
                binding.assistantSourcesBtn.visibility = View.VISIBLE
                binding.assistantSourcesBtn.text = binding.root.context.resources.getQuantityString(
                    R.plurals.assistant_sources,
                    item.sources.size,
                    item.sources.size
                )
                binding.assistantSourcesBtn.setOnClickListener {
                    onSourcesClick(item)
                }
            } else {
                binding.assistantSourcesBtn.visibility = View.GONE
            }

            binding.assistantCopyBtn.setOnClickListener {
                onCopyClick(item.content)
            }

            binding.assistantHelpfulBtn.setOnClickListener {
                onFeedbackClick(item.id, true)
            }

            binding.assistantUnhelpfulBtn.setOnClickListener {
                onFeedbackClick(item.id, false)
            }
        }
    }

    inner class PendingViewHolder(
        binding: ItemChatPendingMessageBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        fun bind() {
            // Animated progress bar inside layout
        }
    }

    private fun parseDisclaimer(raw: String): Pair<String, String?> {
        val disclaimerRegex = Regex(
            """(?:\r?\n\s*|\A\s*)(?:\*|_)?Disclaimer:\s*(.*?)(?:\*|_)?\s*${'$'}""",
            setOf(RegexOption.DOT_MATCHES_ALL, RegexOption.IGNORE_CASE)
        )
        val match = disclaimerRegex.find(raw)
        return if (match != null) {
            val mainText = raw.substring(0, match.range.first).trim()
            val disclaimer = match.groupValues[1].trim().trim('*', '_', ' ')
            Pair(mainText.ifEmpty { "Clinical Response" }, disclaimer)
        } else {
            Pair(raw, null)
        }
    }

    private fun formatMarkdown(text: String): CharSequence {
        val sb = SpannableStringBuilder()
        val boldPattern = Pattern.compile("\\*\\*(.*?)\\*\\*")
        val matcher = boldPattern.matcher(text)
        var lastEnd = 0
        while (matcher.find()) {
            sb.append(text.substring(lastEnd, matcher.start()))
            val boldStart = sb.length
            sb.append(matcher.group(1))
            sb.setSpan(StyleSpan(Typeface.BOLD), boldStart, sb.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            lastEnd = matcher.end()
        }
        sb.append(text.substring(lastEnd))
        return sb
    }

    private fun formatTime(isoTimestamp: String): String {
        return try {
            val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            val date = parser.parse(isoTimestamp) ?: return ""
            SimpleDateFormat("h:mm a", Locale.getDefault()).format(date)
        } catch (_: Exception) {
            ""
        }
    }

    object MessageDiff : DiffUtil.ItemCallback<ChatMessage>() {
        override fun areItemsTheSame(oldItem: ChatMessage, newItem: ChatMessage): Boolean =
            oldItem.id == newItem.id

        override fun areContentsTheSame(oldItem: ChatMessage, newItem: ChatMessage): Boolean =
            oldItem == newItem
    }
}
