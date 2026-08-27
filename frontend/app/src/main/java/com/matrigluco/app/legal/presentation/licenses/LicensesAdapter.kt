package com.matrigluco.app.legal.presentation.licenses

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.matrigluco.app.databinding.ItemOpenSourceLicenseBinding
import com.matrigluco.app.legal.model.OpenSourceLibrary

class LicensesAdapter(
    private val onItemClick: (OpenSourceLibrary) -> Unit
) : ListAdapter<OpenSourceLibrary, LicensesAdapter.ViewHolder>(DiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemOpenSourceLicenseBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding, onItemClick)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class ViewHolder(
        private val binding: ItemOpenSourceLicenseBinding,
        private val onItemClick: (OpenSourceLibrary) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: OpenSourceLibrary) {
            binding.libraryName.text = item.name
            binding.libraryVersion.text = item.version?.let { "v$it" }.orEmpty()
            binding.libraryDescription.text = item.description
            binding.licenseBadge.text = item.licenseName

            binding.root.setOnClickListener {
                onItemClick(item)
            }
            binding.root.contentDescription = "${item.name}, version ${item.version.orEmpty()}, license ${item.licenseName}. Button."
        }
    }

    companion object {
        private val DiffCallback = object : DiffUtil.ItemCallback<OpenSourceLibrary>() {
            override fun areItemsTheSame(oldItem: OpenSourceLibrary, newItem: OpenSourceLibrary): Boolean {
                return oldItem.name == newItem.name
            }

            override fun areContentsTheSame(oldItem: OpenSourceLibrary, newItem: OpenSourceLibrary): Boolean {
                return oldItem == newItem
            }
        }
    }
}
