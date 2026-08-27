package com.matrigluco.core.designsystem.component

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import android.widget.TextView
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.matrigluco.core.designsystem.R

class OrbitBottomSheet(context:Context) : BottomSheetDialog(context) {
    private val contentHost:FrameLayout
    init { val root=LayoutInflater.from(context).inflate(R.layout.orbit_bottom_sheet,null);contentHost=root.findViewById(R.id.orbit_sheet_content);setContentView(root);setOnShowListener{root.findViewById<TextView>(R.id.orbit_sheet_title).requestFocus()} }
    fun setOrbitTitle(title:CharSequence){findViewById<TextView>(R.id.orbit_sheet_title)?.text=title}
    fun setOrbitContent(view:View){contentHost.removeAllViews();contentHost.addView(view)}
}
