export type NotificationCategory =
  | "all"
  | "reports"
  | "consultations"
  | "assessments"
  | "tracking"
  | "account"
  | "system";

export type NotificationType =
  | "report_ready"
  | "report_processed"
  | "report_failed"
  | "consultation_reminder"
  | "consultation_booked"
  | "consultation_rescheduled"
  | "consultation_cancelled"
  | "risk_update"
  | "daily_summary"
  | "account_security"
  | "system";

export type SignalLensView = "all" | "unread" | "actionable";

export interface RawNotificationDto {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  resource_type?: string | null;
  resource_id?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface NotificationListDto {
  items: RawNotificationDto[];
  total: number;
  page: number;
  page_size: number;
  unread_count: number;
}

export interface NotificationViewModel {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  resourceType?: string;
  resourceId?: string;
  targetRoute?: string;
  actionLabel?: string;
  isActionable: boolean;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  createdAtFormatted: string;
  relativeTime: string;
  sourceLabel: string;
}

export interface EpisodeBundleModel {
  episodeKey: string;
  resourceType: string;
  resourceId: string;
  category: NotificationCategory;
  title: string;
  latestNotification: NotificationViewModel;
  notifications: NotificationViewModel[];
  isAllRead: boolean;
  count: number;
}

export interface SignalDateGroupModel {
  dateLabel: string;
  items: Array<
    | { kind: "single"; notification: NotificationViewModel }
    | { kind: "bundle"; bundle: EpisodeBundleModel }
  >;
}

export interface NotificationFilterState {
  view: SignalLensView;
  category: NotificationCategory;
  page?: number;
  pageSize?: number;
}
