package com.matrigluco.feature.history.presentation.sheet

import android.content.Context
import android.view.LayoutInflater
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.chip.Chip
import com.matrigluco.feature.history.R
import com.matrigluco.feature.history.databinding.SheetChronicleFilterBinding
import com.matrigluco.feature.history.domain.model.ChronicleEventType

object ChronicleFilterSheet {

    fun show(
        context: Context,
        currentType: ChronicleEventType,
        currentMonth: String?,
        availableMonths: List<String>,
        onApply: (ChronicleEventType, String?) -> Unit
    ) {
        val dialog = BottomSheetDialog(context)
        val binding = SheetChronicleFilterBinding.inflate(LayoutInflater.from(context))
        dialog.setContentView(binding.root)

        // 1. Setup Source Selection
        when (currentType) {
            ChronicleEventType.ALL -> binding.chipSourceAll.isChecked = true
            ChronicleEventType.ASSESSMENT -> binding.chipSourceAssessments.isChecked = true
            ChronicleEventType.READING -> binding.chipSourceReadings.isChecked = true
            ChronicleEventType.REPORT -> binding.chipSourceReports.isChecked = true
            ChronicleEventType.CONSULTATION -> binding.chipSourceConsultations.isChecked = true
        }

        // 2. Setup Month Chips
        val monthChips = mutableMapOf<Int, String?>()
        binding.chipMonthAll.isChecked = currentMonth == null
        monthChips[binding.chipMonthAll.id] = null

        availableMonths.forEach { monthStr ->
            val chip = Chip(context).apply {
                text = formatMonthDisplay(monthStr)
                isCheckable = true
                isChecked = monthStr == currentMonth
            }
            binding.monthChipGroup.addView(chip)
            monthChips[chip.id] = monthStr
        }

        // 3. Reset Button
        binding.btnReset.setOnClickListener {
            binding.chipSourceAll.isChecked = true
            binding.chipMonthAll.isChecked = true
        }

        // 4. Apply Button
        binding.btnApply.setOnClickListener {
            val selectedType = when (binding.sourceChipGroup.checkedChipId) {
                binding.chipSourceAssessments.id -> ChronicleEventType.ASSESSMENT
                binding.chipSourceReadings.id -> ChronicleEventType.READING
                binding.chipSourceReports.id -> ChronicleEventType.REPORT
                binding.chipSourceConsultations.id -> ChronicleEventType.CONSULTATION
                else -> ChronicleEventType.ALL
            }

            val checkedMonthId = binding.monthChipGroup.checkedChipId
            val selectedMonth = monthChips[checkedMonthId]

            onApply(selectedType, selectedMonth)
            dialog.dismiss()
        }

        dialog.show()
    }

    private fun formatMonthDisplay(yyyyMm: String): String {
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
}
