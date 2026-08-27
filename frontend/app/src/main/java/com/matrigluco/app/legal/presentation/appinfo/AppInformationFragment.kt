package com.matrigluco.app.legal.presentation.appinfo

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.matrigluco.app.BuildConfig
import com.matrigluco.app.databinding.FragmentAppInformationBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class AppInformationFragment : Fragment() {

    private var _binding: FragmentAppInformationBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAppInformationBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val versionName = BuildConfig.VERSION_NAME
        val versionCode = BuildConfig.VERSION_CODE
        binding.appVersionText.text = "Version $versionName (Build $versionCode)"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
