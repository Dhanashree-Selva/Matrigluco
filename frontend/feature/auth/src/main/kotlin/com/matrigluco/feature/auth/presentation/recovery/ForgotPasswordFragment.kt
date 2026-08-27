package com.matrigluco.feature.auth.presentation.recovery

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.matrigluco.core.network.error.ApiResult
import com.matrigluco.feature.auth.R
import com.matrigluco.feature.auth.databinding.FragmentForgotPasswordBinding
import com.matrigluco.feature.auth.domain.AuthRepository
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ForgotPasswordFragment : Fragment() {
    @Inject lateinit var repository: AuthRepository
    private var binding: FragmentForgotPasswordBinding? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        return FragmentForgotPasswordBinding.inflate(inflater, container, false).also { binding = it }.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding?.submit?.setOnClickListener {
            val email = binding?.email?.text().toString().trim()
            if (email.isBlank()) {
                binding?.email?.setError(getString(R.string.auth_invalid_email))
                return@setOnClickListener
            }
            binding?.email?.setError(null)
            viewLifecycleOwner.lifecycleScope.launch {
                binding?.submit?.setLoading(true)
                val result = repository.forgotPassword(email)
                binding?.submit?.setLoading(false)
                binding?.feedback?.apply {
                    visibility = View.VISIBLE
                    text = if (result is ApiResult.Success) getString(R.string.auth_recovery_sent) else getString(R.string.auth_unavailable)
                }
            }
        }
        binding?.back?.setOnClickListener {
            findNavController().navigateUp()
        }
    }

    override fun onDestroyView() {
        binding = null
        super.onDestroyView()
    }
}
