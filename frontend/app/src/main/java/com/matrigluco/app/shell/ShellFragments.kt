package com.matrigluco.app.shell

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.matrigluco.app.R
import com.matrigluco.app.databinding.FragmentMoreBinding
import com.matrigluco.app.databinding.FragmentShellMessageBinding
import com.matrigluco.core.auth.session.SessionRepository
import com.matrigluco.core.auth.session.SessionState
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarConfig
import com.matrigluco.core.designsystem.component.appbar.configureOrbitAppBar
import com.matrigluco.core.designsystem.icon.OrbitIcon
import com.matrigluco.feature.auth.domain.AuthRepository
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import kotlinx.coroutines.launch

class StartupFragment : MessageFragment() { override val icon = OrbitIcon.Shield; override val titleRes = R.string.startup_title; override val bodyRes = R.string.startup_body }
class OnboardingFragment : MessageFragment() { override val icon = OrbitIcon.Account; override val titleRes = R.string.onboarding_title; override val bodyRes = R.string.onboarding_body }

class ShellSectionFragment : MessageFragment() {
    override val icon: OrbitIcon get() = when (requireArguments().getString("section")) {
        "track" -> OrbitIcon.Tracking; "reports" -> OrbitIcon.Reports; "assistant" -> OrbitIcon.Assistant
        "account" -> OrbitIcon.Account; "history" -> OrbitIcon.History; "consultations" -> OrbitIcon.Consultations
        "notifications" -> OrbitIcon.Notifications; else -> OrbitIcon.Info
    }
    override val titleRes get() = R.string.section_unavailable_title
    override val bodyRes get() = R.string.section_unavailable_body
}

abstract class MessageFragment : Fragment() {
    protected abstract val icon: OrbitIcon
    protected abstract val titleRes: Int
    protected abstract val bodyRes: Int
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, state: Bundle?): View =
        FragmentShellMessageBinding.inflate(inflater, container, false).also {
            it.message.bind(icon.drawableRes, getString(titleRes), getString(bodyRes))
        }.root
}

@AndroidEntryPoint
class MoreFragment : Fragment() {

    @Inject lateinit var authRepository: AuthRepository
    @Inject lateinit var sessionRepository: SessionRepository

    private var binding: FragmentMoreBinding? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        state: Bundle?
    ): View = FragmentMoreBinding.inflate(inflater, container, false).also {
        binding = it
    }.root

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val b = binding ?: return

        configureOrbitAppBar(
            OrbitAppBarConfig.root(
                title = getString(R.string.more_title),
                eyebrow = "WORKSPACE & PREFERENCES",
                subtitle = "Care options, profile & clinical tools"
            )
        )

        // 1. Profile card navigation
        b.cardProfile.setOnClickListener {
            findNavController().navigate(R.id.accountFragment)
        }

        // 2. Care & Clinical Tools
        b.itemHistory.setOnClickListener {
            findNavController().navigate(R.id.historyFragment)
        }
        b.itemReports.setOnClickListener {
            findNavController().navigate(R.id.reportsFragment)
        }
        b.itemAssessment.setOnClickListener {
            findNavController().navigate(R.id.assessmentFragment)
        }

        // 3. Communication & Security
        b.itemNotifications.setOnClickListener {
            findNavController().navigate(R.id.notificationsFragment)
        }
        b.itemAccount.setOnClickListener {
            findNavController().navigate(R.id.accountFragment)
        }

        // 4. Legal & Transparency
        b.itemTrustAndTransparency.setOnClickListener {
            findNavController().navigate(R.id.trustAndTransparencyFragment)
        }

        // 5. Sign Out with Confirmation Dialog
        b.btnSignOut.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle(R.string.more_sign_out_confirm_title)
                .setMessage(R.string.more_sign_out_confirm_message)
                .setPositiveButton(R.string.more_sign_out_confirm_action) { _, _ ->
                    viewLifecycleOwner.lifecycleScope.launch {
                        authRepository.logout()
                    }
                }
                .setNegativeButton(R.string.more_cancel, null)
                .show()
        }

        // 6. Bind user session profile details
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                sessionRepository.sessionState.collect { session ->
                    when (session) {
                        is SessionState.Authenticated -> bindUserProfile(session.user.fullName, session.user.email)
                        is SessionState.OfflineRestored -> bindUserProfile(session.user.fullName, session.user.email)
                        else -> bindUserProfile(null, null)
                    }
                }
            }
        }
    }

    private fun bindUserProfile(fullName: String?, email: String?) {
        val b = binding ?: return
        val displayFullName = if (!fullName.isNullOrBlank()) fullName else "Matrigluco Care Member"
        val displayEmail = if (!email.isNullOrBlank()) email else "patient@matrigluco.care"
        val initial = (fullName?.firstOrNull { it.isLetter() } ?: email?.firstOrNull { it.isLetter() } ?: 'M')
            .uppercaseChar()
            .toString()

        b.userName.text = displayFullName
        b.userEmail.text = displayEmail
        b.avatarInitial.text = initial
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }
}
