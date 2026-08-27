package com.matrigluco.feature.reports.presentation.sheet

import android.content.Context
import android.content.res.ColorStateList
import android.text.InputType
import android.view.LayoutInflater
import android.view.View
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.matrigluco.core.designsystem.R as DesignR
import com.matrigluco.feature.reports.R
import com.matrigluco.feature.reports.databinding.ItemExtractedValueRowBinding
import com.matrigluco.feature.reports.databinding.SheetReportDetailBinding
import com.matrigluco.feature.reports.databinding.SheetReviewExtractionBinding
import com.matrigluco.feature.reports.databinding.SheetUploadReportBinding
import com.matrigluco.feature.reports.domain.model.MedicalReport
import com.matrigluco.feature.reports.domain.model.ReportFileType
import com.matrigluco.feature.reports.domain.model.ReportStatus

object ReportSheets {

    fun showUploadSheet(
        context: Context,
        onPickDocument: () -> Unit,
        onPickImage: () -> Unit,
        selectedFileName: String?,
        selectedFileSizeText: String?,
        selectedFileType: ReportFileType?,
        onClearSelection: () -> Unit,
        onConfirmUpload: () -> Unit
    ): BottomSheetDialog {
        val dialog = BottomSheetDialog(context)
        val binding = SheetUploadReportBinding.inflate(LayoutInflater.from(context))
        dialog.setContentView(binding.root)

        if (selectedFileName != null) {
            binding.selectedFileContainer.visibility = View.VISIBLE
            binding.btnConfirmUpload.visibility = View.VISIBLE
            binding.selectedFileName.text = selectedFileName
            binding.selectedFileSize.text = selectedFileSizeText ?: ""
            when (selectedFileType) {
                ReportFileType.PDF -> binding.selectedFileIcon.setImageResource(DesignR.drawable.ic_huge_document_24)
                ReportFileType.IMAGE -> binding.selectedFileIcon.setImageResource(DesignR.drawable.ic_huge_report_24)
                else -> binding.selectedFileIcon.setImageResource(DesignR.drawable.ic_huge_document_24)
            }
        } else {
            binding.selectedFileContainer.visibility = View.GONE
            binding.btnConfirmUpload.visibility = View.GONE
        }

        binding.btnPickDocument.setOnClickListener {
            onPickDocument()
            dialog.dismiss()
        }

        binding.btnPickImage.setOnClickListener {
            onPickImage()
            dialog.dismiss()
        }

        binding.btnRemoveSelectedFile.setOnClickListener {
            onClearSelection()
            binding.selectedFileContainer.visibility = View.GONE
            binding.btnConfirmUpload.visibility = View.GONE
        }

        binding.btnConfirmUpload.setOnClickListener {
            binding.confirmUploadContent.visibility = View.GONE
            binding.uploadProgress.visibility = View.VISIBLE
            binding.btnConfirmUpload.isEnabled = false
            onConfirmUpload()
            dialog.dismiss()
        }

        dialog.show()
        return dialog
    }

