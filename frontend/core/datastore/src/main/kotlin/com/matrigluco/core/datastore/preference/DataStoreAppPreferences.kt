package com.matrigluco.core.datastore.preference

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import java.security.MessageDigest
import java.io.IOException
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map

class DataStoreAppPreferences(private val store: DataStore<Preferences>) : AppPreferences {
    private val safeData = store.data.catch { error -> if (error is IOException) emit(emptyPreferences()) else throw error }
    override val theme = safeData.map { it[THEME]?.let { name -> runCatching { ThemePreference.valueOf(name) }.getOrNull() } ?: ThemePreference.SYSTEM }
    override val glucoseUnit = safeData.map { it[GLUCOSE_UNIT]?.let { name -> runCatching { GlucoseUnitPreference.valueOf(name) }.getOrNull() } ?: GlucoseUnitPreference.MG_DL }
    override suspend fun setTheme(value: ThemePreference) { store.edit { it[THEME] = value.name } }
    override suspend fun setGlucoseUnit(value: GlucoseUnitPreference) { store.edit { it[GLUCOSE_UNIT] = value.name } }
    override fun lastSyncEpochMillis(ownerUserId: String, domain: String) = safeData.map { it[syncKey(ownerUserId, domain)] }
    override suspend fun setLastSyncEpochMillis(ownerUserId: String, domain: String, value: Long) { store.edit { it[syncKey(ownerUserId, domain)] = value } }
    override suspend fun clearUser(ownerUserId: String) {
        val prefix = "sync_${digest(ownerUserId)}_"
        store.edit { values -> values.asMap().keys.filter { it.name.startsWith(prefix) }.forEach { key ->
            @Suppress("UNCHECKED_CAST") values.remove(key as Preferences.Key<Any>)
        } }
    }
    private fun syncKey(owner: String, domain: String) = longPreferencesKey("sync_${digest(owner)}_${domain.filter { it.isLetterOrDigit() || it == '_' }}")
    private fun digest(value: String) = MessageDigest.getInstance("SHA-256").digest(value.encodeToByteArray()).take(8).joinToString("") { "%02x".format(it) }
    private companion object { val THEME = stringPreferencesKey("theme"); val GLUCOSE_UNIT = stringPreferencesKey("glucose_unit") }
}
