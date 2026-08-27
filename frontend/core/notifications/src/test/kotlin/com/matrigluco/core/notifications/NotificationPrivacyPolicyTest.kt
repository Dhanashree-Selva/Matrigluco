package com.matrigluco.core.notifications

import com.matrigluco.core.notifications.channel.NotificationChannelId
import com.matrigluco.core.notifications.dispatch.NotificationPrivacyPolicy
import com.matrigluco.core.notifications.model.NotificationCategory
import com.matrigluco.core.notifications.deeplink.NotificationDeepLinkContract
import com.matrigluco.core.notifications.deeplink.NotificationDestination
import com.matrigluco.core.notifications.permission.NotificationPermissionPolicy
import com.matrigluco.core.notifications.permission.NotificationPermissionState
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class NotificationPrivacyPolicyTest {
    @Test fun `semantic channels have stable non-generic ids`() {
        assertEquals(setOf("health_reminders", "reports", "consultations", "account_security"), NotificationChannelId.entries.map { it.value }.toSet())
    }

    @Test fun `every category maps to controlled local copy`() {
        NotificationCategory.entries.forEach { category ->
            val copy = NotificationPrivacyPolicy.copy(category)
            assertNotEquals(0, copy.title)
            assertNotEquals(0, copy.body)
        }
    }

    @Test fun `health and report events never share security channel`() {
        assertNotEquals(NotificationChannelId.ACCOUNT_SECURITY, NotificationPrivacyPolicy.copy(NotificationCategory.HEALTH_REMINDER).channel)
        assertNotEquals(NotificationChannelId.ACCOUNT_SECURITY, NotificationPrivacyPolicy.copy(NotificationCategory.REPORT).channel)
    }

    @Test fun `permission policy covers platform and denial states`() {
        assertEquals(NotificationPermissionState.NOT_REQUIRED, NotificationPermissionPolicy.resolve(false, false, false, false))
        assertEquals(NotificationPermissionState.GRANTED, NotificationPermissionPolicy.resolve(true, true, true, false))
        assertEquals(NotificationPermissionState.NOT_REQUESTED, NotificationPermissionPolicy.resolve(true, false, false, false))
        assertEquals(NotificationPermissionState.DENIED, NotificationPermissionPolicy.resolve(true, false, true, true))
        assertEquals(NotificationPermissionState.SETTINGS_REQUIRED, NotificationPermissionPolicy.resolve(true, false, true, false))
    }

    @Test fun `deep links accept only known types and opaque safe ids`() {
        assertEquals(NotificationDestination.Notifications, NotificationDeepLinkContract.parse("notifications", null))
        assertEquals(NotificationDestination.Report("report_123"), NotificationDeepLinkContract.parse("report", "report_123"))
        assertEquals(null, NotificationDeepLinkContract.parse("report", "../private"))
        assertEquals(null, NotificationDeepLinkContract.parse("https://evil.invalid", "x"))
    }
}
