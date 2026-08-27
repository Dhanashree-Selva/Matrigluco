package com.matrigluco.app.navigation

import com.matrigluco.app.R
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class DestinationChromeRegistryTest {
    @Test fun authHidesApplicationShell() {
        listOf(R.id.loginFragment, R.id.registerFragment, R.id.forgotPasswordFragment).forEach { destinationId ->
            val chrome = DestinationChromeRegistry.forDestination(destinationId)
            assertFalse("Destination $destinationId should hide primary navigation", chrome.showPrimaryNavigation)
            assertEquals(TopBarMode.HIDDEN, chrome.topBarMode)
        }
    }

    @Test fun rootScreensShowPrimaryNavigationAndRootTopBar() {
        listOf(R.id.homeFragment, R.id.trackingFragment, R.id.assessmentFragment, R.id.assistantFragment, R.id.moreFragment).forEach { destinationId ->
            val chrome = DestinationChromeRegistry.forDestination(destinationId)
            assertTrue("Root destination $destinationId should show primary navigation", chrome.showPrimaryNavigation)
            assertEquals(TopBarMode.ROOT, chrome.topBarMode)
        }
    }

    @Test fun internalScreensHidePrimaryNavigationAndShowDetailTopBar() {
        listOf(
            R.id.accountFragment,
            R.id.notificationsFragment,
            R.id.historyFragment,
            R.id.reportsFragment,
            R.id.consultationsFragment,
            R.id.conversationListFragment,
            R.id.chatFragment,
            R.id.trustAndTransparencyFragment,
            R.id.privacyAndDataFragment,
            R.id.termsOfUseFragment,
            R.id.modelAndAITransparencyFragment,
            R.id.reportProcessingTransparencyFragment,
            R.id.openSourceLicensesFragment,
            R.id.openSourceLicenseDetailFragment,
            R.id.permissionsAndDeviceAccessFragment,
            R.id.dataControlsFragment,
            R.id.appInformationFragment
        ).forEach { destinationId ->
            val chrome = DestinationChromeRegistry.forDestination(destinationId)
            assertFalse("Internal destination $destinationId should hide primary navigation", chrome.showPrimaryNavigation)
            assertEquals(TopBarMode.DETAIL, chrome.topBarMode)
        }
    }
}
