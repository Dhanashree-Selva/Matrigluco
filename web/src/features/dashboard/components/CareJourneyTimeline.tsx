import { Link } from "react-router-dom";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../../shared/ui";
import { JourneyTimelineEventVM } from "../types/dashboard.types";

export interface CareJourneyTimelineProps {
  events: JourneyTimelineEventVM[];
  className?: string;
}

export function CareJourneyTimeline({ events = [], className = "" }: CareJourneyTimelineProps) {
  return (
    <Card
      data-slot="care-timeline"
      className={`rounded-md border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col justify-between ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-[var(--foreground)] tracking-tight">
          Recent Care Activity
        </CardTitle>
        <CardDescription className="text-xs text-[var(--muted-foreground)]">
          Timeline of measurements, assessments, and consultations
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 pb-2">
        {events.length === 0 ? (
          <p className="text-xs text-[var(--muted-foreground)] py-4 text-center">
            No recent care activity logged yet.
          </p>
        ) : (
          <div className="flex flex-col">
            {events.map((event, index) => {
              const isLast = index === events.length - 1;
              return (
                <Link
                  key={event.id}
                  to={event.path || "/app/history"}
                  className="group relative flex items-stretch gap-3.5 p-2 -mx-2 rounded-md transition-colors hover:bg-[var(--accent-soft)]/40"
                >
                  {/* Dedicated Spine Track: Node Icon + Perfectly Centered Connector Line */}
                  <div className="relative flex flex-col items-center shrink-0 w-7">
                    {/* Node Icon Box */}
                    <div className="w-7 h-7 rounded-md bg-[var(--card)] border border-[var(--border-pink)] text-[var(--primary)] group-hover:border-[var(--primary)] group-hover:scale-105 flex items-center justify-center shrink-0 z-10 transition-all shadow-2xs">
                      <AppIcon icon={event.icon} size="xs" />
                    </div>

                    {/* Vertical Connector Line (100% centered directly beneath node) */}
                    {!isLast && (
                      <div className="w-[1.5px] grow bg-[var(--border)] my-1" />
                    )}
                  </div>

                  {/* Event Details */}
                  <div className={`flex-1 min-w-0 ${!isLast ? "pb-3.5" : "pb-0.5"} flex flex-col justify-center`}>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                        {event.title}
                      </h4>
                      <span className="text-[10px] text-[var(--muted-foreground)] shrink-0 font-medium">
                        {event.relativeTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed truncate">
                      {event.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 border-t border-[var(--border)] bg-transparent">
        <Link
          to="/app/history"
          className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1.5"
        >
          <span>View complete history</span>
          <AppIcon icon={ArrowRight01Icon} size="xs" />
        </Link>
      </CardFooter>
    </Card>
  );
}