    fun showDetailSheet(
        context: Context,
        report: MedicalReport,
        onDownloadPdf: () -> Unit,
        onReviewClick: () -> Unit,
        onDeleteClick: () -> Unit
    ) {
        val dialog = BottomSheetDialog(context)
        val binding = SheetReportDetailBinding.inflate(LayoutInflater.from(context))
        dialog.setContentView(binding.root)

        binding.detailFileName.text = report.fileName
        binding.detailUploadedMeta.text = "Uploaded ${report.uploadedAt}"

        when (report.fileType) {
            ReportFileType.PDF -> binding.detailFileIcon.setImageResource(DesignR.drawable.ic_huge_document_24)
            ReportFileType.IMAGE -> binding.detailFileIcon.setImageResource(DesignR.drawable.ic_huge_report_24)
            else -> binding.detailFileIcon.setImageResource(DesignR.drawable.ic_huge_document_24)
        }

        when (report.status) {
            ReportStatus.REVIEWED -> {
                binding.detailStatusChip.setBackgroundResource(R.drawable.bg_status_chip_reviewed)
                binding.detailStatusChip.setTextColor(ContextCompat.getColor(context, DesignR.color.care_success))
                binding.detailStatusChip.text = "✓ " + context.getString(R.string.reports_status_reviewed)
                binding.btnReviewExtraction.visibility = View.GONE
            }
            ReportStatus.NEEDS_REVIEW -> {
                binding.detailStatusChip.setBackgroundResource(R.drawable.bg_status_chip_needs_review)
                binding.detailStatusChip.setTextColor(ContextCompat.getColor(context, DesignR.color.care_pink))
                binding.detailStatusChip.text = "⚠ " + context.getString(R.string.reports_status_needs_review)
                binding.btnReviewExtraction.visibility = View.VISIBLE
            }
            else -> {
                binding.detailStatusChip.setBackgroundResource(R.drawable.bg_status_chip_reviewed)
                binding.detailStatusChip.setTextColor(ContextCompat.getColor(context, DesignR.color.care_warning))
                binding.detailStatusChip.text = context.getString(R.string.reports_status_processing)
                binding.btnReviewExtraction.visibility = View.GONE
            }
        }

        // Full Extracted Biomarkers
        binding.detailExtractedList.removeAllViews()
        if (report.extractedBiomarkers.isNotEmpty()) {
            val inflater = LayoutInflater.from(context)
            for (bio in report.extractedBiomarkers) {
                val row = ItemExtractedValueRowBinding.inflate(inflater, binding.detailExtractedList, false)
                row.biomarkerName.text = bio.name + ":"
                row.biomarkerValue.text = "${bio.value} ${bio.unit}".trim()
                if (bio.isAbnormal) {
                    row.biomarkerValue.setTextColor(ContextCompat.getColor(context, DesignR.color.care_pink))
                } else {
                    row.biomarkerValue.setTextColor(ContextCompat.getColor(context, DesignR.color.care_text_primary))
                }
                binding.detailExtractedList.addView(row.root)
            }
        } else {
            val emptyTv = TextView(context).apply {
                text = "No extracted biomarker values recorded for this report."
                setTextColor(ContextCompat.getColor(context, DesignR.color.care_text_tertiary))
                textSize = 12f
            }
            binding.detailExtractedList.addView(emptyTv)
        }

        binding.btnDownloadClinicalPdf.setOnClickListener {
            onDownloadPdf()
            dialog.dismiss()
        }

        binding.btnReviewExtraction.setOnClickListener {
            dialog.dismiss()
            onReviewClick()
        }

        binding.btnDeleteReport.setOnClickListener {
            dialog.dismiss()
            onDeleteClick()
        }

        dialog.show()
    }

    fun showReviewSheet(
        context: Context,
        report: MedicalReport,
        onSave: (Map<String, String>) -> Unit
    ) {
        val dialog = BottomSheetDialog(context)
        val binding = SheetReviewExtractionBinding.inflate(LayoutInflater.from(context))
        dialog.setContentView(binding.root)

        val inputMap = mutableMapOf<String, EditText>()

        for (bio in report.extractedBiomarkers) {
            val fieldContainer = LinearLayout(context).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(0, 8, 0, 8)
            }

            val label = TextView(context).apply {
                text = "${bio.name} (${bio.unit})".trim()
                setTextColor(ContextCompat.getColor(context, DesignR.color.care_text_secondary))
                textSize = 12f
            }

            val input = EditText(context).apply {
                setText(bio.value)
                setTextColor(ContextCompat.getColor(context, DesignR.color.care_text_primary))
                textSize = 14f
                backgroundTintList = ColorStateList.valueOf(ContextCompat.getColor(context, DesignR.color.care_border))
                inputType = InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL
            }

            inputMap[bio.key] = input
            fieldContainer.addView(label)
            fieldContainer.addView(input)
            binding.reviewFieldsContainer.addView(fieldContainer)
        }

        binding.btnSaveReview.setOnClickListener {
            val updatedValues = inputMap.mapValues { (_, edit) -> edit.text.toString().trim() }
            val fullMap = updatedValues.toMutableMap()
            fullMap["_is_reviewed"] = "true"
            onSave(fullMap)
            dialog.dismiss()
        }

        dialog.show()
    }
}
