package com.matrigluco.feature.dashboard.presentation

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarConfig
import com.matrigluco.core.designsystem.component.appbar.configureOrbitAppBar
import com.matrigluco.core.designsystem.icon.OrbitIcon
import com.matrigluco.feature.dashboard.R
import com.matrigluco.feature.dashboard.databinding.FragmentDashboardBinding
import com.matrigluco.feature.dashboard.databinding.ItemDashboardActivityBinding
import com.matrigluco.feature.dashboard.domain.ActivitySnapshot
import dagger.hilt.android.AndroidEntryPoint
import java.util.Calendar
import java.util.Locale
import kotlinx.coroutines.launch

@AndroidEntryPoint
class DashboardFragment : Fragment() {
    private val viewModel: DashboardViewModel by viewModels()
    private var binding: FragmentDashboardBinding? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        state: Bundle?
    ): View = FragmentDashboardBinding.inflate(inflater, container, false).also { binding = it }.root

    override fun onViewCreated(view: View, state: Bundle?) {
        binding?.retry?.setOnClickListener { viewModel.refresh() }

        setupNavigationListeners()

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.state.collect(::render)
            }
        }
    }

    private fun setupNavigationListeners() {
        val b = binding ?: return

        // 1. Add Health Measurement CTA
        b.addMeasurementButton.setOnClickListener {
            navigateToDestination("trackingFragment")
        }

        // 2. Four Pillars Navigation
        b.pillarAssess.setOnClickListener {
            navigateToDestination("reportsFragment")
        }
        b.pillarTrack.setOnClickListener {
            navigateToDestination("trackingFragment")
        }
        b.pillarUnderstand.setOnClickListener {
            navigateToDestination("reportsFragment")
        }
        b.pillarConsult.setOnClickListener {
            navigateToDestination("assistantFragment")
        }

        // 3. View All Readings Header Link
        b.viewAllMetrics.setOnClickListener {
            navigateToDestination("historyFragment")
        }

        // 4. Metric Capsules Navigation
        b.metricGlucose.setOnClickListener {
            navigateToDestination("trackingFragment")
        }
        b.metricBp.setOnClickListener {
            navigateToDestination("trackingFragment")
        }
        b.metricWeight.setOnClickListener {
            navigateToDestination("trackingFragment")
        }
        b.metricBmi.setOnClickListener {
            navigateToDestination("trackingFragment")
        }

        // 5. Product Care Journey Navigation
        b.journeyTrack.setOnClickListener {
            navigateToDestination("trackingFragment")
        }
        b.journeyAssess.setOnClickListener {
            navigateToDestination("reportsFragment")
        }
        b.journeyUnderstand.setOnClickListener {
            navigateToDestination("reportsFragment")
        }
        b.journeyConsult.setOnClickListener {
            navigateToDestination("assistantFragment")
        }
    }

    private fun navigateToDestination(destinationIdName: String) {
        val context = context ?: return
        val basePkg = context.packageName.removeSuffix(".debug")
        var resId = resources.getIdentifier(destinationIdName, "id", basePkg)
        if (resId == 0) {
            resId = resources.getIdentifier(destinationIdName, "id", context.packageName)
        }
        if (resId != 0) {
            runCatching {
                findNavController().navigate(resId)
            }
        }
    }

    private fun render(state: DashboardUiState) {
        val b = binding ?: return
        b.loading.visibility = if (state is DashboardUiState.Loading) View.VISIBLE else View.GONE
        b.content.visibility = if (state is DashboardUiState.Content) View.VISIBLE else View.GONE
        b.empty.visibility = if (state is DashboardUiState.Empty || state is DashboardUiState.Offline || state is DashboardUiState.Error) View.VISIBLE else View.GONE
        b.retry.visibility = if (state is DashboardUiState.Offline || state is DashboardUiState.Error) View.VISIBLE else View.GONE

        when (state) {
            is DashboardUiState.Content -> {
                val snapshot = state.snapshot
                val prediction = snapshot.prediction

                val assessmentDate = prediction?.createdAt?.let { formatIsoDate(it) } ?: "Aug 18, 2026"
                val greeting = getGreetingText(snapshot.userName)

                // 1. Configure Canonical OrbitAppBar
                configureOrbitAppBar(
                    OrbitAppBarConfig.root(
                        title = greeting,
                        eyebrow = "CARE ORBIT WORKSPACE",
                        badgeText = "WEEK 27",
                        subtitle = "Assessed $assessmentDate"
                    )
                )

                // 2. Health Overview Card
                if (prediction != null) {
                    val riskBand = prediction.riskBand.lowercase()
                    val riskBandCapitalized = riskBand.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.US) else it.toString() }
                    b.riskBandBadge.text = "$riskBandCapitalized Risk Band"

                    val riskColor = when (riskBand) {
                        "high" -> ContextCompat.getColor(requireContext(), com.matrigluco.core.designsystem.R.color.care_danger)
                        "moderate" -> ContextCompat.getColor(requireContext(), com.matrigluco.core.designsystem.R.color.care_warning)
                        else -> ContextCompat.getColor(requireContext(), com.matrigluco.core.designsystem.R.color.care_success)
                    }
                    b.riskBandBadge.setTextColor(riskColor)
                    b.overviewNarrative.text = "Latest clinical risk assessment indicates $riskBand risk band ($assessmentDate). You have ${snapshot.totalMeasurements7Days} measurements recorded in the last 7 days."
                    b.pillarAssessSub.text = "$riskBandCapitalized Risk"
                } else {
                    b.riskBandBadge.text = "Low Risk Band"
                    b.riskBandBadge.setTextColor(ContextCompat.getColor(requireContext(), com.matrigluco.core.designsystem.R.color.care_success))
                    b.overviewNarrative.text = "Latest clinical overview indicates low risk band ($assessmentDate). You have ${snapshot.totalMeasurements7Days} measurements recorded in the last 7 days."
                    b.pillarAssessSub.text = "Low Risk"
                }

                // 3. Telemetry Metrics (Signal Capsules from Database)
                val glucose = snapshot.measurements.firstOrNull { it.metric.contains("glucose", ignoreCase = true) }
                val bp = snapshot.measurements.firstOrNull { it.metric.contains("pressure", ignoreCase = true) }
                val weight = snapshot.measurements.firstOrNull { it.metric.contains("weight", ignoreCase = true) }
                val bmi = snapshot.measurements.firstOrNull { it.metric.contains("bmi", ignoreCase = true) || it.metric.contains("hba1c", ignoreCase = true) }

                b.metricGlucose.bind(
                    glucose?.displayName ?: "Blood Glucose",
                    glucose?.value ?: "--",
                    glucose?.unit?.ifBlank { "mg/dL" } ?: "mg/dL",
                    formatIsoDate(glucose?.measuredAt)
                )

                b.metricBp.bind(
                    bp?.displayName ?: "Blood Pressure",
                    bp?.value ?: "--",
                    bp?.unit?.ifBlank { "mmHg" } ?: "mmHg",
                    formatIsoDate(bp?.measuredAt)
                )

                b.metricWeight.bind(
                    weight?.displayName ?: "Maternal Weight",
                    weight?.value ?: "--",
                    weight?.unit?.ifBlank { "kg" } ?: "kg",
                    formatIsoDate(weight?.measuredAt)
                )

                b.metricBmi.bind(
                    bmi?.displayName ?: "Body Mass Index",
                    bmi?.value ?: "--",
                    bmi?.unit?.ifBlank { "kg/m²" } ?: "kg/m²",
                    formatIsoDate(bmi?.measuredAt)
                )

                b.pillarTrackSub.text = if (glucose != null) {
                    "${glucose.value} ${glucose.unit}".trim()
                } else {
                    "No logs yet"
                }

                b.metricCountSubtitle.text = if (snapshot.measurements.isNotEmpty()) {
                    "${snapshot.measurements.size} recent measurement types recorded (${snapshot.totalMeasurements7Days} in last 7 days)"
                } else {
                    "Recent metabolic readings and clinical telemetry"
                }

                // 4. Recent Care Activity Timeline (Live database events)
                b.activityContainer.removeAllViews()
                if (snapshot.recentActivities.isNotEmpty()) {
                    for (activity in snapshot.recentActivities) {
                        val itemBinding = ItemDashboardActivityBinding.inflate(layoutInflater, b.activityContainer, false)
                        itemBinding.activityTitle.text = activity.title
                        itemBinding.activityDesc.text = activity.description
                        itemBinding.activityDate.text = formatIsoDate(activity.timestamp)

                        val iconRes = when (activity.type.lowercase()) {
                            "report" -> com.matrigluco.core.designsystem.R.drawable.ic_huge_document_24
                            "consultation" -> com.matrigluco.core.designsystem.R.drawable.ic_huge_calendar_24
                            "assessment" -> com.matrigluco.core.designsystem.R.drawable.ic_huge_assessment_24
                            else -> com.matrigluco.core.designsystem.R.drawable.ic_huge_activity_24
                        }
                        itemBinding.activityIcon.setImageResource(iconRes)

                        itemBinding.root.isClickable = true
                        itemBinding.root.isFocusable = true
                        itemBinding.root.setOnClickListener {
                            when (activity.type.lowercase()) {
                                "report" -> navigateToDestination("reportsFragment")
                                "consultation" -> navigateToDestination("consultationsFragment")
                                "assessment" -> navigateToDestination("reportsFragment")
                                else -> navigateToDestination("trackingFragment")
                            }
                        }

                        b.activityContainer.addView(itemBinding.root)
                    }
                } else {
                    val emptyTv = TextView(requireContext()).apply {
                        text = "No recent care activities logged yet."
                        setTextAppearance(com.matrigluco.core.designsystem.R.style.Orbit_Text_Caption)
                        setTextColor(ContextCompat.getColor(context, com.matrigluco.core.designsystem.R.color.care_text_muted))
                        val p = resources.getDimensionPixelSize(com.matrigluco.core.designsystem.R.dimen.orbit_space_12)
                        setPadding(p, p, p, p)
                    }
                    b.activityContainer.addView(emptyTv)
                }
            }
            DashboardUiState.Empty -> b.empty.bind(
                OrbitIcon.Home.drawableRes,
                getString(R.string.dashboard_empty_title),
                getString(R.string.dashboard_empty_body)
            )
            is DashboardUiState.Offline -> b.empty.bind(
                OrbitIcon.Offline.drawableRes,
                getString(R.string.dashboard_offline_title),
                getString(R.string.dashboard_offline_body)
            )
            is DashboardUiState.Error -> b.empty.bind(
                OrbitIcon.Warning.drawableRes,
                getString(R.string.dashboard_error_title),
                getString(R.string.dashboard_error_body)
            )
            DashboardUiState.Loading -> Unit
        }
    }

    private fun getGreetingText(fullName: String?): String {
        val name = fullName?.trim()?.ifBlank { null } ?: "Mama"
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        val greeting = when {
            hour < 12 -> "Good morning"
            hour < 17 -> "Good afternoon"
            else -> "Good evening"
        }
        return "$greeting, $name"
    }

    private fun formatIsoDate(iso: String?): String {
        if (iso.isNullOrBlank()) return "Aug 18, 2026"
        return try {
            val datePart = if (iso.contains("T")) iso.substringBefore("T") else iso
            val parts = datePart.split("-")
            if (parts.size == 3) {
                val year = parts[0].toInt()
                val month = parts[1].toInt()
                val day = parts[2].toInt()
                val monthNames = arrayOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
                val monthStr = if (month in 1..12) monthNames[month - 1] else "Aug"
                "$monthStr $day, $year"
            } else {
                "Aug 18, 2026"
            }
        } catch (_: Exception) {
            "Aug 18, 2026"
        }
    }

    override fun onDestroyView() {
        binding = null
        super.onDestroyView()
    }
}
