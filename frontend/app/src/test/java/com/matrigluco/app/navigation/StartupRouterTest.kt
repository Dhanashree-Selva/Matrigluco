package com.matrigluco.app.navigation

import com.matrigluco.core.auth.session.AuthenticatedUser
import com.matrigluco.core.auth.session.SessionState
import org.junit.Assert.assertEquals
import org.junit.Test

class StartupRouterTest {
    @Test fun `signed out routes to auth`() = assertEquals(RootRoute.AUTH, StartupRouter.route(SessionState.Public))
    @Test fun `incomplete onboarding routes to onboarding`() = assertEquals(RootRoute.ONBOARDING, StartupRouter.route(SessionState.Authenticated(user(), false)))
    @Test fun `complete session routes to protected`() = assertEquals(RootRoute.PROTECTED, StartupRouter.route(SessionState.Authenticated(user(), true)))
    @Test fun `restoring remains on startup`() = assertEquals(RootRoute.STARTUP, StartupRouter.route(SessionState.Restoring))
    private fun user() = AuthenticatedUser("user", "user@example.com")
}
