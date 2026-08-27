package com.matrigluco.app.navigation

import androidx.annotation.IdRes
import androidx.annotation.StringRes
import com.matrigluco.app.R
import com.matrigluco.core.designsystem.component.appbar.OrbitAppBarMode
import com.matrigluco.core.designsystem.icon.OrbitIcon
import com.matrigluco.core.ui.adaptive.AppLayoutMode

enum class TopBarMode {
    ROOT, DETAIL, MINIMAL, HIDDEN, FLOW, SEARCH, ACCOUNT, IMMERSIVE;

    fun toOrbitAppBarMode(): OrbitAppBarMode = when (this) {
        ROOT -> OrbitAppBarMode.ROOT
        DETAIL -> OrbitAppBarMode.DETAIL
        MINIMAL -> OrbitAppBarMode.MINIMAL
        HIDDEN -> OrbitAppBarMode.HIDDEN
        FLOW -> OrbitAppBarMode.FLOW
        SEARCH -> OrbitAppBarMode.SEARCH
        ACCOUNT -> OrbitAppBarMode.ACCOUNT
        IMMERSIVE -> OrbitAppBarMode.IMMERSIVE
    }
}

data class DestinationChrome(
    val topBarMode: TopBarMode,
    val showPrimaryNavigation: Boolean,
    @param:StringRes val title: Int? = null,
    val primary: PrimaryDestination? = null,
    val eyebrow: String? = null,
    val subtitle: String? = null,
    val badgeText: String? = null
)

data class AppShellState(val chrome: DestinationChrome, val layoutMode: AppLayoutMode)
data class PrimaryNavigationVisibility(val showBottomBar: Boolean, val showRail: Boolean)

object AppShellPolicy {
    fun primaryNavigation(chrome: DestinationChrome, mode: AppLayoutMode) = PrimaryNavigationVisibility(
        showBottomBar = chrome.showPrimaryNavigation && mode == AppLayoutMode.COMPACT,
        showRail = chrome.showPrimaryNavigation && mode != AppLayoutMode.COMPACT,
    )
}

enum class PrimaryDestination(@param:StringRes val label: Int, val icon: OrbitIcon, @param:IdRes val rootDestination: Int) {
    HOME(R.string.nav_home, OrbitIcon.Home, R.id.homeFragment),
    TRACK(R.string.nav_track, OrbitIcon.Tracking, R.id.trackingFragment),
    ASSESS(R.string.nav_assess, OrbitIcon.Assessment, R.id.assessmentFragment),
    REPORTS(R.string.nav_reports, OrbitIcon.Reports, R.id.reportsFragment),
    ASSISTANT(R.string.nav_assistant, OrbitIcon.Assistant, R.id.assistantFragment),
    MORE(R.string.nav_more, OrbitIcon.More, R.id.moreFragment),
    ACCOUNT(R.string.nav_account, OrbitIcon.Account, R.id.accountFragment)
}

