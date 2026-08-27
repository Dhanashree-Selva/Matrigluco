package com.matrigluco.core.datastore.preference

import kotlinx.coroutines.flow.Flow

enum class ThemePreference { SYSTEM, LIGHT, DARK }
enum class GlucoseUnitPreference { MG_DL, MMOL_L }

interface AppPreferences {
    val theme: Flow<ThemePreference>
    val glucoseUnit: Flow<GlucoseUnitPreference>
    suspend fun setTheme(value: ThemePreference)
    suspend fun setGlucoseUnit(value: GlucoseUnitPreference)
    fun lastSyncEpochMillis(ownerUserId: String, domain: String): Flow<Long?>
    suspend fun setLastSyncEpochMillis(ownerUserId: String, domain: String, value: Long)
    suspend fun clearUser(ownerUserId: String)
}
