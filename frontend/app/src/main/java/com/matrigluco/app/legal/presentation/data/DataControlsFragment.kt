package com.matrigluco.app.legal.presentation.data

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.matrigluco.app.R
import com.matrigluco.app.databinding.FragmentDataControlsBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class DataControlsFragment : Fragment() {

    private var _binding: FragmentDataControlsBinding? = null
    private val binding get() = _binding!!

    private val viewModel: DataControlsViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDataControlsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnManageAiContext.setOnClickListener {
            findNavController().navigate(R.id.accountFragment)
        }

        binding.btnClearCache.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext(), com.google.android.material.R.style.ThemeOverlay_Material3_MaterialAlertDialog_Centered)
                .setTitle(R.string.controls_clear_cache_confirm_title)
                .setMessage(R.string.controls_clear_cache_confirm_msg)
                .setPositiveButton(R.string.controls_clear_cache_btn) { _, _ ->
                    viewModel.clearLocalCache()
                }
                .setNegativeButton(R.string.more_cancel, null)
                .show()
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.events.collect { event ->
                    when (event) {
                        DataControlEvent.CacheCleared -> {
                            Toast.makeText(requireContext(), R.string.controls_clear_cache_success, Toast.LENGTH_SHORT).show()
                        }
                        is DataControlEvent.Error -> {
                            Toast.makeText(requireContext(), event.message, Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
