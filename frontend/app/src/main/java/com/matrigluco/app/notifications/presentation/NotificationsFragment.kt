package com.matrigluco.app.notifications.presentation

import android.os.Bundle
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
import com.matrigluco.app.R
import com.matrigluco.app.databinding.FragmentNotificationsBinding
import com.matrigluco.app.notifications.data.NotificationDto
import com.matrigluco.core.designsystem.R as DesignR
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarConfig
import com.matrigluco.core.designsystem.component.appbar.configureOrbitAppBar
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class NotificationsFragment : Fragment() {

    private val viewModel: NotificationsViewModel by viewModels()
    private var binding: FragmentNotificationsBinding? = null

    private val adapter by lazy {
        NotificationsAdapter { notification ->
            handleNotificationClick(notification)
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = FragmentNotificationsBinding.inflate(inflater, container, false).also {
        binding = it
    }.root

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val b = binding ?: return

        b.notificationsRecyclerView.adapter = adapter
        b.notificationsRecyclerView.itemAnimator = null

        b.swipeRefresh.setColorSchemeResources(DesignR.color.care_pink)
        b.swipeRefresh.setOnRefreshListener {
            viewModel.refresh()
        }

        b.btnMarkAllRead.setOnClickListener {
            viewModel.markAllAsRead()
        }

        setupFilterTabs()

        configureOrbitAppBar(
            OrbitAppBarConfig.detail(
                title = getString(R.string.notifications),
                subtitle = "Clinical alerts and reminders",
                onBackClick = { findNavController().navigateUp() }
            )
        )

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.state.collect(::render)
            }
        }
    }

    private fun setupFilterTabs() {
        val b = binding ?: return
        val tabs = listOf(
            b.tabFilterAll to NotificationFilter.ALL,
            b.tabFilterUnread to NotificationFilter.UNREAD,
            b.tabFilterClinical to NotificationFilter.CLINICAL,
            b.tabFilterReminders to NotificationFilter.REMINDERS,
            b.tabFilterSystem to NotificationFilter.SYSTEM
        )

        tabs.forEach { (view, filter) ->
            view.setOnClickListener {
                viewModel.setFilter(filter)
            }
        }
    }

    private fun render(state: NotificationsUiState) {
        val b = binding ?: return

        b.swipeRefresh.isRefreshing = state.loading
        b.loadingSpinner.visibility = if (state.loading && state.items.isEmpty()) View.VISIBLE else View.GONE

        // 1. Unread count badge
        b.unreadCountBadge.text = if (state.unreadCount > 0) {
            "${state.unreadCount} unread alert${if (state.unreadCount > 1) "s" else ""}"
        } else {
            "All caught up"
        }
        b.btnMarkAllRead.visibility = if (state.unreadCount > 0) View.VISIBLE else View.GONE

        // 2. Update Filter Tabs
        updateFilterTabs(state.filter)

        // 3. Update list vs Empty state
        val displayed = state.displayedItems
        if (displayed.isEmpty() && !state.loading) {
            b.notificationsRecyclerView.visibility = View.GONE
            b.emptyStateView.visibility = View.VISIBLE

            if (state.filter == NotificationFilter.ALL) {
                b.emptyStateView.bind(
                    iconResource = DesignR.drawable.ic_huge_notification_24,
                    emptyTitle = "No notifications yet",
                    truthfulReason = "You are all caught up. New clinical reminders, risk assessments, and reports will appear here."
                )
            } else {
                b.emptyStateView.bind(
                    iconResource = DesignR.drawable.ic_huge_filter_24,
                    emptyTitle = "No ${state.filter.displayName.lowercase()} notifications",
                    truthfulReason = "There are no notifications matching the selected filter."
                )
            }
        } else {
            b.emptyStateView.visibility = View.GONE
            b.notificationsRecyclerView.visibility = View.VISIBLE
            adapter.submitList(displayed)
        }
    }

    private fun updateFilterTabs(active: NotificationFilter) {
        val b = binding ?: return
        val white = 0xFFFFFFFF.toInt()
        val secondary = ContextCompat.getColor(requireContext(), DesignR.color.care_text_secondary)

        val tabs = listOf(
            b.tabFilterAll to (active == NotificationFilter.ALL),
            b.tabFilterUnread to (active == NotificationFilter.UNREAD),
            b.tabFilterClinical to (active == NotificationFilter.CLINICAL),
            b.tabFilterReminders to (active == NotificationFilter.REMINDERS),
            b.tabFilterSystem to (active == NotificationFilter.SYSTEM)
        )

        tabs.forEach { (view, isSelected) ->
            view.setBackgroundResource(
                if (isSelected) R.drawable.bg_account_tab_active
                else R.drawable.bg_account_tab_inactive
            )
            view.setTextColor(if (isSelected) white else secondary)
        }
    }

    private fun handleNotificationClick(item: NotificationDto) {
        if (!item.isRead) {
            viewModel.markAsRead(item.id)
        }

        // Deep link based on resource type
        val context = context ?: return
        val basePkg = context.packageName.removeSuffix(".debug")

        val targetDestName = when (item.resourceType?.lowercase()) {
            "assessment", "risk" -> "assessmentFragment"
            "measurement", "reading", "glucose", "vitals" -> "trackingFragment"
            "report", "document" -> "reportsFragment"
            "consultation", "appointment" -> "consultationsFragment"
            else -> null
        }

        if (targetDestName != null) {
            var resId = resources.getIdentifier(targetDestName, "id", basePkg)
            if (resId == 0) {
                resId = resources.getIdentifier(targetDestName, "id", context.packageName)
            }
            if (resId != 0) {
                runCatching {
                    findNavController().navigate(resId)
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }
}
