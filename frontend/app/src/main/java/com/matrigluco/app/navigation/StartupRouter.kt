package com.matrigluco.app.navigation

import com.matrigluco.core.auth.session.SessionState

enum class RootRoute { STARTUP, AUTH, ONBOARDING, PROTECTED }
object StartupRouter {
    fun route(state: SessionState): RootRoute = when (state) {
        SessionState.Restoring -> RootRoute.STARTUP
        SessionState.Public, is SessionState.Expired -> RootRoute.AUTH
        is SessionState.Authenticated -> RootRoute.PROTECTED
        is SessionState.OfflineRestored -> RootRoute.PROTECTED
    }
}
