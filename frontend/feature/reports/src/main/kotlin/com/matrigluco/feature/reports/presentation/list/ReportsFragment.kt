package com.matrigluco.feature.reports.presentation.list

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.widget.PopupMenu
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.matrigluco.core.designsystem.R as DesignR
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarAction
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarConfig
import com.matrigluco.core.designsystem.component.appbar.configureOrbitAppBar
import com.matrigluco.feature.reports.R
import com.matrigluco.feature.reports.databinding.FragmentReportsBinding
import com.matrigluco.feature.reports.domain.model.MedicalReport
import com.matrigluco.feature.reports.domain.model.ReportFilter
import com.matrigluco.feature.reports.domain.model.ReportFileType
import com.matrigluco.feature.reports.presentation.sheet.ReportSheets
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream

@AndroidEntryPoint
class ReportsFragment : Fragment() {

    private val viewModel: ReportsViewModel by viewModels()
    private var binding: FragmentReportsBinding? = null

    private var pendingPickedUri: Uri? = null
    private var pendingFileName: String? = null
    private var pendingFileSizeText: String? = null
    private var pendingFileType: ReportFileType? = null

    private val documentPicker = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            handlePickedUri(uri, ReportFileType.PDF)
        }
    }

    private val imagePicker = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            handlePickedUri(uri, ReportFileType.IMAGE)
        }
    }

    private val adapter by lazy {
        ReportsAdapter(
            onViewReport = ::showReportDetail,
            onDownloadPdf = ::downloadAndSharePdf,
            onMenuClick = ::showReportOptionsMenu
        )
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = FragmentReportsBinding.inflate(inflater, container, false).also {
        binding = it
    }.root

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val b = binding ?: return

        b.reportsRecyclerView.adapter = adapter

        b.swipeRefresh.setOnRefreshListener {
            viewModel.refreshReports()
        }

        // State Selector Tabs
        b.tabAll.setOnClickListener { viewModel.setFilter(ReportFilter.ALL) }
        b.tabNeedsReview.setOnClickListener { viewModel.setFilter(ReportFilter.NEEDS_REVIEW) }
        b.tabReviewed.setOnClickListener { viewModel.setFilter(ReportFilter.REVIEWED) }

        // Primary Upload Button
        b.btnUploadReport.setOnClickListener {
            showUploadDialog()
        }

        // Configure Canonical OrbitAppBar
        configureOrbitAppBar(
            OrbitAppBarConfig.detail(
                title = getString(R.string.reports_title),
                eyebrow = getString(R.string.reports_eyebrow),
                subtitle = getString(R.string.reports_subtitle),
                actions = listOf(
                    OrbitAppBarAction.Custom(
                        id = "action_upload",
                        iconRes = DesignR.drawable.ic_huge_add_24,
                        contentDescription = getString(R.string.reports_upload_action),
                        onClick = { showUploadDialog() }
                    )
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

    private fun render(state: ReportsUiState) {
        val b = binding ?: return

        b.swipeRefresh.isRefreshing = state.loading && state.reports.isNotEmpty()
        b.loadingProgress.visibility = if (state.loading && state.reports.isEmpty()) View.VISIBLE else View.GONE
        b.offlineBanner.visibility = if (state.isOffline) View.VISIBLE else View.GONE

        // Update Vault Summary
        b.vaultTotalBadge.text = "${state.counts.all} recorded reports"
        if (state.counts.needsReview > 0) {
            b.needsReviewBanner.visibility = View.VISIBLE
            b.needsReviewBannerText.text = "${state.counts.needsReview} reports require biomarker review"
        } else {
            b.needsReviewBanner.visibility = View.GONE
        }

        // Update State Selector Tabs
        b.tabAll.text = "ALL ${state.counts.all}"
        b.tabNeedsReview.text = "NEEDS REVIEW ${state.counts.needsReview}"
        b.tabReviewed.text = "REVIEWED ${state.counts.reviewed}"

        updateTabHighlight(state.selectedFilter)

        // List vs Empty State
        if (state.filteredReports.isEmpty() && !state.loading) {
            b.reportsRecyclerView.visibility = View.GONE
            b.emptyView.visibility = View.VISIBLE
            when (state.selectedFilter) {
                ReportFilter.ALL -> {
                    b.emptyView.bind(
                        iconResource = DesignR.drawable.ic_huge_document_24,
                        emptyTitle = getString(R.string.reports_empty_title),
                        truthfulReason = getString(R.string.reports_empty_desc)
                    )
                    b.emptyView.setPrimaryAction(getString(R.string.reports_upload_action)) { showUploadDialog() }
                }
                ReportFilter.NEEDS_REVIEW -> {
                    b.emptyView.bind(
                        iconResource = DesignR.drawable.ic_huge_warning_24,
                        emptyTitle = getString(R.string.reports_empty_needs_review_title),
                        truthfulReason = getString(R.string.reports_empty_needs_review_desc)
                    )
                    b.emptyView.setPrimaryAction(null, null)
                }
                ReportFilter.REVIEWED -> {
                    b.emptyView.bind(
                        iconResource = DesignR.drawable.ic_huge_check_24,
                        emptyTitle = getString(R.string.reports_empty_reviewed_title),
                        truthfulReason = getString(R.string.reports_empty_reviewed_desc)
                    )
                    b.emptyView.setPrimaryAction(null, null)
                }
            }
        } else {
            b.emptyView.visibility = View.GONE
            b.reportsRecyclerView.visibility = View.VISIBLE
            adapter.submitList(state.filteredReports)
        }
    }

    private fun updateTabHighlight(selected: ReportFilter) {
        val b = binding ?: return
        val context = requireContext()

        val activeBg = R.drawable.bg_state_selector_tab_active
        val inactiveBg = R.drawable.bg_state_selector_tab_inactive
        val activeColor = ContextCompat.getColor(context, android.R.color.white)
        val inactiveColor = ContextCompat.getColor(context, DesignR.color.care_text_secondary)

        b.tabAll.setBackgroundResource(if (selected == ReportFilter.ALL) activeBg else inactiveBg)
        b.tabAll.setTextColor(if (selected == ReportFilter.ALL) activeColor else inactiveColor)

        b.tabNeedsReview.setBackgroundResource(if (selected == ReportFilter.NEEDS_REVIEW) activeBg else inactiveBg)
        b.tabNeedsReview.setTextColor(if (selected == ReportFilter.NEEDS_REVIEW) activeColor else inactiveColor)

        b.tabReviewed.setBackgroundResource(if (selected == ReportFilter.REVIEWED) activeBg else inactiveBg)
        b.tabReviewed.setTextColor(if (selected == ReportFilter.REVIEWED) activeColor else inactiveColor)
    }

    private fun showUploadDialog() {
        ReportSheets.showUploadSheet(
            context = requireContext(),
            onPickDocument = { documentPicker.launch("application/pdf") },
            onPickImage = { imagePicker.launch("image/*") },
            selectedFileName = pendingFileName,
            selectedFileSizeText = pendingFileSizeText,
            selectedFileType = pendingFileType,
            onClearSelection = {
                pendingPickedUri = null
                pendingFileName = null
                pendingFileSizeText = null
                pendingFileType = null
            },
            onConfirmUpload = {
                executeUpload()
            }
        )
    }

    private fun handlePickedUri(uri: Uri, fileType: ReportFileType) {
        pendingPickedUri = uri
        pendingFileType = fileType

        val contentResolver = requireContext().contentResolver
        var name = "Medical_Report_${System.currentTimeMillis()}"
        var sizeBytes = 0L

        contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
                val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                val sizeIndex = cursor.getColumnIndex(android.provider.OpenableColumns.SIZE)
                if (nameIndex != -1) name = cursor.getString(nameIndex) ?: name
                if (sizeIndex != -1) sizeBytes = cursor.getLong(sizeIndex)
            }
        }

        pendingFileName = name
        val sizeKb = sizeBytes / 1024
        pendingFileSizeText = if (sizeKb > 1024) "${sizeKb / 1024} MB" else "$sizeKb KB"

        showUploadDialog()
    }

    private fun executeUpload() {
        val uri = pendingPickedUri ?: return
        val filename = pendingFileName ?: "report.pdf"
        val mimeType = if (filename.endsWith(".pdf", ignoreCase = true)) "application/pdf" else "image/png"

        try {
            val bytes = requireContext().contentResolver.openInputStream(uri)?.use { it.readBytes() }
            if (bytes == null || bytes.isEmpty()) {
                Toast.makeText(requireContext(), "Could not read selected file.", Toast.LENGTH_SHORT).show()
                return
            }

            viewModel.uploadReport(
                fileBytes = bytes,
                filename = filename,
                mimeType = mimeType,
                onSuccess = {
                    pendingPickedUri = null
                    pendingFileName = null
                    pendingFileSizeText = null
                    Toast.makeText(requireContext(), "Report uploaded successfully.", Toast.LENGTH_SHORT).show()
                },
                onError = { error ->
                    Toast.makeText(requireContext(), error, Toast.LENGTH_LONG).show()
                }
            )
        } catch (e: Exception) {
            Toast.makeText(requireContext(), "Error reading file: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showReportDetail(report: MedicalReport) {
        ReportSheets.showDetailSheet(
            context = requireContext(),
            report = report,
            onDownloadPdf = { downloadAndSharePdf(report) },
            onReviewClick = {
                ReportSheets.showReviewSheet(
                    context = requireContext(),
                    report = report,
                    onSave = { updatedValues ->
                        viewModel.updateReportBiomarkers(
                            reportId = report.id,
                            extractedValues = updatedValues,
                            onSuccess = { Toast.makeText(requireContext(), "Biomarkers updated.", Toast.LENGTH_SHORT).show() },
                            onError = { Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show() }
                        )
                    }
                )
            },
            onDeleteClick = {
                confirmDeleteReport(report)
            }
        )
    }

    private fun showReportOptionsMenu(report: MedicalReport, anchor: View) {
        val popup = PopupMenu(requireContext(), anchor)
        popup.menu.add(0, 1, 0, getString(R.string.reports_view_report))
        popup.menu.add(0, 2, 1, getString(R.string.reports_download_pdf))
        popup.menu.add(0, 3, 2, getString(R.string.reports_delete))

        popup.setOnMenuItemClickListener { menuItem ->
            when (menuItem.itemId) {
                1 -> showReportDetail(report)
                2 -> downloadAndSharePdf(report)
                3 -> confirmDeleteReport(report)
            }
            true
        }
        popup.show()
    }

    private fun confirmDeleteReport(report: MedicalReport) {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle(getString(R.string.reports_delete_confirm_title))
            .setMessage(getString(R.string.reports_delete_confirm_desc))
            .setPositiveButton(getString(R.string.reports_delete)) { _, _ ->
                viewModel.deleteReport(
                    reportId = report.id,
                    onSuccess = { Toast.makeText(requireContext(), "Report deleted.", Toast.LENGTH_SHORT).show() },
                    onError = { Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show() }
                )
            }
            .setNegativeButton(android.R.string.cancel, null)
            .show()
    }

    private fun downloadAndSharePdf(report: MedicalReport) {
        viewLifecycleOwner.lifecycleScope.launch {
            Toast.makeText(requireContext(), "Downloading clinical PDF…", Toast.LENGTH_SHORT).show()
            val result = viewModel.downloadPdf(report.id)
            result.onSuccess { bytes ->
                try {
                    val cacheDir = File(requireContext().cacheDir, "reports").apply { mkdirs() }
                    val file = File(cacheDir, "Clinical_Report_${report.id.take(6)}.pdf")
                    FileOutputStream(file).use { it.write(bytes) }

                    val uri = FileProvider.getUriForFile(
                        requireContext(),
                        "${requireContext().packageName}.fileprovider",
                        file
                    )
                    val viewIntent = Intent(Intent.ACTION_VIEW).apply {
                        setDataAndType(uri, "application/pdf")
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    startActivity(Intent.createChooser(viewIntent, "Open Medical Report PDF"))
                } catch (e: Exception) {
                    Toast.makeText(requireContext(), "Downloaded PDF (${bytes.size / 1024} KB).", Toast.LENGTH_SHORT).show()
                }
            }.onFailure {
                Toast.makeText(requireContext(), "Failed to download PDF.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }
}
