package com.matrigluco.app

import android.content.res.Configuration
import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavOptions
import androidx.navigation.fragment.NavHostFragment
import com.matrigluco.app.databinding.ActivityMainBinding
import com.matrigluco.app.navigation.DestinationChromeRegistry
import com.matrigluco.app.navigation.AppShellPolicy
import com.matrigluco.app.navigation.PrimaryDestination
import com.matrigluco.app.navigation.RootRoute
import com.matrigluco.app.navigation.StartupRouter
import com.matrigluco.app.navigation.TopBarMode
import com.matrigluco.core.auth.session.SessionRepository
import com.matrigluco.core.auth.session.SessionState
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarAction
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarConfig
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarHost
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarMode
import com.matrigluco.core.notifications.deeplink.NotificationDeepLinkContract
import com.matrigluco.core.notifications.deeplink.NotificationDestination
import com.matrigluco.core.ui.adaptive.AppWindowSize
import com.matrigluco.core.ui.insets.InsetType
import com.matrigluco.core.ui.insets.applyOrbitInsets
import com.matrigluco.sync.scheduler.SyncScheduler
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity : AppCompatActivity(), OrbitAppBarHost {
    @Inject lateinit var sessionRepository: SessionRepository
    @Inject lateinit var syncScheduler: SyncScheduler
    private lateinit var binding: ActivityMainBinding
    private lateinit var navController: NavController
    private var currentDestinationId: Int? = null
    private var pendingNotificationDestination: NotificationDestination? = null
    private var lastAuthenticatedOwner: String? = null
    private var customAppBarConfig: OrbitAppBarConfig? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        ViewCompat.setOnApplyWindowInsetsListener(binding.shellRoot) { view, insets ->
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            val sysBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val isImeVisible = ime.bottom > 0 || insets.isVisible(WindowInsetsCompat.Type.ime())

            if (isImeVisible) {
                binding.bottomNavigation.visibility = View.GONE
            } else {
                currentDestinationId?.let { destId ->
                    val chrome = DestinationChromeRegistry.forDestination(destId)
                    val mode = AppWindowSize.fromWidthDp(resources.configuration.screenWidthDp)
                    val primaryNavigation = AppShellPolicy.primaryNavigation(chrome, mode)
                    binding.bottomNavigation.visibility = if (primaryNavigation.showBottomBar) View.VISIBLE else View.GONE
                }
            }

            // When keyboard (IME) is visible, lift the container by the keyboard height
            // When hidden, pad by system navigation bar height.
            val bottomInset = if (isImeVisible) ime.bottom else sysBars.bottom
            view.setPadding(sysBars.left, sysBars.top, sysBars.right, bottomInset)
            insets
        }
        navController = (supportFragmentManager.findFragmentById(R.id.nav_host) as NavHostFragment).navController
        pendingNotificationDestination = NotificationDeepLinkContract.parse(intent)
        bindPrimaryNavigation()
        navController.addOnDestinationChangedListener { _, destination, _ ->
            currentDestinationId = destination.id
            customAppBarConfig = null // Clear stale page overrides on destination change
            renderChrome(destination.id)
        }
        observeSession()
    }

    override fun configureAppBar(config: OrbitAppBarConfig) {
        val resolvedConfig = if (config.showBack && config.onBackClick == null) {
            config.copy(onBackClick = { navController.navigateUp() })
        } else {
            config
        }
        customAppBarConfig = resolvedConfig
        binding.orbitAppBar.render(resolvedConfig)
    }

    override fun setAppBarScrolled(isScrolled: Boolean) {
        binding.orbitAppBar.setScrolled(isScrolled)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        pendingNotificationDestination = NotificationDeepLinkContract.parse(intent)
        consumePendingDestination(sessionRepository.sessionState.value)
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        currentDestinationId?.let(::renderChrome)
    }

    private fun observeSession() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch { sessionRepository.resolveSession() }
                sessionRepository.sessionState.collect { state ->
                    val activeOwner = when (state) { is SessionState.Authenticated -> state.user.id; is SessionState.OfflineRestored -> state.user.id; else -> null }
                    val previous = lastAuthenticatedOwner
                    if (previous != null && previous != activeOwner) syncScheduler.cancelUserWork(previous)
                    lastAuthenticatedOwner = activeOwner
                    routeTo(StartupRouter.route(state))
                    consumePendingDestination(state)
                }
            }
        }
    }

    private fun consumePendingDestination(state: SessionState) {
        val destination = pendingNotificationDestination ?: return
        if (state !is SessionState.Authenticated && state !is SessionState.OfflineRestored) return
        if (navController.currentDestination?.parent?.id != R.id.protected_graph) return
        val target = when (destination) {
            NotificationDestination.Notifications -> R.id.notificationsFragment
            is NotificationDestination.Report -> R.id.reportsFragment
            is NotificationDestination.Consultation -> R.id.consultationsFragment
        }
        pendingNotificationDestination = null
        if (navController.currentDestination?.id != target) navController.navigate(target)
    }

    private fun routeTo(route: RootRoute) {
        val graphId = when (route) {
            RootRoute.STARTUP -> return
            RootRoute.AUTH -> R.id.auth_graph
            RootRoute.ONBOARDING -> R.id.protected_graph
            RootRoute.PROTECTED -> R.id.protected_graph
        }
        if (navController.currentDestination?.parent?.id == graphId) return
        navController.navigate(graphId, null, NavOptions.Builder().setLaunchSingleTop(true).setPopUpTo(R.id.nav_root, false).build())
    }

    private fun bindPrimaryNavigation() {
        val select: (PrimaryDestination) -> Unit = ::selectPrimary
        binding.bottomNavigation.bind(listOf(PrimaryDestination.HOME, PrimaryDestination.TRACK, PrimaryDestination.ASSESS, PrimaryDestination.ASSISTANT, PrimaryDestination.MORE), false, select)
        binding.navigationRail.bind(listOf(PrimaryDestination.HOME, PrimaryDestination.TRACK, PrimaryDestination.ASSESS, PrimaryDestination.ASSISTANT, PrimaryDestination.ACCOUNT), true, select)
    }

    private fun selectPrimary(destination: PrimaryDestination) {
        if (navController.currentDestination?.id == destination.rootDestination) {
            navController.popBackStack(destination.rootDestination, false)
            return
        }
        navController.navigate(destination.rootDestination, null, NavOptions.Builder().setLaunchSingleTop(true).setRestoreState(true).setPopUpTo(R.id.homeFragment, false, true).build())
    }

    private fun renderChrome(destinationId: Int) {
        val chrome = DestinationChromeRegistry.forDestination(destinationId)
        val mode = AppWindowSize.fromWidthDp(resources.configuration.screenWidthDp)
        val primaryNavigation = AppShellPolicy.primaryNavigation(chrome, mode)
        binding.bottomNavigation.visibility = if (primaryNavigation.showBottomBar) View.VISIBLE else View.GONE
        binding.navigationRail.visibility = if (primaryNavigation.showRail) View.VISIBLE else View.GONE

        if (customAppBarConfig != null) {
            binding.orbitAppBar.render(customAppBarConfig!!)
        } else {
            val titleText = chrome.title?.let(::getString).orEmpty()
            val actions = mutableListOf<OrbitAppBarAction>()

            when (destinationId) {
                R.id.homeFragment -> {
                    actions.add(OrbitAppBarAction.Notifications(0) { navController.navigate(R.id.notificationsFragment) })
                    actions.add(OrbitAppBarAction.Profile { navController.navigate(R.id.accountFragment) })
                }
                R.id.trackingFragment -> {
                    actions.add(OrbitAppBarAction.Filter { /* Filter readings */ })
                    actions.add(OrbitAppBarAction.Notifications(0) { navController.navigate(R.id.notificationsFragment) })
                }
                R.id.reportsFragment -> {
                    actions.add(OrbitAppBarAction.Search { /* Search reports */ })
                    actions.add(OrbitAppBarAction.Notifications(0) { navController.navigate(R.id.notificationsFragment) })
                }
                R.id.assistantFragment -> {
                    actions.add(OrbitAppBarAction.Notifications(0) { navController.navigate(R.id.notificationsFragment) })
                }
                R.id.moreFragment -> {
                    actions.add(OrbitAppBarAction.Notifications(0) { navController.navigate(R.id.notificationsFragment) })
                }
            }

            val appConfig = OrbitAppBarConfig(
                mode = chrome.topBarMode.toOrbitAppBarMode(),
                title = titleText,
                eyebrow = chrome.eyebrow,
                subtitle = chrome.subtitle,
                badgeText = chrome.badgeText,
                showBack = chrome.topBarMode == TopBarMode.DETAIL || chrome.topBarMode == TopBarMode.ACCOUNT || chrome.topBarMode == TopBarMode.FLOW,
                onBackClick = { navController.navigateUp() },
                actions = actions
            )
            binding.orbitAppBar.render(appConfig)
        }

        binding.bottomNavigation.setSelected(if (chrome.primary == PrimaryDestination.ACCOUNT) PrimaryDestination.MORE else chrome.primary)
        binding.navigationRail.setSelected(if (chrome.primary == PrimaryDestination.MORE) null else chrome.primary)
        ViewCompat.setAccessibilityPaneTitle(binding.navHost, chrome.title?.let(::getString))
    }
}
