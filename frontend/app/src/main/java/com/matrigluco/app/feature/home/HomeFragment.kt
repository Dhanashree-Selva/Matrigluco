package com.matrigluco.app.feature.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.matrigluco.app.databinding.FragmentHomeBinding
import com.matrigluco.core.designsystem.R as DesignR

class HomeFragment : Fragment() {
    private var _binding: FragmentHomeBinding? = null
    private val binding get() = checkNotNull(_binding)

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        binding.topBar.setTitle(getString(com.matrigluco.app.R.string.app_name))
        binding.topBar.setSubtitle(getString(com.matrigluco.app.R.string.home_greeting))
        binding.topBar.setNavigationVisible(false)
        binding.sectionHeader.bind(getString(com.matrigluco.app.R.string.health_summary), getString(com.matrigluco.app.R.string.design_foundation_metadata))
        binding.emptyState.bind(DesignR.drawable.ic_huge_report_24, getString(com.matrigluco.app.R.string.health_empty_title), getString(com.matrigluco.app.R.string.health_empty_body))
        binding.emptyState.setPrimaryAction(getString(com.matrigluco.app.R.string.add_report), null)
        return binding.root
    }

    override fun onDestroyView() {
        _binding = null
        super.onDestroyView()
    }
}
