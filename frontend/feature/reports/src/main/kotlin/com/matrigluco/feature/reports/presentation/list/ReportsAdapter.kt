package com.matrigluco.feature.reports.presentation.list

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.matrigluco.core.designsystem.R as DesignR
import com.matrigluco.feature.reports.R
import com.matrigluco.feature.reports.databinding.ItemExtractedValueRowBinding
import com.matrigluco.feature.reports.databinding.ItemReportCardBinding
import com.matrigluco.feature.reports.domain.model.MedicalReport
import com.matrigluco.feature.reports.domain.model.ReportFileType
import com.matrigluco.feature.reports.domain.model.ReportProcessingStage
import com.matrigluco.feature.reports.domain.model.ReportStatus
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class ReportsAdapter(
    private val onViewReport: (MedicalReport) -> Unit,
    private val onDownloadPdf: (MedicalReport) -> Unit,
    private val onMenuClick: (MedicalReport, View) -> Unit
) : ListAdapter<MedicalReport, ReportsAdapter.ReportViewHolder>(ReportDiff) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ReportViewHolder {
        val binding = ItemReportCardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ReportViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ReportViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ReportViewHolder(
        private val binding: ItemReportCardBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: MedicalReport) {
            val context = binding.root.context

            // 1. File Name and Meta
            binding.reportFileName.text = item.fileName
            val typePrefix = when (item.fileType) {
                ReportFileType.PDF -> "PDF"
                ReportFileType.IMAGE -> "IMAGE"
                ReportFileType.UNKNOWN -> "FILE"
            }
            val formattedDate = formatIsoDate(item.uploadedAt)
            binding.reportUploadedMeta.text = "$typePrefix · Uploaded $formattedDate"

            // 2. File Type Icon
            when (item.fileType) {
                ReportFileType.PDF -> binding.reportTypeIcon.setImageResource(DesignR.drawable.ic_huge_document_24)
                ReportFileType.IMAGE -> binding.reportTypeIcon.setImageResource(DesignR.drawable.ic_huge_report_24)
                ReportFileType.UNKNOWN -> binding.reportTypeIcon.setImageResource(DesignR.drawable.ic_huge_document_24)
            }

            // 3. Status Chip
            when (item.status) {
                ReportStatus.REVIEWED -> {
                    binding.reportStatusChip.setBackgroundResource(R.drawable.bg_status_chip_reviewed)
                    binding.reportStatusChip.setTextColor(ContextCompat.getColor(context, DesignR.color.care_success))
                    binding.reportStatusChip.text = "✓ " + context.getString(R.string.reports_status_reviewed)
                }
                ReportStatus.NEEDS_REVIEW -> {
                    binding.reportStatusChip.setBackgroundResource(R.drawable.bg_status_chip_needs_review)
                    binding.reportStatusChip.setTextColor(ContextCompat.getColor(context, DesignR.color.care_pink))
                    binding.reportStatusChip.text = "⚠ " + context.getString(R.string.reports_status_needs_review)
                }
                ReportStatus.PROCESSING -> {
                    binding.reportStatusChip.setBackgroundResource(R.drawable.bg_status_chip_reviewed)
                    binding.reportStatusChip.setTextColor(ContextCompat.getColor(context, DesignR.color.care_warning))
                    binding.reportStatusChip.text = "⏳ " + context.getString(R.string.reports_status_processing)
                }
                ReportStatus.QUEUED -> {
                    binding.reportStatusChip.setBackgroundResource(R.drawable.bg_status_chip_reviewed)
                    binding.reportStatusChip.setTextColor(ContextCompat.getColor(context, DesignR.color.care_text_secondary))
                    binding.reportStatusChip.text = context.getString(R.string.reports_status_queued)
                }
                ReportStatus.FAILED -> {
                    binding.reportStatusChip.setBackgroundResource(R.drawable.bg_status_chip_reviewed)
                    binding.reportStatusChip.setTextColor(ContextCompat.getColor(context, DesignR.color.care_danger))
                    binding.reportStatusChip.text = "✕ " + context.getString(R.string.reports_status_failed)
                }
            }

            // 4. Processing Journey Stages
            val step = item.stage.stepNumber
            bindStageStep(binding.stageDot1, binding.stageText1, step >= 1)
            bindStageLine(binding.stageLine1, step >= 2)
            bindStageStep(binding.stageDot2, binding.stageText2, step >= 2)
            bindStageLine(binding.stageLine2, step >= 3)
            bindStageStep(binding.stageDot3, binding.stageText3, step >= 3)
            bindStageLine(binding.stageLine3, step >= 4)
            bindStageStep(binding.stageDot4, binding.stageText4, step >= 4)

            // 5. Extracted Values Preview
            binding.extractedValuesList.removeAllViews()
            if (item.extractedBiomarkers.isNotEmpty()) {
                binding.extractedValuesContainer.visibility = View.VISIBLE
                val inflater = LayoutInflater.from(context)

                // Show top 3 biomarkers
                val previewItems = item.extractedBiomarkers.take(3)
                for (bio in previewItems) {
                    val row = ItemExtractedValueRowBinding.inflate(inflater, binding.extractedValuesList, false)
                    row.biomarkerName.text = bio.name + ":"
                    row.biomarkerValue.text = "${bio.value} ${bio.unit}".trim()
                    if (bio.isAbnormal) {
                        row.biomarkerValue.setTextColor(ContextCompat.getColor(context, DesignR.color.care_pink))
                    } else {
                        row.biomarkerValue.setTextColor(ContextCompat.getColor(context, DesignR.color.care_text_primary))
                    }
                    binding.extractedValuesList.addView(row.root)
                }

                // If more than 3, show +N more
                if (item.extractedBiomarkers.size > 3) {
                    val remaining = item.extractedBiomarkers.size - 3
                    val row = ItemExtractedValueRowBinding.inflate(inflater, binding.extractedValuesList, false)
                    row.biomarkerName.text = context.getString(R.string.reports_more_values, remaining)
                    row.biomarkerName.setTextColor(ContextCompat.getColor(context, DesignR.color.care_pink))
                    row.biomarkerValue.text = ""
                    binding.extractedValuesList.addView(row.root)
                }
            } else {
                binding.extractedValuesContainer.visibility = View.GONE
            }

            // 6. Action Button Listeners
            binding.btnViewReport.setOnClickListener { onViewReport(item) }
            binding.btnDownloadPdf.setOnClickListener { onDownloadPdf(item) }
            binding.btnReportMenu.setOnClickListener { onMenuClick(item, it) }
        }

        private fun bindStageStep(dot: View, text: View, active: Boolean) {
            dot.setBackgroundResource(if (active) R.drawable.bg_journey_step_dot_completed else R.drawable.bg_journey_step_dot_pending)
            text.alpha = if (active) 1.0f else 0.45f
        }

        private fun bindStageLine(line: View, active: Boolean) {
            val color = if (active) DesignR.color.care_pink else DesignR.color.care_border
            line.setBackgroundColor(ContextCompat.getColor(line.context, color))
        }

        private fun formatIsoDate(iso: String): String {
            return try {
                val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                }
                val date = parser.parse(iso) ?: return iso
                SimpleDateFormat("MMM d, yyyy 'at' h:mm a", Locale.getDefault()).format(date)
            } catch (_: Exception) {
                iso
            }
        }
    }

    object ReportDiff : DiffUtil.ItemCallback<MedicalReport>() {
        override fun areItemsTheSame(oldItem: MedicalReport, newItem: MedicalReport): Boolean =
            oldItem.id == newItem.id

        override fun areContentsTheSame(oldItem: MedicalReport, newItem: MedicalReport): Boolean =
            oldItem == newItem
    }
}
