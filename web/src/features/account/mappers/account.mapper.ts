import {
  AccountUser,
  SessionRecord,
  NotificationPreferencesRecord,
} from "../types/account.types";

export interface RawUserApiItem {
  id: string;
  public_id?: string | null;
  email: string;
  full_name?: string | null;
  role: string;
  status: string;
  expected_due_date?: string | null;
  pregnancy_week?: number | null;
  previous_pregnancies?: number | null;
  phone?: string | null;
  age?: number | null;
  blood_group?: string | null;
  emergency_contact?: string | null;
  email_verified_at?: string | null;
  email_verified?: boolean;
  created_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
}

export interface RawSessionApiItem {
  id: string;
  public_id?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  status: string;
  is_current?: boolean;
}

export interface RawNotificationPreferencesApiItem {
  consultation_reminders_enabled?: boolean;
  risk_notifications_enabled?: boolean;
  daily_summary_notifications_enabled?: boolean;
  email_notifications_enabled?: boolean;
}

export function parseUserAgentMetadata(ua?: string | null): {
  browser: string;
  os: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
} {
  if (!ua) {
    return { browser: "Unknown Browser", os: "Unknown OS", deviceType: "unknown" };
  }

  const s = ua.toLowerCase();
  let browser = "Web Browser";
  let os = "Desktop";
  let deviceType: "desktop" | "mobile" | "tablet" | "unknown" = "desktop";

  // OS detection
  if (s.includes("iphone") || s.includes("ipad") || s.includes("ipod")) {
    os = "iOS";
    deviceType = s.includes("ipad") ? "tablet" : "mobile";
  } else if (s.includes("mac os") || s.includes("macintosh")) {
    os = "macOS";
  } else if (s.includes("windows")) {
    os = "Windows";
  } else if (s.includes("android")) {
    os = "Android";
    deviceType = s.includes("tablet") ? "tablet" : "mobile";
  } else if (s.includes("linux")) {
    os = "Linux";
  }

  // Browser detection
  if (s.includes("edg/")) browser = "Microsoft Edge";
  else if (s.includes("chrome") && !s.includes("edg/")) browser = "Chrome";
  else if (s.includes("safari") && !s.includes("chrome")) browser = "Safari";
  else if (s.includes("firefox")) browser = "Firefox";

  return { browser, os, deviceType };
}

export function formatSessionLastActive(isoString: string, isCurrent: boolean): string {
  if (isCurrent) return "Active now";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Recently active";

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} days ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function mapApiToAccountUser(raw: RawUserApiItem): AccountUser {
  const isVerified = Boolean(raw.email_verified_at || raw.email_verified);

  return {
    id: raw.id,
    publicId: raw.public_id || raw.id,
    email: raw.email,
    fullName: raw.full_name || null,
    role: raw.role || "user",
    status: raw.status || "active",
    expectedDueDate: raw.expected_due_date || null,
    pregnancyWeek: typeof raw.pregnancy_week === "number" ? raw.pregnancy_week : 0,
    previousPregnancies:
      typeof raw.previous_pregnancies === "number" ? raw.previous_pregnancies : 0,
    phone: raw.phone || null,
    age: typeof raw.age === "number" ? raw.age : null,
    bloodGroup: raw.blood_group || null,
    emergencyContact: raw.emergency_contact || null,
    emailVerifiedAt: raw.email_verified_at || null,
    isEmailVerified: isVerified,
    createdAt: raw.created_at || undefined,
    userMetadata: raw.user_metadata || null,
  };
}

export function mapApiToSessionRecord(raw: RawSessionApiItem): SessionRecord {
  const { browser, os, deviceType } = parseUserAgentMetadata(raw.user_agent);
  const isCurrent = Boolean(raw.is_current);

  return {
    id: raw.id,
    publicId: raw.public_id || raw.id,
    ipAddress: raw.ip_address || null,
    userAgent: raw.user_agent || null,
    browser,
    os,
    deviceType,
    location: null,
    createdAt: raw.created_at,
    lastUsedAt: raw.last_used_at,
    lastUsedFormatted: formatSessionLastActive(raw.last_used_at, isCurrent),
    expiresAt: raw.expires_at,
    status: (raw.status as "active" | "revoked" | "expired") || "active",
    isCurrent,
  };
}

export function mapApiToNotificationPreferences(
  raw: RawNotificationPreferencesApiItem
): NotificationPreferencesRecord {
  return {
    consultationRemindersEnabled: raw.consultation_reminders_enabled ?? true,
    riskNotificationsEnabled: raw.risk_notifications_enabled ?? true,
    dailySummaryNotificationsEnabled: raw.daily_summary_notifications_enabled ?? false,
    emailNotificationsEnabled: raw.email_notifications_enabled ?? true,
  };
}
