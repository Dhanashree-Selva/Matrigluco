import React from "react";
import { ItemGroup, FieldSet, FieldLegend } from "../../../../shared/ui";
import { SessionItem } from "./SessionItem";
import { SignOutOtherSessions } from "./SignOutOtherSessions";
import { SessionRecord } from "../../types/account.types";

interface SessionConstellationProps {
  sessions: SessionRecord[];
  onRevokeSession: (sessionId: string) => void;
  onSignOutOthers: () => Promise<void>;
  isRevokingSession?: boolean;
  isSigningOutOthers?: boolean;
}

export function SessionConstellation({
  sessions,
  onRevokeSession,
  onSignOutOthers,
  isRevokingSession = false,
  isSigningOutOthers = false,
}: SessionConstellationProps) {
  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <FieldSet className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <FieldLegend variant="legend" className="text-sm font-bold text-[var(--foreground)]">
            Active Sessions
          </FieldLegend>
          <p className="text-xs text-[var(--muted-foreground)]">
            Recognized browsers and devices authorized to access your MatriGluco account.
          </p>
        </div>

        {otherSessions.length > 0 && (
          <SignOutOtherSessions
            onSignOutOthers={onSignOutOthers}
            isSigningOut={isSigningOutOthers}
          />
        )}
      </div>

      <ItemGroup className="space-y-3">
        {/* Current Session First */}
        {currentSession && (
          <SessionItem
            session={currentSession}
            onRevoke={onRevokeSession}
            isRevoking={isRevokingSession}
          />
        )}

        {/* Other Sessions */}
        {otherSessions.map((session) => (
          <SessionItem
            key={session.id}
            session={session}
            onRevoke={onRevokeSession}
            isRevoking={isRevokingSession}
          />
        ))}

        {sessions.length === 0 && (
          <div className="p-8 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-center">
            <p className="text-xs text-[var(--muted-foreground)]">
              No active session records found.
            </p>
          </div>
        )}
      </ItemGroup>
    </FieldSet>
  );
}
