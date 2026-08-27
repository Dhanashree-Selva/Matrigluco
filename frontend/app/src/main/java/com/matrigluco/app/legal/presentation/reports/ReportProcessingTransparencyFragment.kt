package com.matrigluco.app.legal.presentation.reports

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.matrigluco.app.databinding.FragmentReportProcessingBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class ReportProcessingTransparencyFragment : Fragment() {

    private var _binding: FragmentReportProcessingBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentReportProcessingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
