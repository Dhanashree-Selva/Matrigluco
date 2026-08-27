package com.matrigluco.app.legal.presentation.terms

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.matrigluco.app.databinding.FragmentTermsOfUseBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class TermsOfUseFragment : Fragment() {

    private var _binding: FragmentTermsOfUseBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentTermsOfUseBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
