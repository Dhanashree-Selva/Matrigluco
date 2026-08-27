import {
  File02Icon,
  Calendar03Icon,
  SecurityCheckIcon,
  Activity01Icon,
  InformationCircleIcon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { NotificationType, NotificationCategory } from "../types/notification.types";

export interface NotificationPresentationConfig {
  label: string;
  category: NotificationCategory;
  sourceLabel: string;
  icon: typeof File02Icon;
  defaultActionLabel?: string;
  isActionableByDefault: boolean;
  accentBg: string;
  accentText: string;
}

export const NOTIFICATION_PRESENTATIONS: Record<
  NotificationType,
  NotificationPresentationConfig
> = {
  report_ready: {
    label: "Report Ready for Review",
    category: "reports",
    sourceLabel: "Lab Report",
    icon: File02Icon,
    defaultActionLabel: "Review report",
    isActionableByDefault: true,
    accentBg: "bg-emerald-500/10",
    accentText: "text-emerald-600 dark:text-emerald-400",
  },
  report_processed: {
    label: "Report Processing Complete",
    category: "reports",
    sourceLabel: "Lab Report",
    icon: CheckmarkCircle02Icon,
    defaultActionLabel: "View report",
    isActionableByDefault: true,
    accentBg: "bg-[var(--accent-soft)]",
    accentText: "text-[var(--primary)]",
  },
  report_failed: {
    label: "Report Extraction Incomplete",
    category: "reports",
    sourceLabel: "Lab Report",
    icon: AlertCircleIcon,
    defaultActionLabel: "Inspect report",
    isActionableByDefault: true,
    accentBg: "bg-rose-500/10",
    accentText: "text-rose-600 dark:text-rose-400",
  },
  consultation_reminder: {
    label: "Consultation Reminder",
    category: "consultations",
    sourceLabel: "Consultation",
    icon: Calendar03Icon,
    defaultActionLabel: "View appointment",
    isActionableByDefault: true,
    accentBg: "bg-blue-500/10",
    accentText: "text-blue-600 dark:text-blue-400",
  },
  consultation_booked: {
    label: "Consultation Confirmed",
    category: "consultations",
    sourceLabel: "Consultation",
    icon: Calendar03Icon,
    defaultActionLabel: "View appointment",
    isActionableByDefault: false,
    accentBg: "bg-[var(--accent-soft)]",
    accentText: "text-[var(--primary)]",
  },
  consultation_rescheduled: {
    label: "Consultation Rescheduled",
    category: "consultations",
    sourceLabel: "Consultation",
    icon: Clock01Icon,
    defaultActionLabel: "Review new time",
    isActionableByDefault: true,
    accentBg: "bg-amber-500/10",
    accentText: "text-amber-600 dark:text-amber-400",
  },
  consultation_cancelled: {
    label: "Consultation Cancelled",
    category: "consultations",
    sourceLabel: "Consultation",
    icon: AlertCircleIcon,
    defaultActionLabel: "Book new visit",
    isActionableByDefault: false,
    accentBg: "bg-neutral-500/10",
    accentText: "text-neutral-600 dark:text-neutral-400",
  },
  risk_update: {
    label: "Assessment Profile Updated",
    category: "assessments",
    sourceLabel: "Clinical Assessment",
    icon: Activity01Icon,
    defaultActionLabel: "View summary",
    isActionableByDefault: false,
    accentBg: "bg-purple-500/10",
    accentText: "text-purple-600 dark:text-purple-400",
  },
  daily_summary: {
    label: "Daily Health Summary",
    category: "tracking",
    sourceLabel: "Health Telemetry",
    icon: InformationCircleIcon,
    defaultActionLabel: "View telemetry",
    isActionableByDefault: false,
    accentBg: "bg-[var(--accent-soft)]",
    accentText: "text-[var(--primary)]",
  },
  account_security: {
    label: "Security & Session Update",
    category: "account",
    sourceLabel: "Account Security",
    icon: SecurityCheckIcon,
    defaultActionLabel: "Review sessions",
    isActionableByDefault: true,
    accentBg: "bg-indigo-500/10",
    accentText: "text-indigo-600 dark:text-indigo-400",
  },
  system: {
    label: "Care System Notice",
    category: "system",
    sourceLabel: "Care Notice",
    icon: InformationCircleIcon,
    defaultActionLabel: undefined,
    isActionableByDefault: false,
    accentBg: "bg-[var(--surface-soft)]",
    accentText: "text-[var(--muted-foreground)]",
  },
};

export function getNotificationPresentation(typeStr?: string): NotificationPresentationConfig {
  const normalized = (typeStr || "system").toLowerCase() as NotificationType;
  return NOTIFICATION_PRESENTATIONS[normalized] || NOTIFICATION_PRESENTATIONS.system;
}