object DestinationChromeRegistry {
    fun forDestination(@IdRes id: Int): DestinationChrome = when (id) {
        R.id.startupFragment -> DestinationChrome(TopBarMode.HIDDEN, false)
        R.id.loginFragment -> DestinationChrome(TopBarMode.HIDDEN, false)
        R.id.registerFragment -> DestinationChrome(TopBarMode.HIDDEN, false)
        R.id.forgotPasswordFragment -> DestinationChrome(TopBarMode.HIDDEN, false)
        R.id.onboardingFragment -> DestinationChrome(TopBarMode.MINIMAL, false, R.string.onboarding_title)
        R.id.homeFragment -> DestinationChrome(
            topBarMode = TopBarMode.ROOT,
            showPrimaryNavigation = true,
            title = R.string.nav_home,
            primary = PrimaryDestination.HOME,
            eyebrow = "CARE ORBIT WORKSPACE",
            badgeText = "WEEK 27",
            subtitle = "Today's maternal care overview"
        )
        R.id.trackingFragment -> DestinationChrome(
            topBarMode = TopBarMode.ROOT,
            showPrimaryNavigation = true,
            title = R.string.nav_track,
            primary = PrimaryDestination.TRACK,
            eyebrow = "YOUR TIMELINE",
            subtitle = "Glucose & vitals tracking"
        )
        R.id.historyFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.history,
            primary = null,
            eyebrow = "LONGITUDINAL CARE RECORD",
            subtitle = "Your longitudinal care record"
        )
        R.id.reportsFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.nav_reports,
            primary = null,
            eyebrow = "PRIVATE EVIDENCE VAULT",
            subtitle = "Lab records & medical documents"
        )
        R.id.assessmentFragment -> DestinationChrome(
            topBarMode = TopBarMode.ROOT,
            showPrimaryNavigation = true,
            title = R.string.nav_assess,
            primary = PrimaryDestination.ASSESS,
            eyebrow = "CLINICAL RISK EVALUATION",
            badgeText = "MODEL V1.0.0",
            subtitle = "Gestational diabetes risk profiling"
        )
        R.id.assistantFragment -> DestinationChrome(
            topBarMode = TopBarMode.ROOT,
            showPrimaryNavigation = true,
            title = R.string.nav_assistant,
            primary = PrimaryDestination.ASSISTANT,
            eyebrow = "EDUCATIONAL SUPPORT",
            subtitle = "Continuous guidance & questions"
        )
        R.id.chatFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.nav_assistant,
            primary = null,
            eyebrow = "EDUCATIONAL SUPPORT",
            subtitle = "Continuous guidance & questions"
        )
        R.id.conversationListFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.history,
            primary = null,
            subtitle = "Saved maternal health discussions"
        )
        R.id.moreFragment -> DestinationChrome(
            topBarMode = TopBarMode.ROOT,
            showPrimaryNavigation = true,
            title = R.string.nav_more,
            primary = PrimaryDestination.MORE,
            eyebrow = "WORKSPACE & PREFERENCES",
            subtitle = "Care options, profile & clinical tools"
        )
        R.id.consultationsFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.consultations,
            primary = null,
            subtitle = "Clinical appointments & review"
        )
        R.id.notificationsFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.notifications,
            primary = null,
            subtitle = "Updates and care reminders"
        )
        R.id.accountFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.nav_account,
            primary = null,
            eyebrow = "IDENTITY STUDIO",
            subtitle = "Manage personal identity and maternal parameters"
        )
        R.id.trustAndTransparencyFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.legal_trust_title,
            primary = null,
            eyebrow = "TRUST & TRANSPARENCY",
            subtitle = "Privacy, terms and software information"
        )
        R.id.privacyAndDataFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.privacy_title,
            primary = null,
            eyebrow = "DATA BOUNDARIES",
            subtitle = "Local vs backend storage"
        )
        R.id.termsOfUseFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.terms_title,
            primary = null,
            eyebrow = "CONDITIONS OF USE",
            subtitle = "Educational healthcare terms"
        )
        R.id.modelAndAITransparencyFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.model_title,
            primary = null,
            eyebrow = "MODEL SPECIFICATIONS",
            subtitle = "Inference runtimes & limitations"
        )
        R.id.reportProcessingTransparencyFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.reports_proc_title,
            primary = null,
            eyebrow = "EVIDENCE VAULT",
            subtitle = "OCR extraction & private storage"
        )
        R.id.openSourceLicensesFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.licenses_title,
            primary = null,
            eyebrow = "SOFTWARE NOTICES",
            subtitle = "Third-party libraries & licenses"
        )
        R.id.openSourceLicenseDetailFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.licenses_title,
            primary = null,
            eyebrow = "LICENSE TEXT",
            subtitle = "Open-source copyright terms"
        )
        R.id.permissionsAndDeviceAccessFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.perms_title,
            primary = null,
            eyebrow = "DEVICE ACCESS",
            subtitle = "System permissions & picker"
        )
        R.id.dataControlsFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.controls_title,
            primary = null,
            eyebrow = "DATA & PRIVACY",
            subtitle = "Cache, context & account controls"
        )
        R.id.appInformationFragment -> DestinationChrome(
            topBarMode = TopBarMode.DETAIL,
            showPrimaryNavigation = false,
            title = R.string.app_info_title,
            primary = null,
            eyebrow = "BUILD METADATA",
            subtitle = "Version & system specifications"
        )
        else -> DestinationChrome(TopBarMode.DETAIL, false, primary = null)
    }
}
