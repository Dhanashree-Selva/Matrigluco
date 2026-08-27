package com.matrigluco.core.designsystem.component

import android.content.Context
import android.text.InputType
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.res.use
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.matrigluco.core.designsystem.R

class OrbitInputLayout @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null) : LinearLayout(context, attrs) {
    private val label: TextView
    private val container: TextInputLayout
    private val editText: TextInputEditText

    init {
        orientation = VERTICAL
        LayoutInflater.from(context).inflate(R.layout.view_orbit_input_layout, this, true)
        label = findViewById(R.id.orbit_input_label)
        container = findViewById(R.id.orbit_input_container)
        editText = findViewById(R.id.orbit_input_edit_text)

        context.obtainStyledAttributes(attrs, R.styleable.OrbitInputLayout).use {
            val labelText = it.getText(R.styleable.OrbitInputLayout_orbitLabel)
            val isRequired = it.getBoolean(R.styleable.OrbitInputLayout_orbitRequired, false)
            if (labelText != null) {
                setLabel(labelText, isRequired)
            } else {
                label.visibility = GONE
            }
            val hintText = it.getText(R.styleable.OrbitInputLayout_orbitHint) ?: it.getText(R.styleable.OrbitInputLayout_android_hint)
            if (hintText != null) {
                setHint(hintText)
            }
            setHelperText(it.getText(R.styleable.OrbitInputLayout_orbitHelperText))
            setUnit(it.getText(R.styleable.OrbitInputLayout_orbitUnit))
            val inputType = it.getInt(R.styleable.OrbitInputLayout_android_inputType, 0)
            if (inputType != 0) {
                editText.inputType = inputType
            }
            val isPassword = it.getBoolean(R.styleable.OrbitInputLayout_orbitPassword, false)
            if (isPassword) {
                setPasswordMode(true)
            }
        }
    }

    fun setLabel(value: CharSequence, required: Boolean = false) {
        label.visibility = VISIBLE
        label.text = if (required) "$value · ${context.getString(R.string.orbit_required)}" else value
    }

    fun setHint(value: CharSequence?) {
        editText.hint = value
    }

    fun hint(): CharSequence? = editText.hint

    fun setHelperText(value: CharSequence?) {
        container.helperText = value
    }

    fun setError(value: CharSequence?) {
        container.error = value
        container.isErrorEnabled = !value.isNullOrBlank()
        editText.accessibilityLiveRegion = if (value.isNullOrBlank()) ACCESSIBILITY_LIVE_REGION_NONE else ACCESSIBILITY_LIVE_REGION_POLITE
    }

    fun setUnit(value: CharSequence?) {
        container.suffixText = value
    }

    fun setPrefix(value: CharSequence?) {
        container.prefixText = value
    }

    fun text(): CharSequence = editText.text?.toString().orEmpty()

    fun setText(value: CharSequence) {
        editText.setText(value)
        editText.setSelection(editText.text?.length ?: 0)
    }

    fun setInputType(type: Int) {
        editText.inputType = type
    }

    fun setPasswordMode(enabled: Boolean) {
        if (enabled) {
            editText.inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
            container.endIconMode = TextInputLayout.END_ICON_PASSWORD_TOGGLE
            container.setEndIconContentDescription(R.string.orbit_show_password)
        } else {
            container.endIconMode = TextInputLayout.END_ICON_NONE
        }
    }
}
