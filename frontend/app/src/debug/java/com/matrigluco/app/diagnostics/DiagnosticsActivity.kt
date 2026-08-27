package com.matrigluco.app.diagnostics

import android.content.ClipData
import android.content.ClipboardManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.pm.PackageInfoCompat
import com.matrigluco.app.BuildConfig
import com.matrigluco.app.R
import com.matrigluco.core.designsystem.component.OrbitButton

class DiagnosticsActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_diagnostics)
        val supportBundle = sanitizedSupportBundle()
        findViewById<android.widget.TextView>(R.id.diagnosticsContent).text = supportBundle
        findViewById<OrbitButton>(R.id.copyDiagnostics).apply {
            setText(getString(R.string.diagnostics_copy))
            setOnClickListener { getSystemService(ClipboardManager::class.java).setPrimaryClip(ClipData.newPlainText(getString(R.string.diagnostics_copy_label), supportBundle)) }
        }
    }

    private fun sanitizedSupportBundle(): String {
        val packageInfo = packageManager.getPackageInfo(packageName, 0)
        val connected = getSystemService(ConnectivityManager::class.java).activeNetwork?.let { network ->
            getSystemService(ConnectivityManager::class.java).getNetworkCapabilities(network)?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        } == true
        return listOf(
            "Matrigluco ${packageInfo.versionName} (${PackageInfoCompat.getLongVersionCode(packageInfo)})",
            "Variant: ${BuildConfig.BUILD_TYPE}",
            "API environment: ${BuildConfig.APP_ENV}",
            "Network: ${if (connected) "connected" else "not connected"}",
            "Database schema: 1",
        ).joinToString("\n")
    }
}
