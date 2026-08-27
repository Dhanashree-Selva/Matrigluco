package com.matrigluco.feature.assistant.presentation.conversations

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarConfig
import com.matrigluco.core.designsystem.component.appbar.configureOrbitAppBar
import com.matrigluco.core.designsystem.icon.OrbitIcon
import com.matrigluco.feature.assistant.R
import com.matrigluco.feature.assistant.databinding.FragmentConversationListBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ConversationListFragment : Fragment() {

    private val viewModel: ConversationListViewModel by viewModels()
    private var binding: FragmentConversationListBinding? = null

    private val adapter = ConversationAdapter(
        onSelected = ::open,
        onDelete = { id -> viewModel.delete(id) }
    )

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = FragmentConversationListBinding.inflate(inflater, container, false).also {
        binding = it
    }.root

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val b = binding ?: return

        b.list.adapter = adapter
        b.newConversation.setOnClickListener { viewModel.create() }
        b.retry.setOnClickListener { viewModel.refresh() }

        configureOrbitAppBar(
            OrbitAppBarConfig.detail(
                title = getString(R.string.assistant_conversation_history),
                subtitle = "Saved maternal health discussions",
                onBackClick = { findNavController().navigateUp() }
            )
        )

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch { viewModel.state.collect(::render) }
                launch {
                    viewModel.opened.collect { conversation ->
                        if (conversation != null) {
                            open(conversation.id)
                            viewModel.consumed()
                        }
                    }
                }
            }
        }
    }

    private fun open(id: String) {
        findNavController().navigate(
            R.id.chatFragment,
            bundleOf("conversationId" to id)
        )
    }

    private fun render(state: ConversationListState) {
        val b = binding ?: return

        b.loading.visibility = if (state is ConversationListState.Loading || state is ConversationListState.Creating) View.VISIBLE else View.GONE
        b.list.visibility = if (state is ConversationListState.Content) View.VISIBLE else View.GONE
        b.empty.visibility = if (state is ConversationListState.Empty || state is ConversationListState.Offline || state is ConversationListState.Error) View.VISIBLE else View.GONE
        b.retry.visibility = if (state is ConversationListState.Offline || state is ConversationListState.Error) View.VISIBLE else View.GONE

        if (state is ConversationListState.Content) {
            adapter.submitList(state.items)
        }

        when (state) {
            ConversationListState.Empty -> b.empty.bind(
                OrbitIcon.Assistant.drawableRes,
                getString(R.string.assistant_empty_title),
                getString(R.string.assistant_empty_body)
            )
            ConversationListState.Offline -> b.empty.bind(
                OrbitIcon.Offline.drawableRes,
                getString(R.string.assistant_offline_title),
                getString(R.string.assistant_offline_body)
            )
            is ConversationListState.Error -> b.empty.bind(
                OrbitIcon.Warning.drawableRes,
                getString(R.string.assistant_error_title),
                getString(R.string.assistant_error_body)
            )
            else -> Unit
        }
    }

    override fun onDestroyView() {
        binding?.list?.adapter = null
        binding = null
        super.onDestroyView()
    }
}
