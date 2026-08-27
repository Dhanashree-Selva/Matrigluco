package com.matrigluco.feature.tracking.presentation

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.datepicker.MaterialDatePicker
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarAction
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarConfig
import com.matrigluco.core.designsystem.component.appbar.configureOrbitAppBar
import com.matrigluco.feature.tracking.R
import com.matrigluco.feature.tracking.databinding.FragmentTrackingBinding
import com.matrigluco.feature.tracking.domain.model.HealthReading
import com.matrigluco.feature.tracking.domain.model.MetricType
import com.matrigluco.feature.tracking.domain.model.TrackingPeriod
import com.matrigluco.feature.tracking.domain.model.TrackingViewMode
import com.matrigluco.feature.tracking.presentation.adapter.RecordsAdapter
import com.matrigluco.feature.tracking.presentation.adapter.SignalSpineAdapter
import com.matrigluco.feature.tracking.presentation.sheet.QuickAddReadingSheet
import com.matrigluco.feature.tracking.presentation.sheet.ReadingDetailSheet
import com.matrigluco.feature.tracking.presentation.sheet.TrackingFilterSheet
import dagger.hilt.android.AndroidEntryPoint
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import kotlinx.coroutines.launch

@AndroidEntryPoint
class TrackingFragment : Fragment() {

    private val viewModel: TrackingViewModel by viewModels()
    private var binding: FragmentTrackingBinding? = null

