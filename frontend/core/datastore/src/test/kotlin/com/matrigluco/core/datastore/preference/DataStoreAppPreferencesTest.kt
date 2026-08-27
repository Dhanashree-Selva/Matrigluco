package com.matrigluco.core.datastore.preference

import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import java.io.File
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test

class DataStoreAppPreferencesTest {
    @Test fun `stores non-secret preferences and isolates sync metadata`() = runTest {
        val file = File.createTempFile("matrigluco-prefs", ".preferences_pb").apply { delete() }
        val preferences = DataStoreAppPreferences(PreferenceDataStoreFactory.create(scope = backgroundScope) { file })
        preferences.setTheme(ThemePreference.DARK); preferences.setLastSyncEpochMillis("user-a", "health", 42)
        assertEquals(ThemePreference.DARK, preferences.theme.first()); assertEquals(42L, preferences.lastSyncEpochMillis("user-a", "health").first()); assertEquals(null, preferences.lastSyncEpochMillis("user-b", "health").first())
        preferences.clearUser("user-a"); assertEquals(null, preferences.lastSyncEpochMillis("user-a", "health").first()); file.delete()
    }
}
