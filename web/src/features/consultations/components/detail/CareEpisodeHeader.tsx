import React from "react";
import { ConsultationRecord } from "../../types/consultation.types";
import { ConsultationStatus } from "../ConsultationStatus";
import {
  Button,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  Calendar01Icon,
  Video01Icon,
  Message01Icon,
  Cancel01Icon,
  PencilEdit01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

interface CareEpisodeHeaderProps {
  consultation: ConsultationRecord;
  onReschedule?: () => void;
  onCancel?: () => void;
  isCancelling?: boolean;
  onJoinRoom?: () => void;
}

export function CareEpisodeHeader({
  consultation,
  onReschedule,
  onCancel,
  isCancelling = false,
  onJoinRoom,
}: CareEpisodeHeaderProps) {
  const isJoinable = consultation.isJoinable;
  const isCancelled = consultation.stage === "cancelled";
  const isCompleted = consultation.stage === "complete";

  return (
    <header className="p-6 sm:p-7 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
              Care Episode
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">#{consultation.id.slice(0, 8)}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Consultation with {consultation.doctorName}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 flex items-center gap-2">
            <span>{consultation.fullDateTimeFormatted}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 font-medium text-[var(--foreground)]/80">
              <AppIcon
                icon={consultation.mode === "chat" ? Message01Icon : Video01Icon}
                size="xxs"
                className="text-[var(--primary)]"
              />
              {consultation.consultationType}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <ConsultationStatus stage={consultation.stage} />

          {isJoinable && onJoinRoom && (
            <Button
              type="button"
              onClick={onJoinRoom}
              className="gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              size="sm"
            >
              <AppIcon icon={Video01Icon} size="xs" />
              Join Room
            </Button>
          )}
        </div>
      </div>

      {/* Action Controls for Active Appointments */}
      {!isCancelled && !isCompleted && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]/60 text-xs">
          <span className="text-[var(--muted-foreground)]">
            Need to change your appointment time?
          </span>

          <div className="flex items-center gap-2">
            {onReschedule && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onReschedule}
                className="gap-1.5 text-xs font-semibold hover:bg-[var(--accent-soft)]"
              >
                <AppIcon icon={PencilEdit01Icon} size="xxs" />
                Reschedule
              </Button>
            )}

            {onCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                  >
                    <AppIcon icon={Cancel01Icon} size="xxs" />
                    Cancel Appointment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this consultation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your appointment with{" "}
                      <strong>{consultation.doctorName}</strong> on{" "}
                      <strong>{consultation.fullDateTimeFormatted}</strong>? This slot will be released back to the clinic's schedule.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onCancel}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                    >
                      {isCancelling ? (
                        <>
                          <AppIcon icon={Loading03Icon} size="xs" className="animate-spin mr-1" />
                          Cancelling…
                        </>
                      ) : (
                        "Yes, Cancel Consultation"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
