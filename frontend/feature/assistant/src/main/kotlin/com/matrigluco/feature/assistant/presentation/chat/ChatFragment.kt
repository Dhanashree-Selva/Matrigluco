package com.matrigluco.feature.assistant.presentation.chat

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.matrigluco.core.designsystem.R as DesignR
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarAction
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarConfig
import com.matrigluco.core.designsystem.component.appbar.configureOrbitAppBar
import com.matrigluco.feature.assistant.R
import com.matrigluco.feature.assistant.databinding.FragmentChatBinding
import com.matrigluco.feature.assistant.domain.ChatMessage
import com.matrigluco.feature.assistant.domain.ChatRole
import com.matrigluco.feature.assistant.presentation.sheet.AssistantSheets
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ChatFragment : Fragment() {

    private val viewModel: ChatViewModel by viewModels()
    private var binding: FragmentChatBinding? = null
    private var wasSending = false
    private var lastAssistantMessageId: String? = null

    private val promptAdapter = PromptRailAdapter { prompt ->
        viewModel.selectPrompt(prompt)
        binding?.composerInput?.setText(prompt.question)
        binding?.composerInput?.setSelection(prompt.question.length)
        binding?.composerInput?.requestFocus()
    }

    private val chatAdapter = ChatAdapter(
        onSourcesClick = ::showSources,
        onCopyClick = ::copyText,
        onFeedbackClick = { messageId, helpful ->
            viewModel.feedback(messageId, helpful)
            Toast.makeText(
                requireContext(),
                if (helpful) "Marked as helpful" else "Feedback recorded",
                Toast.LENGTH_SHORT
            ).show()
        }
    )

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = FragmentChatBinding.inflate(inflater, container, false).also {
        binding = it
    }.root

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val b = binding ?: return

        b.promptRecyclerView.adapter = promptAdapter
        b.messagesRecyclerView.adapter = chatAdapter

        // Direct Text Watcher: Keeps send button in sync with text without modifying EditText
        b.composerInput.doAfterTextChanged {
            val text = it?.toString().orEmpty()
            val hasText = text.trim().isNotEmpty()
            b.btnSendContainer.isEnabled = hasText && !viewModel.state.value.sending
            b.btnSendContainer.alpha = if (hasText) 1.0f else 0.4f
            viewModel.draftChanged(text)
        }

        b.messagesRecyclerView.addOnLayoutChangeListener { _, _, _, _, bottom, _, _, _, oldBottom ->
            if (bottom < oldBottom && chatAdapter.itemCount > 0) {
                b.messagesRecyclerView.post {
                    b.messagesRecyclerView.scrollToPosition(chatAdapter.itemCount - 1)
                }
            }
        }

        b.composerInput.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                b.chatRoot.postDelayed({
                    if (b.messagesRecyclerView.visibility == View.VISIBLE && chatAdapter.itemCount > 0) {
                        b.messagesRecyclerView.smoothScrollToPosition(chatAdapter.itemCount - 1)
                    } else if (b.emptyContainer.childCount > 0) {
                        b.emptyContainer.smoothScrollTo(0, b.emptyContainer.getChildAt(0).height)
                    }
                }, 150)
            }
        }

        b.btnSendContainer.setOnClickListener {
            val text = b.composerInput.text?.toString().orEmpty().trim()
            if (text.isNotEmpty() && !viewModel.state.value.sending) {
                b.composerInput.setText("")
                viewModel.draftChanged(text)
                viewModel.send()
            }
        }

        b.contextCapsule.setOnClickListener {
            AssistantSheets.showContextSheet(
                requireContext(),
                viewModel.state.value.healthContext
            ) { enabled ->
                viewModel.setHealthContext(enabled)
            }
        }

        b.composerContextToggle.setOnClickListener {
            val current = viewModel.state.value.healthContext
            viewModel.setHealthContext(!current)
        }

        // Configure OrbitAppBar
        val actions = listOf(
            OrbitAppBarAction.Custom(
                id = "action_new_conversation",
                iconRes = DesignR.drawable.ic_huge_add_24,
                contentDescription = getString(R.string.assistant_new_conversation),
                onClick = {
                    b.composerInput.setText("")
                    viewModel.startNewConversation()
                }
            ),
            OrbitAppBarAction.Custom(
                id = "action_history",
                iconRes = DesignR.drawable.ic_huge_history_24,
                contentDescription = getString(R.string.assistant_conversation_history),
                onClick = {
                    findNavController().navigate(R.id.conversationListFragment)
                }
            ),
            OrbitAppBarAction.Custom(
                id = "action_info",
                iconRes = DesignR.drawable.ic_huge_info_24,
                contentDescription = getString(R.string.assistant_info),
                onClick = {
                    AssistantSheets.showInfoSheet(requireContext())
                }
            )
        )

        val isNestedChat = arguments?.getString("conversationId") != null || findNavController().currentDestination?.id == R.id.chatFragment
        if (isNestedChat) {
            configureOrbitAppBar(
                OrbitAppBarConfig.detail(
                    title = getString(R.string.assistant_title),
                    eyebrow = "EDUCATIONAL SUPPORT",
                    subtitle = "Continuous guidance & questions",
                    actions = actions,
                    onBackClick = { findNavController().navigateUp() }
                )
            )
        } else {
            configureOrbitAppBar(
                OrbitAppBarConfig.root(
                    title = getString(R.string.assistant_title),
                    eyebrow = "EDUCATIONAL SUPPORT",
                    subtitle = "Continuous guidance & questions",
                    actions = actions
                )
            )
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.state.collect(::render)
            }
        }
    }

    private fun render(state: ChatUiState) {
        val b = binding ?: return

        b.chatLoading.visibility = if (state.loading && state.messages.isEmpty()) View.VISIBLE else View.GONE
        b.offlineBanner.visibility = if (state.offline) View.VISIBLE else View.GONE

        // Context state update
        if (state.healthContext) {
            b.contextStatusLabel.text = getString(R.string.assistant_context_allowed)
            b.contextShieldIcon.setColorFilter(requireContext().getColor(DesignR.color.care_pink))
            b.composerContextText.text = "Context: Allowed"
            b.composerContextIcon.setColorFilter(requireContext().getColor(DesignR.color.care_pink))
        } else {
            b.contextStatusLabel.text = getString(R.string.assistant_context_off)
            b.contextShieldIcon.setColorFilter(requireContext().getColor(DesignR.color.care_text_tertiary))
            b.composerContextText.text = "Context: Off"
            b.composerContextIcon.setColorFilter(requireContext().getColor(DesignR.color.care_text_tertiary))
        }

        // Empty state vs Message thread
        if (state.messages.isEmpty() && !state.loading) {
            b.emptyContainer.visibility = View.VISIBLE
            b.messagesRecyclerView.visibility = View.GONE
            promptAdapter.submitList(state.suggestions)
        } else {
            b.emptyContainer.visibility = View.GONE
            b.messagesRecyclerView.visibility = View.VISIBLE
            chatAdapter.submitList(state.messages) {
                if (state.messages.isNotEmpty()) {
                    b.messagesRecyclerView.scrollToPosition(state.messages.size - 1)
                }
            }
        }

        // Send button state
        val hasInput = b.composerInput.text?.toString().orEmpty().trim().isNotBlank()
        val canSend = !state.sending && !state.offline && hasInput
        b.btnSendContainer.isEnabled = canSend
        b.btnSendContainer.alpha = if (canSend) 1.0f else 0.4f
        b.btnSendProgress.visibility = if (state.sending) View.VISIBLE else View.GONE
        b.btnSendIcon.visibility = if (state.sending) View.GONE else View.VISIBLE

        // Accessibility announcement for new assistant response
        val newestAssistant = state.messages.lastOrNull { it.role == ChatRole.ASSISTANT && !it.isPending }?.id
        if (wasSending && !state.sending && newestAssistant != null && newestAssistant != lastAssistantMessageId) {
            b.chatRoot.announceForAccessibility(getString(R.string.assistant_response_complete))
        }
        lastAssistantMessageId = newestAssistant
        wasSending = state.sending
    }

    private fun showSources(message: ChatMessage) {
        AssistantSheets.showSourcesSheet(requireContext(), message.sources)
    }

    private fun copyText(text: String) {
        val clipboard = requireContext().getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText(getString(R.string.assistant_copy_label), text)
        clipboard.setPrimaryClip(clip)
        Toast.makeText(requireContext(), "Copied to clipboard", Toast.LENGTH_SHORT).show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }
}
