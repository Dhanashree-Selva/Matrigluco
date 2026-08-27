package com.matrigluco.feature.history.presentation

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
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
import com.matrigluco.feature.history.R
import com.matrigluco.feature.history.databinding.FragmentHistoryBinding
import com.matrigluco.feature.history.domain.model.ChronicleEvent
import com.matrigluco.feature.history.domain.model.ChronicleEventType
import com.matrigluco.feature.history.domain.model.ChronicleViewMode
import com.matrigluco.feature.history.presentation.adapter.ChronicleAdapter
import com.matrigluco.feature.history.presentation.sheet.ChronicleFilterSheet
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class HistoryFragment : Fragment() {

    private val viewModel: HistoryViewModel by viewModels()
    private var binding: FragmentHistoryBinding? = null

    private val adapter by lazy {
        ChronicleAdapter(
            onToggleGroup = { group -> viewModel.toggleDateGroup(group) },
            onOpenEvent = { event -> openEventDetail(event) }
        )
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = FragmentHistoryBinding.inflate(inflater, container, false).also {
        binding = it
    }.root

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val b = binding ?: return

        b.timelineRecyclerView.adapter = adapter
        b.timelineRecyclerView.itemAnimator = null

        b.swipeRefresh.setColorSchemeResources(DesignR.color.care_pink)
        b.swipeRefresh.setOnRefreshListener {
            viewModel.refresh()
        }

        setupSourceFilterTabs()
        setupViewModeToggle()
        setupFilterScopeButton()

        configureOrbitAppBar(
            OrbitAppBarConfig.detail(
                title = getString(R.string.history_title),
                eyebrow = getString(R.string.history_eyebrow),
                subtitle = getString(R.string.history_subtitle),
                actions = listOf(
                    OrbitAppBarAction.Filter {
                        showFilterDialog()
                    }
                ),
                onBackClick = { findNavController().navigateUp() }
            )
        )

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.state.collect(::render)
            }
        }
    }

    private fun setupSourceFilterTabs() {
        val b = binding ?: return
        val tabs = listOf(
            b.tabAll to ChronicleEventType.ALL,
            b.tabAssessments to ChronicleEventType.ASSESSMENT,
            b.tabReadings to ChronicleEventType.READING,
            b.tabReports to ChronicleEventType.REPORT,
            b.tabConsultations to ChronicleEventType.CONSULTATION
        )

        tabs.forEach { (view, type) ->
            view.setOnClickListener {
                viewModel.setSourceFilter(type)
            }
        }
    }

    private fun setupViewModeToggle() {
        val b = binding ?: return
        b.btnModeStory.setOnClickListener {
            viewModel.setViewMode(ChronicleViewMode.STORY)
        }
        b.btnModeEvents.setOnClickListener {
            viewModel.setViewMode(ChronicleViewMode.EVENTS)
        }
    }

    private fun setupFilterScopeButton() {
        val b = binding ?: return
        b.btnFilterScope.setOnClickListener {
            showFilterDialog()
        }
    }

    private fun showFilterDialog() {
        val state = viewModel.state.value
        ChronicleFilterSheet.show(
            context = requireContext(),
            currentType = state.selectedSource,
            currentMonth = state.selectedMonth,
            availableMonths = state.summary.availableMonths,
            onApply = { type, month ->
                viewModel.setSourceFilter(type)
                viewModel.setMonthFilter(month)
            }
        )
    }

    private fun render(state: HistoryUiState) {
        val b = binding ?: return
        val context = requireContext()

        b.swipeRefresh.isRefreshing = state.loading
        b.loadingProgress.visibility = if (state.loading && state.isEmpty) View.VISIBLE else View.GONE
        b.offlineBanner.visibility = if (state.isOffline) View.VISIBLE else View.GONE

        // 1. Summary card
        b.summaryTotalEventsBadge.text = getString(R.string.history_total_events, state.summary.totalEvents)
        b.countAssessments.text = state.summary.assessmentsCount.toString()
        b.countReadings.text = state.summary.readingsCount.toString()
        b.countReports.text = state.summary.reportsCount.toString()
        b.countConsultations.text = state.summary.consultationsCount.toString()

        // 2. Active filter text
        b.activeFilterLabel.text = state.selectedMonth?.let { formatMonth(it) } ?: "All Time"

        // 3. Source tabs selection styling
        updateTabStyles(state.selectedSource)

        // 4. View mode toggle styling
        updateViewModeStyles(state.viewMode)

        // 5. Timeline items vs Empty state
        if (state.isEmpty && !state.loading) {
            b.timelineRecyclerView.visibility = View.GONE
            b.emptyView.visibility = View.VISIBLE

            if (state.selectedSource == ChronicleEventType.ALL && state.selectedMonth == null) {
                b.emptyView.bind(
                    iconResource = DesignR.drawable.ic_huge_history_24,
                    emptyTitle = getString(R.string.history_empty_title),
                    truthfulReason = getString(R.string.history_empty_body)
                )
                b.emptyView.setPrimaryAction(null, null)
            } else {
                b.emptyView.bind(
                    iconResource = DesignR.drawable.ic_huge_filter_24,
                    emptyTitle = getString(R.string.history_empty_filtered_title),
                    truthfulReason = getString(R.string.history_empty_filtered_body)
                )
                b.emptyView.setPrimaryAction(getString(R.string.history_filter_reset)) {
                    viewModel.setSourceFilter(ChronicleEventType.ALL)
                    viewModel.setMonthFilter(null)
                }
            }
        } else {
            b.emptyView.visibility = View.GONE
            b.timelineRecyclerView.visibility = View.VISIBLE

            val timelineItems = mutableListOf<TimelineItem>()
            state.dateGroups.forEach { group ->
                timelineItems.add(TimelineItem.Header(group))
                if (group.isExpanded) {
                    val count = group.events.size
                    group.events.forEachIndexed { index, event ->
                        if (state.viewMode == ChronicleViewMode.STORY) {
                            timelineItems.add(
                                TimelineItem.EventStory(
                                    event = event,
                                    isFirstInGroup = index == 0,
                                    isLastInGroup = index == count - 1
                                )
                            )
                        } else {
                            timelineItems.add(TimelineItem.EventDense(event))
                        }
                    }
                }
            }
            adapter.submitList(timelineItems)
        }
    }

    private fun updateTabStyles(selected: ChronicleEventType) {
        val b = binding ?: return
        val activeColor = 0xFFFFFFFF.toInt()
        val inactiveColor = requireContext().getColor(DesignR.color.care_text_secondary)

        val tabs = listOf(
            b.tabAll to (selected == ChronicleEventType.ALL),
            b.tabAssessments to (selected == ChronicleEventType.ASSESSMENT),
            b.tabReadings to (selected == ChronicleEventType.READING),
            b.tabReports to (selected == ChronicleEventType.REPORT),
            b.tabConsultations to (selected == ChronicleEventType.CONSULTATION)
        )

        tabs.forEach { (view, isSelected) ->
            view.setBackgroundResource(
                if (isSelected) R.drawable.bg_chronicle_tab_active
                else R.drawable.bg_chronicle_tab_inactive
            )
            view.setTextColor(if (isSelected) activeColor else inactiveColor)
        }
    }

    private fun updateViewModeStyles(mode: ChronicleViewMode) {
        val b = binding ?: return
        val white = 0xFFFFFFFF.toInt()
        val secondary = requireContext().getColor(DesignR.color.care_text_secondary)

        if (mode == ChronicleViewMode.STORY) {
            b.btnModeStory.setBackgroundResource(R.drawable.bg_chronicle_tab_active)
            b.btnModeStory.setTextColor(white)
            b.btnModeEvents.background = null
            b.btnModeEvents.setTextColor(secondary)
        } else {
            b.btnModeEvents.setBackgroundResource(R.drawable.bg_chronicle_tab_active)
            b.btnModeEvents.setTextColor(white)
            b.btnModeStory.background = null
            b.btnModeStory.setTextColor(secondary)
        }
    }

    private fun openEventDetail(event: ChronicleEvent) {
        val context = context ?: return
        val basePkg = context.packageName.removeSuffix(".debug")

        val targetDestName = when (event) {
            is ChronicleEvent.Assessment -> "assessmentFragment"
            is ChronicleEvent.Reading -> "trackingFragment"
            is ChronicleEvent.Report -> "reportsFragment"
            is ChronicleEvent.Consultation -> "consultationsFragment"
        }

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

    private fun formatMonth(yyyyMm: String): String {
        return try {
            val parts = yyyyMm.split("-")
            val y = parts[0]
            val m = parts[1].toInt()
            val months = listOf(
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            )
            "${months[m - 1]} $y"
        } catch (_: Exception) {
            yyyyMm
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }
}