    private lateinit var spineAdapter: SignalSpineAdapter
    private lateinit var recordsAdapter: RecordsAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = FragmentTrackingBinding.inflate(inflater, container, false).also { binding = it }.root

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerViews()
        setupListeners()

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.state.collect(::render)
            }
        }
    }

    private fun setupRecyclerViews() {
        val b = binding ?: return

        spineAdapter = SignalSpineAdapter { reading ->
            showReadingDetail(reading)
        }
        b.timelineRecyclerView.layoutManager = LinearLayoutManager(requireContext())
        b.timelineRecyclerView.adapter = spineAdapter

        recordsAdapter = RecordsAdapter { reading ->
            showReadingDetail(reading)
        }
        b.recordsRecyclerView.layoutManager = LinearLayoutManager(requireContext())
        b.recordsRecyclerView.adapter = recordsAdapter
    }

    private fun setupListeners() {
        val b = binding ?: return

        b.metricSelectorCard.setOnClickListener {
            showFilterSheet()
        }

        b.periodSelector.setOnPeriodSelectedListener { period ->
            viewModel.setPeriod(period)
        }

        b.periodSelector.setOnCustomDateClickListener {
            showCustomDateRangePicker()
        }

        b.periodSelector.setOnViewModeSelectedListener { mode ->
            viewModel.setViewMode(mode)
        }

        b.btnAddReadingSpine.setOnClickListener {
            showQuickAddSheet()
        }
    }

    private fun render(state: TrackingUiState) {
        val b = binding ?: return

        b.loadingIndicator.visibility = if (state is TrackingUiState.Loading) View.VISIBLE else View.GONE

        when (state) {
            is TrackingUiState.Content -> renderModel(state.model)
            is TrackingUiState.Offline -> renderModel(state.model)
            is TrackingUiState.Error -> {
                if (state.model != null) {
                    renderModel(state.model)
                }
            }
            TrackingUiState.Loading -> Unit
        }
    }

    private fun renderModel(model: TrackingUiModel) {
        val b = binding ?: return

        // 1. Configure OrbitAppBar
        val isFilterActive = model.selectedMetric.type != MetricType.GLUCOSE || model.selectedPeriod != TrackingPeriod.THIRTY_DAYS
        configureOrbitAppBar(
            OrbitAppBarConfig.root(
                title = "Health Tracking",
                eyebrow = "YOUR TIMELINE",
                badgeText = model.selectedMetric.shortName.uppercase(Locale.US),
                subtitle = "Longitudinal telemetry stream",
                actions = listOf(
                    OrbitAppBarAction.Filter(
                        isFiltered = isFilterActive,
                        onClick = { showFilterSheet() }
                    )
                )
            )
        )

        // 2. Metric Selector Card
        b.metricSelectorCard.bind(model.selectedMetric, model.latestReading)

        // 3. Period & View Mode Controls
        val customRangeStr = if (model.selectedPeriod == TrackingPeriod.CUSTOM &&
            model.filter.customDateStartEpochMillis != null &&
            model.filter.customDateEndEpochMillis != null
        ) {
            val s = formatDateCompact(model.filter.customDateStartEpochMillis)
            val e = formatDateCompact(model.filter.customDateEndEpochMillis)
            "$s–$e"
        } else {
            null
        }
        b.periodSelector.setPeriod(model.selectedPeriod, customRangeStr)
        b.periodSelector.setViewMode(model.viewMode)

        // 4. Signal Summary Card
        b.signalSummaryCard.bind(model.summary)

        // 5. Trend Card vs Records Mode
        if (model.viewMode == TrackingViewMode.CHART) {
            b.trendCard.visibility = View.VISIBLE
            b.recordsCard.visibility = View.GONE
            b.trendCard.bind(model.selectedMetric, model.summary, model.chartPoints)
        } else {
            b.trendCard.visibility = View.GONE
            b.recordsCard.visibility = View.VISIBLE
            recordsAdapter.submitList(model.recordsList)
        }

        // 6. Signal Spine Timeline
        if (model.timelineItems.isNotEmpty()) {
            b.timelineRecyclerView.visibility = View.VISIBLE
            b.timelineEmptyView.visibility = View.GONE
            spineAdapter.submitList(model.timelineItems)
        } else {
            b.timelineRecyclerView.visibility = View.GONE
            b.timelineEmptyView.visibility = View.VISIBLE
        }
    }

    private fun showFilterSheet() {
        val currentState = (viewModel.state.value as? TrackingUiState.Content)?.model?.selectedMetric?.type
            ?: (viewModel.state.value as? TrackingUiState.Offline)?.model?.selectedMetric?.type
            ?: MetricType.GLUCOSE

        val sheet = TrackingFilterSheet.newInstance(currentState)
        sheet.setOnApplyFilterListener { selectedType ->
            viewModel.setMetric(selectedType)
        }
        sheet.setOnResetFilterListener {
            viewModel.setMetric(MetricType.GLUCOSE)
            viewModel.setPeriod(TrackingPeriod.THIRTY_DAYS)
        }
        sheet.show(childFragmentManager, TrackingFilterSheet.TAG)
    }

    private fun showQuickAddSheet() {
        val currentMetric = (viewModel.state.value as? TrackingUiState.Content)?.model?.selectedMetric?.type
            ?: (viewModel.state.value as? TrackingUiState.Offline)?.model?.selectedMetric?.type
            ?: MetricType.GLUCOSE

        val sheet = QuickAddReadingSheet.newInstance(currentMetric)
        sheet.setOnSaveListener { metricType, primary, secondary, unit, notes ->
            viewModel.addReading(metricType, primary, secondary, unit, notes)
        }
        sheet.show(childFragmentManager, QuickAddReadingSheet.TAG)
    }

    private fun showReadingDetail(reading: HealthReading) {
        val sheet = ReadingDetailSheet.newInstance(reading)
        sheet.setOnDeleteListener { r ->
            viewModel.deleteReading(r)
        }
        sheet.show(childFragmentManager, ReadingDetailSheet.TAG)
    }

    private fun showCustomDateRangePicker() {
        val picker = MaterialDatePicker.Builder.dateRangePicker()
            .setTitleText("Select Custom Period")
            .setTheme(com.matrigluco.core.designsystem.R.style.Orbit_MaterialDatePicker)
            .build()

        picker.addOnPositiveButtonClickListener { range ->
            if (range.first != null && range.second != null) {
                viewModel.setCustomRange(range.first!!, range.second!!)
            }
        }
        picker.show(childFragmentManager, "CustomDatePicker")
    }

    private fun formatDateCompact(epochMillis: Long): String {
        val sdf = SimpleDateFormat("MMM d", Locale.US).apply { timeZone = TimeZone.getDefault() }
        return sdf.format(Date(epochMillis))
    }

    override fun onDestroyView() {
        binding = null
        super.onDestroyView()
    }
}
