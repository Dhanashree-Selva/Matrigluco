package com.matrigluco.core.network.connectivity

enum class NetworkState { AVAILABLE, UNAVAILABLE }

interface NetworkMonitor { fun currentState(): NetworkState }
