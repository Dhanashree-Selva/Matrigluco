import React from "react";
import { ConsultationModeType } from "../../types/consultation.types";
import { AppIcon } from "../../../../components/common/AppIcon";
import { Video01Icon, Message01Icon, Hospital01Icon } from "@hugeicons/core-free-icons";

interface ConsultationModeProps {
  selectedMode: ConsultationModeType;
  onSelectMode: (mode: ConsultationModeType) => void;
  supportedModes?: ConsultationModeType[];
  className?: string;
}

export function ConsultationMode({
  selectedMode,
  onSelectMode,
  supportedModes = ["video", "chat"],
  className = "",
}: ConsultationModeProps) {
  return (
    <div className={`p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-3 ${className}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-1">
        3. Consultation Format
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {supportedModes.includes("video") && (
          <button
            type="button"
            onClick={() => onSelectMode("video")}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
              selectedMode === "video"
                ? "bg-[var(--accent-soft)]/60 border-[var(--primary)] text-[var(--primary)] ring-1 ring-[var(--primary)]"
                : "bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent-soft)]/30"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              selectedMode === "video"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]"
            }`}>
              <AppIcon icon={Video01Icon} size="xs" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--foreground)]">Video Consultation</p>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                Face-to-face encrypted video call with screen & report review.
              </p>
            </div>
          </button>
        )}

        {supportedModes.includes("chat") && (
          <button
            type="button"
            onClick={() => onSelectMode("chat")}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
              selectedMode === "chat"
                ? "bg-[var(--accent-soft)]/60 border-[var(--primary)] text-[var(--primary)] ring-1 ring-[var(--primary)]"
                : "bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent-soft)]/30"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              selectedMode === "chat"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]"
            }`}>
              <AppIcon icon={Message01Icon} size="xs" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--foreground)]">Live Chat Consult</p>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                Direct real-time text consultation with document sharing.
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
