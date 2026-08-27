package com.matrigluco.feature.assistant.presentation.chat

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.matrigluco.feature.assistant.databinding.ItemPromptCardBinding
import com.matrigluco.feature.assistant.domain.PromptSuggestion

class PromptRailAdapter(
    private val onPromptClick: (PromptSuggestion) -> Unit
) : ListAdapter<PromptSuggestion, PromptRailAdapter.PromptViewHolder>(PromptDiff) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PromptViewHolder {
        val binding = ItemPromptCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return PromptViewHolder(binding)
    }

    override fun onBindViewHolder(holder: PromptViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class PromptViewHolder(
        private val binding: ItemPromptCardBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: PromptSuggestion) {
            binding.promptCategory.text = item.categoryLabel
            binding.promptQuestion.text = item.question
            binding.promptSupporting.text = item.supportingText
            binding.promptIcon.setImageResource(item.iconRes)

            binding.root.setOnClickListener {
                onPromptClick(item)
            }
        }
    }

    private object PromptDiff : DiffUtil.ItemCallback<PromptSuggestion>() {
        override fun areItemsTheSame(oldItem: PromptSuggestion, newItem: PromptSuggestion) =
            oldItem.id == newItem.id

        override fun areContentsTheSame(oldItem: PromptSuggestion, newItem: PromptSuggestion) =
            oldItem == newItem
    }
}
