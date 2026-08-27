package com.matrigluco.core.designsystem.component.appbar

/**
 * Standardized toolbar modes across all Matrigluco screens.
 */
enum class OrbitAppBarMode {
    /**
     * Primary root destinations (Dashboard, Tracking, Reports, Assistant, More, Account).
     * Displays the Matrigluco mark, context eyebrow, title, and primary actions. No back button.
     */
    ROOT,

    /**
     * Detail screens (Report Detail, Assessment Result, Consultation Detail, Notification Detail).
     * Displays Hugeicons back navigation, title, optional metadata subtitle, and actions.
     */
    DETAIL,

    /**
     * Multi-step flows (Assessment Questionnaire, Setup Flow, Report Review).
     * Displays back/close navigation, flow title, and step indicator metadata.
     */
    FLOW,

    /**
     * Primary search interaction mode.
     * Displays back/close, native search input field, and clear/filter action.
     */
    SEARCH,

    /**
     * Immersive document/PDF preview mode.
     * Displays compact overlay with back, short title, and preview actions.
     */
    IMMERSIVE,

    /**
     * Account and settings pages.
     * Displays back navigation, title, and optional contextual action.
     */
    ACCOUNT,

    /**
     * Minimal public brand header (e.g. Onboarding).
     */
    MINIMAL,

    /**
     * Completely hidden app bar (e.g. Splash, Full-screen auth).
     */
    HIDDEN
}
