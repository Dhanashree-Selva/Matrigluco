package com.matrigluco.app.legal.presentation.licenses

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.os.bundleOf
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.matrigluco.app.R
import com.matrigluco.app.databinding.FragmentOpenSourceLicensesBinding
import com.matrigluco.app.legal.model.LicenseCategory
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class OpenSourceLicensesFragment : Fragment() {

    private var _binding: FragmentOpenSourceLicensesBinding? = null
    private val binding get() = _binding!!

    private val viewModel: OpenSourceLicensesViewModel by viewModels()
    private lateinit var adapter: LicensesAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOpenSourceLicensesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = LicensesAdapter { library ->
            findNavController().navigate(
                R.id.openSourceLicenseDetailFragment,
                bundleOf("libraryName" to library.name)
            )
        }

        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        binding.searchEditText.doAfterTextChanged { text ->
            viewModel.setQuery(text?.toString().orEmpty())
        }

        binding.chipAll.setOnClickListener {
            viewModel.setCategory(LicenseCategory.ALL)
            updateChipStyles(LicenseCategory.ALL)
        }
        binding.chipApache.setOnClickListener {
            viewModel.setCategory(LicenseCategory.APACHE)
            updateChipStyles(LicenseCategory.APACHE)
        }
        binding.chipMit.setOnClickListener {
            viewModel.setCategory(LicenseCategory.MIT)
            updateChipStyles(LicenseCategory.MIT)
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    adapter.submitList(state.libraries)
                    binding.summaryCountText.text = getString(R.string.licenses_count_format, state.totalCount)
                    binding.emptyStateText.visibility = if (state.libraries.isEmpty()) View.VISIBLE else View.GONE
                }
            }
        }
    }

    private fun updateChipStyles(selected: LicenseCategory) {
        val secondaryColor = androidx.core.content.ContextCompat.getColor(
            requireContext(),
            com.matrigluco.core.designsystem.R.color.care_text_secondary
        )
        binding.chipAll.setBackgroundResource(if (selected == LicenseCategory.ALL) R.drawable.bg_filter_chip_active else R.drawable.bg_filter_chip_inactive)
        binding.chipAll.setTextColor(if (selected == LicenseCategory.ALL) android.graphics.Color.WHITE else secondaryColor)

        binding.chipApache.setBackgroundResource(if (selected == LicenseCategory.APACHE) R.drawable.bg_filter_chip_active else R.drawable.bg_filter_chip_inactive)
        binding.chipApache.setTextColor(if (selected == LicenseCategory.APACHE) android.graphics.Color.WHITE else secondaryColor)

        binding.chipMit.setBackgroundResource(if (selected == LicenseCategory.MIT) R.drawable.bg_filter_chip_active else R.drawable.bg_filter_chip_inactive)
        binding.chipMit.setTextColor(if (selected == LicenseCategory.MIT) android.graphics.Color.WHITE else secondaryColor)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
