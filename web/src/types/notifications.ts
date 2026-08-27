export type NotificationType = "risk_alert" | "consultation_reminder" | "daily_summary" | "system";

export interface NotificationRecord {
  id: string;
  user_id?: string;
  notification_type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  action_url?: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  consultation_reminders: boolean;
  daily_summaries: boolean;
  risk_alerts: boolean;
}

export interface NotificationListResponse {
  items: NotificationRecord[];
  total: number;
}
