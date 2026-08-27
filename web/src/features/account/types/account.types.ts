export interface AccountUser {
  id: string;
  publicId?: string;
  email: string;
  fullName?: string | null;
  role: string;
  status: string;
  expectedDueDate?: string | null;
  pregnancyWeek?: number;
  previousPregnancies?: number;
  phone?: string | null;
  age?: number | null;
  bloodGroup?: string | null;
  emergencyContact?: string | null;
  emailVerifiedAt?: string | null;
  isEmailVerified: boolean;
  createdAt?: string;
  userMetadata?: Record<string, unknown> | null;
}

export interface UserProfileUpdatePayload {
  full_name?: string;
  expected_due_date?: string | null;
  pregnancy_week?: number | null;
  previous_pregnancies?: number | null;
  phone?: string | null;
  age?: number | null;
  blood_group?: string | null;
  emergency_contact?: string | null;
}

export interface SessionRecord {
  id: string;
  publicId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  browser: string;
  os: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  location?: string | null;
  createdAt: string;
  lastUsedAt: string;
  lastUsedFormatted: string;
  expiresAt: string;
  status: "active" | "revoked" | "expired";
  isCurrent: boolean;
}

export interface NotificationPreferencesRecord {
  consultationRemindersEnabled: boolean;
  riskNotificationsEnabled: boolean;
  dailySummaryNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
}

export interface NotificationPreferencesUpdatePayload {
  consultation_reminders_enabled?: boolean;
  risk_notifications_enabled?: boolean;
  daily_summary_notifications_enabled?: boolean;
  email_notifications_enabled?: boolean;
}

export interface AiConsentState {
  isGranted: boolean;
  grantedAt?: string | null;
  version: string;
}
