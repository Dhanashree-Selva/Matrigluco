package com.matrigluco.app.account.presentation

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.google.android.material.datepicker.MaterialDatePicker
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.matrigluco.app.R
import com.matrigluco.app.databinding.FragmentAccountBinding
import com.matrigluco.core.designsystem.R as DesignR
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarConfig
import com.matrigluco.core.designsystem.component.appbar.configureOrbitAppBar
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

@AndroidEntryPoint
class AccountFragment : Fragment() {

    private val viewModel: AccountViewModel by viewModels()
    private var binding: FragmentAccountBinding? = null
    private var isUserTyping = false

    private val bloodGroups = arrayOf("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = FragmentAccountBinding.inflate(inflater, container, false).also {
        binding = it
    }.root

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val b = binding ?: return

        configureOrbitAppBar(
            OrbitAppBarConfig.detail(
                title = "Profile & Identity",
                subtitle = "Manage personal identity and maternal parameters",
                onBackClick = { findNavController().navigateUp() }
            )
        )

        setupTabs()
        setupFormListeners()
        setupPickers()

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.state.collect(::render)
            }
        }
    }

    private fun setupTabs() {
        val b = binding ?: return
        b.tabProfile.setOnClickListener { viewModel.setTab(AccountTab.PROFILE) }
        b.tabPreferences.setOnClickListener { viewModel.setTab(AccountTab.PREFERENCES) }
        b.tabSecurity.setOnClickListener { viewModel.setTab(AccountTab.SECURITY) }
    }

    private fun setupFormListeners() {
        val b = binding ?: return

        b.inputFullName.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                isUserTyping = true
                viewModel.updateFullName(s?.toString().orEmpty())
                isUserTyping = false
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        b.inputPhone.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                isUserTyping = true
                viewModel.updatePhone(s?.toString().orEmpty())
                isUserTyping = false
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        b.inputEmergencyContact.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                isUserTyping = true
                viewModel.updateEmergencyContact(s?.toString().orEmpty())
                isUserTyping = false
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        b.inputPregnancyWeek.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                isUserTyping = true
                viewModel.updatePregnancyWeek(s?.toString()?.toIntOrNull())
                isUserTyping = false
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        b.inputPreviousPregnancies.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                isUserTyping = true
                viewModel.updatePreviousPregnancies(s?.toString()?.toIntOrNull())
                isUserTyping = false
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        b.switchNotifications.setOnCheckedChangeListener { _, isChecked ->
            viewModel.updateNotificationsEnabled(isChecked)
        }

        b.switchAiContext.setOnCheckedChangeListener { _, isChecked ->
            viewModel.updateAiContextEnabled(isChecked)
        }

        b.btnSaveProfile.setOnClickListener {
            viewModel.saveProfile()
        }
    }

    private fun setupPickers() {
        val b = binding ?: return

        b.btnPickDueDate.setOnClickListener {
            val picker = MaterialDatePicker.Builder.datePicker()
                .setTitleText("Select Expected Due Date")
                .build()

            picker.addOnPositiveButtonClickListener { selectionEpochMillis ->
                val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                }
                val formatted = sdf.format(Date(selectionEpochMillis))
                viewModel.updateExpectedDueDate(formatted)
            }
            picker.show(childFragmentManager, "due_date_picker")
        }

        b.btnPickBloodGroup.setOnClickListener {
            MaterialAlertDialogBuilder(requireContext())
                .setTitle("Select Blood Group")
                .setItems(bloodGroups) { _, which ->
                    viewModel.updateBloodGroup(bloodGroups[which])
                }
                .show()
        }
    }

    private fun render(state: AccountUiState) {
        val b = binding ?: return

        // 1. Update Tab styles
        renderTabs(state.activeTab)

        // 2. Avatar Initials
        b.avatarInitialsLarge.text = state.avatarInitials

        // 3. Form fields (only update text if user isn't actively modifying)
        if (!isUserTyping) {
            if (b.inputFullName.text.toString() != state.fullName) {
                b.inputFullName.setText(state.fullName)
            }
            if (b.inputPhone.text.toString() != state.phone) {
                b.inputPhone.setText(state.phone)
            }
            if (b.inputEmergencyContact.text.toString() != state.emergencyContact) {
                b.inputEmergencyContact.setText(state.emergencyContact)
            }
            val weekStr = state.pregnancyWeek?.toString().orEmpty()
            if (b.inputPregnancyWeek.text.toString() != weekStr) {
                b.inputPregnancyWeek.setText(weekStr)
            }
            val prevStr = state.previousPregnancies?.toString().orEmpty()
            if (b.inputPreviousPregnancies.text.toString() != prevStr) {
                b.inputPreviousPregnancies.setText(prevStr)
            }
        }

        // 4. Due Date formatted
        b.textDueDate.text = if (!state.expectedDueDate.isNullOrBlank()) {
            formatDueDateDisplay(state.expectedDueDate)
        } else {
            "Select date"
        }

        // 5. Blood Group formatted
        b.textBloodGroup.text = if (!state.bloodGroup.isNullOrBlank()) {
            state.bloodGroup
        } else {
            "Select group"
        }

        // 6. Save button progress & feedback
        b.btnSaveProfile.apply {
            isEnabled = !state.saving
            setText(if (state.saving) "Saving Changes..." else "Save Profile Changes")
        }

        if (state.saveSuccess) {
            b.textFeedback.visibility = View.VISIBLE
            b.textFeedback.text = "✓ Profile changes saved successfully."
            b.textFeedback.setTextColor(ContextCompat.getColor(requireContext(), DesignR.color.care_pink))
        } else if (!state.errorMessage.isNullOrBlank()) {
            b.textFeedback.visibility = View.VISIBLE
            b.textFeedback.text = state.errorMessage
            b.textFeedback.setTextColor(ContextCompat.getColor(requireContext(), DesignR.color.care_pink))
        } else {
            b.textFeedback.visibility = View.GONE
        }
    }

    private fun renderTabs(active: AccountTab) {
        val b = binding ?: return
        val white = 0xFFFFFFFF.toInt()
        val secondary = ContextCompat.getColor(requireContext(), DesignR.color.care_text_secondary)
        val tertiary = ContextCompat.getColor(requireContext(), DesignR.color.care_text_tertiary)

        // Profile Tab
        val isProfile = active == AccountTab.PROFILE
        b.tabProfile.setBackgroundResource(
            if (isProfile) R.drawable.bg_account_tab_active else R.drawable.bg_account_tab_inactive
        )
        b.tabProfileIcon.setColorFilter(if (isProfile) white else secondary)
        b.tabProfileTitle.setTextColor(if (isProfile) white else secondary)
        b.tabProfileSubtitle.setTextColor(if (isProfile) 0xFFF0F0F0.toInt() else tertiary)
        b.containerProfileTab.visibility = if (isProfile) View.VISIBLE else View.GONE

        // Preferences Tab
        val isPref = active == AccountTab.PREFERENCES
        b.tabPreferences.setBackgroundResource(
            if (isPref) R.drawable.bg_account_tab_active else R.drawable.bg_account_tab_inactive
        )
        b.tabPreferencesIcon.setColorFilter(if (isPref) white else secondary)
        b.tabPreferencesTitle.setTextColor(if (isPref) white else secondary)
        b.tabPreferencesSubtitle.setTextColor(if (isPref) 0xFFF0F0F0.toInt() else tertiary)
        b.containerPreferencesTab.visibility = if (isPref) View.VISIBLE else View.GONE

        // Security Tab
        val isSec = active == AccountTab.SECURITY
        b.tabSecurity.setBackgroundResource(
            if (isSec) R.drawable.bg_account_tab_active else R.drawable.bg_account_tab_inactive
        )
        b.tabSecurityIcon.setColorFilter(if (isSec) white else secondary)
        b.tabSecurityTitle.setTextColor(if (isSec) white else secondary)
        b.tabSecuritySubtitle.setTextColor(if (isSec) 0xFFF0F0F0.toInt() else tertiary)
        b.containerSecurityTab.visibility = if (isSec) View.VISIBLE else View.GONE
    }

    private fun formatDueDateDisplay(isoDate: String): String {
        return try {
            val parser = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val formatter = SimpleDateFormat("MMM d, yyyy", Locale.US)
            val date = parser.parse(isoDate)
            if (date != null) formatter.format(date) else isoDate
        } catch (_: Exception) {
            isoDate
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }
}
