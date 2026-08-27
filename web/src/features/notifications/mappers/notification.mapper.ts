import { RawNotificationDto, NotificationViewModel } from "../types/notification.types";
import { getNotificationPresentation } from "../config/notification-presentations";
import { resolveNotificationTarget } from "../utils/notification-targets";
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";

export function mapNotificationDtoToViewModel(dto: RawNotificationDto): NotificationViewModel {
  const presentation = getNotificationPresentation(dto.notification_type);
  const targetRoute = resolveNotificationTarget(dto.resource_type, dto.resource_id);

  let createdAtFormatted = "";
  let relativeTime = "";

  try {
    const parsedDate = parseISO(dto.created_at);
    createdAtFormatted = format(parsedDate, "MMM d, yyyy · h:mm a");
    relativeTime = formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch {
    createdAtFormatted = dto.created_at;
    relativeTime = "recently";
  }

  // A notification is actionable if it has an action route and is an actionable type
  const isActionable = Boolean(targetRoute && presentation.isActionableByDefault);

  return {
    id: dto.id,
    userId: dto.user_id,
    title: dto.title || presentation.label,
    message: dto.message,
    type: (dto.notification_type as any) || "system",
    category: presentation.category,
    resourceType: dto.resource_type || undefined,
    resourceId: dto.resource_id || undefined,
    targetRoute,
    actionLabel: presentation.defaultActionLabel,
    isActionable,
    isRead: dto.is_read,
    readAt: dto.read_at || undefined,
    createdAt: dto.created_at,
    createdAtFormatted,
    relativeTime,
    sourceLabel: presentation.sourceLabel,
  };
}
