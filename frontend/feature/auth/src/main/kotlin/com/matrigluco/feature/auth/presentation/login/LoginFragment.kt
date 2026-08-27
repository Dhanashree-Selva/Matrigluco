package com.matrigluco.feature.auth.presentation.login

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.matrigluco.feature.auth.R
import com.matrigluco.feature.auth.databinding.FragmentLoginBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint class LoginFragment : Fragment() {
    private val viewModel: LoginViewModel by viewModels()
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, state: Bundle?): View {
        val binding = FragmentLoginBinding.inflate(inflater, container, false)
        binding.submit.setOnClickListener { viewModel.submit(binding.email.text().toString(), binding.password.text().toString()) }
        binding.register.setOnClickListener { findNavController().navigate(com.matrigluco.feature.auth.R.id.registerFragment) }
        binding.forgot.setOnClickListener { findNavController().navigate(com.matrigluco.feature.auth.R.id.forgotPasswordFragment) }
        viewLifecycleOwner.lifecycleScope.launch { viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) { viewModel.state.collect { render(binding, it) } } }
        return binding.root
    }
    private fun render(binding: FragmentLoginBinding, state: LoginUiState) {
        binding.submit.setLoading(state == LoginUiState.Submitting)
        val validation = (state as? LoginUiState.Invalid)?.validation
        binding.email.setError(validation?.email?.let(::fieldErrorText))
        binding.password.setError(validation?.password?.let(::fieldErrorText))
        binding.error.visibility = if (state is LoginUiState.Error) View.VISIBLE else View.GONE
        binding.error.text = when ((state as? LoginUiState.Error)?.error) { com.matrigluco.core.network.error.ApiError.Unauthorized -> getString(R.string.auth_invalid_credentials); com.matrigluco.core.network.error.ApiError.Offline -> getString(R.string.auth_offline); null -> ""; else -> getString(R.string.auth_unavailable) }
    }
    private fun fieldErrorText(error: LoginFieldError): String = getString(when (error) {
        LoginFieldError.INVALID_EMAIL -> R.string.auth_invalid_email
        LoginFieldError.REQUIRED -> R.string.auth_password_required
    })
}
