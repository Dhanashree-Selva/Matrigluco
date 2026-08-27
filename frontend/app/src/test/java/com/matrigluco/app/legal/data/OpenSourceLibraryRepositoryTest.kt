package com.matrigluco.app.legal.data

import com.matrigluco.app.legal.model.LicenseCategory
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class OpenSourceLibraryRepositoryTest {

    private lateinit var repository: OpenSourceLibraryRepository

    @Before
    fun setup() {
        repository = OpenSourceLibraryRepository()
    }

    @Test
    fun getLibrariesReturnsNonEmptyList() {
        val libraries = repository.getLibraries()
        assertTrue("Library inventory should have items", libraries.isNotEmpty())
        assertTrue("Expected at least 15 libraries", libraries.size >= 15)
    }

    @Test
    fun getLibrariesFiltersBySearchQuery() {
        val retrofitResults = repository.getLibraries(query = "Retrofit")
        assertEquals(1, retrofitResults.size)
        assertEquals("Retrofit", retrofitResults.first().name)

        val roomResults = repository.getLibraries(query = "Room")
        assertTrue(roomResults.any { it.name.contains("Room", ignoreCase = true) })
    }

    @Test
    fun getLibrariesFiltersByCategory() {
        val mitResults = repository.getLibraries(category = LicenseCategory.MIT)
        assertTrue(mitResults.isNotEmpty())
        assertTrue(mitResults.all { it.licenseCategory == LicenseCategory.MIT })

        val apacheResults = repository.getLibraries(category = LicenseCategory.APACHE)
        assertTrue(apacheResults.isNotEmpty())
        assertTrue(apacheResults.all { it.licenseCategory == LicenseCategory.APACHE })
    }

    @Test
    fun hugeiconsAttributionIsPresent() {
        val hugeicons = repository.getLibraryByName("Hugeicons Free Icons")
        assertNotNull("Hugeicons attribution must be present", hugeicons)
        assertEquals(LicenseCategory.MIT, hugeicons?.licenseCategory)
        assertTrue(hugeicons?.projectUrl?.startsWith("https://") == true)
    }

    @Test
    fun allProjectUrlsAreHttpsOrHttp() {
        val libraries = repository.getLibraries()
        libraries.forEach { lib ->
            lib.projectUrl?.let { url ->
                assertTrue(
                    "URL for ${lib.name} must be http or https, found: $url",
                    url.startsWith("https://") || url.startsWith("http://")
                )
            }
        }
    }
}
