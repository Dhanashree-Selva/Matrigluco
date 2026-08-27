package com.matrigluco.core.designsystem.component

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import com.matrigluco.core.designsystem.R

class OrbitSectionHeader @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) : LinearLayout(context, attrs) {
    private val title:TextView; private val metadata:TextView; private val action:TextView
    init { orientation=HORIZONTAL; gravity=android.view.Gravity.CENTER_VERTICAL; LayoutInflater.from(context).inflate(R.layout.view_orbit_section_header,this,true); title=findViewById(R.id.orbit_section_title); metadata=findViewById(R.id.orbit_section_metadata); action=findViewById(R.id.orbit_section_action) }
    fun bind(sectionTitle:CharSequence, supportingMetadata:CharSequence?=null){title.text=sectionTitle;metadata.text=supportingMetadata;metadata.visibility=if(supportingMetadata.isNullOrBlank())View.GONE else View.VISIBLE}
    fun setAction(text:CharSequence?, listener:OnClickListener?){action.text=text;action.visibility=if(text.isNullOrBlank())View.GONE else View.VISIBLE;action.setOnClickListener(listener)}
}
