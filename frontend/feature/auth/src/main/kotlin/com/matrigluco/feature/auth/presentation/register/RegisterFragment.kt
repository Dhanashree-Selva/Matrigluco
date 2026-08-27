package com.matrigluco.feature.auth.presentation.register

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
import com.matrigluco.feature.auth.databinding.FragmentRegisterBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class RegisterFragment : Fragment() {
    private val viewModel: RegisterViewModel by viewModels()
    private var binding: FragmentRegisterBinding? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        return FragmentRegisterBinding.inflate(inflater, container, false).also { binding = it }.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding?.submit?.setOnClickListener {
            binding?.run {
                viewModel.submit(name.text().toString(), email.text().toString(), password.text().toString())
            }
        }
        binding?.login?.setOnClickListener {
            findNavController().navigateUp()
        }
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.state.collect(::render)
            }
        }
    }

    private fun render(state: RegisterUiState) = binding?.apply {
        submit.setLoading(state == RegisterUiState.Submitting)
        val invalid = state as? RegisterUiState.Invalid
        email.setError(if (invalid?.email != null) getString(R.string.auth_invalid_email) else null)
        password.setError(if (invalid?.passwordTooShort == true) getString(R.string.auth_password_short) else null)
        error.visibility = if (state is RegisterUiState.Error) View.VISIBLE else View.GONE
        error.text = if (state is RegisterUiState.Error) getString(R.string.auth_unavailable) else ""
    }

    override fun onDestroyView() {
        binding = null
        super.onDestroyView()
    }
}
