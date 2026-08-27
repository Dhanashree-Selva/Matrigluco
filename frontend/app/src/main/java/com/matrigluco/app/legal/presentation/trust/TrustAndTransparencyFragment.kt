package com.matrigluco.app.legal.presentation.trust

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.matrigluco.app.R
import com.matrigluco.app.databinding.FragmentTrustAndTransparencyBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class TrustAndTransparencyFragment : Fragment() {

    private var _binding: FragmentTrustAndTransparencyBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentTrustAndTransparencyBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.rowPrivacy.setOnClickListener {
            findNavController().navigate(R.id.privacyAndDataFragment)
        }
        binding.rowTerms.setOnClickListener {
            findNavController().navigate(R.id.termsOfUseFragment)
        }
        binding.rowModel.setOnClickListener {
            findNavController().navigate(R.id.modelAndAITransparencyFragment)
        }
        binding.rowReports.setOnClickListener {
            findNavController().navigate(R.id.reportProcessingTransparencyFragment)
        }
        binding.rowLicenses.setOnClickListener {
            findNavController().navigate(R.id.openSourceLicensesFragment)
        }
        binding.rowPermissions.setOnClickListener {
            findNavController().navigate(R.id.permissionsAndDeviceAccessFragment)
        }
        binding.rowDataControls.setOnClickListener {
            findNavController().navigate(R.id.dataControlsFragment)
        }
        binding.rowAppInfo.setOnClickListener {
            findNavController().navigate(R.id.appInformationFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
