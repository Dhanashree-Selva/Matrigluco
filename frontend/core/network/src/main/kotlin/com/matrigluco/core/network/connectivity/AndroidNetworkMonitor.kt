package com.matrigluco.core.network.connectivity

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities

class AndroidNetworkMonitor(context: Context) : NetworkMonitor {
    private val manager = context.getSystemService(ConnectivityManager::class.java)
    override fun currentState(): NetworkState {
        val capabilities = manager.getNetworkCapabilities(manager.activeNetwork) ?: return NetworkState.UNAVAILABLE
        return if (capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)) NetworkState.AVAILABLE else NetworkState.UNAVAILABLE
    }
}
