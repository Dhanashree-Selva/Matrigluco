import React from "react";
import { Link } from "react-router-dom";
import { NotificationViewModel } from "../types/notification.types";
import { AppIcon } from "../../../components/common/AppIcon";
import { Button, Badge } from "../../../shared/ui";
import { getNotificationPresentation } from "../config/notification-presentations";
import { SparklesIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface ActionHorizonProps {
  items: NotificationViewModel[];
  onMarkRead?: (id: string) => void;
}

export function ActionHorizon({ items, onMarkRead }: ActionHorizonProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Action Horizon"
      className="p-4 sm:p-5 rounded-3xl bg-[var(--card)] border border-[var(--primary)]/20 shadow-xs relative overflow-hidden space-y-3"
    >
      {/* Background glow accent */}
      <div
        className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2 text-[var(--primary)]">
          <AppIcon icon={SparklesIcon} size="xs" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Action Horizon
          </span>
        </div>
        <Badge
          variant="outline"
          className="bg-[var(--accent-soft)] text-[var(--primary)] border-[var(--primary)]/20 text-[10px] font-bold"
        >
          {items.length} Requires Attention
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
        {items.map((item) => {
          const pres = getNotificationPresentation(item.type);
          const Icon = pres.icon;

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg ${pres.accentBg} ${pres.accentText} flex items-center justify-center shrink-0`}
                    >
                      <AppIcon icon={Icon} size="xs" />
                    </div>
                    <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider truncate">
                      {item.sourceLabel}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)] shrink-0">
                    {item.relativeTime}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[var(--foreground)] line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                  {item.message}
                </p>
              </div>

              {item.targetRoute && (
                <Button
                  size="sm"
                  asChild
                  onClick={() => onMarkRead?.(item.id)}
                  className="w-full bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 font-bold text-[11px] h-8 rounded-xl gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Link to={item.targetRoute}>
                    <span>{item.actionLabel || "Review"}</span>
                    <AppIcon icon={ArrowRight01Icon} size="xs" />
                  </Link>
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
