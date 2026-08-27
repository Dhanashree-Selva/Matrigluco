export const routePaths = {
  home: "/",

  auth: {
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    verifyEmail: "/verify-email",
  },

  onboarding: "/onboarding",

  app: {
    root: "/app",
    dashboard: "/app/dashboard",
    assessment: "/app/assessment",
    assessmentDetail: (id: string = ":id") => `/app/assessment/${id}`,
    tracking: "/app/tracking",
    history: "/app/history",
    reports: "/app/reports",
    reportDetail: (id: string = ":id") => `/app/reports/${id}`,
    assistant: "/app/assistant",
    consultations: "/app/consultations",
    consultationDoctor: (id: string = ":id") => `/app/consultations/doctor/${id}`,
    consultationBook: (id: string = ":id") => `/app/consultations/book/${id}`,
    consultationDetail: (id: string = ":id") => `/app/consultations/${id}`,
    consultationConfirmation: (id: string = ":id") => `/app/consultations/${id}/confirmation`,
    consultationRoom: (id: string = ":id") => `/app/consultations/${id}/room`,
    notifications: "/app/notifications",

    account: {
      root: "/app/account",
      profile: "/app/account/profile",
      security: "/app/account/security",
      preferences: "/app/account/preferences",
    },
  },
} as const;

// Compatibility alias mapping to ease migration
export const ROUTES = {
  SPLASH: "/onboarding",
  ONBOARDING: routePaths.onboarding,
  AUTH: routePaths.auth.login,
  LOGIN: routePaths.auth.login,
  REGISTER: routePaths.auth.register,
  FORGOT_PASSWORD: routePaths.auth.forgotPassword,
  RESET_PASSWORD: routePaths.auth.resetPassword,
  VERIFY_EMAIL: routePaths.auth.verifyEmail,

  HOME: routePaths.app.dashboard,
  DASHBOARD: routePaths.app.dashboard,
  TRACK: routePaths.app.tracking,
  HISTORY: routePaths.app.history,
  MANUAL_ENTRY: routePaths.app.tracking,
  PREDICTION: routePaths.app.assessment,
  RISK_DETAILS: routePaths.app.assessment,

  DOCTOR: routePaths.app.consultations,
  DOCTOR_LIST: routePaths.app.consultations,
  DOCTOR_BOOK: (id: string = ":id") => `/app/consultations/book/${id}`,
  DOCTOR_CONFIRMATION: routePaths.app.consultations,
  DOCTOR_CHAT: routePaths.app.consultations,
  DOCTOR_CALL: routePaths.app.consultations,
  DOCTOR_PRESCRIPTIONS: routePaths.app.consultations,

  PROFILE: routePaths.app.account.profile,
  PROFILE_DETAILS: routePaths.app.account.profile,
  PROFILE_SECURITY: routePaths.app.account.security,
  NOTIFICATIONS: routePaths.app.notifications,

  CHATBOT: routePaths.app.assistant,
} as const;

export type RoutePath = typeof routePaths;
