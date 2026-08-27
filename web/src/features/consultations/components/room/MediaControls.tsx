import React from "react";
import { Button } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  Mic01Icon,
  MicOff01Icon,
  Video01Icon,
  CameraOff01Icon,
  Message01Icon,
  CallEnd01Icon,
} from "@hugeicons/core-free-icons";

interface MediaControlsProps {
  isMicMuted: boolean;
  onToggleMic: () => void;
  isCameraOff: boolean;
  onToggleCamera: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  onLeaveCall: () => void;
  className?: string;
}

export function MediaControls({
  isMicMuted,
  onToggleMic,
  isCameraOff,
  onToggleCamera,
  isChatOpen,
  onToggleChat,
  onLeaveCall,
  className = "",
}: MediaControlsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Consultation Media Controls"
      className={`p-3 rounded-2xl bg-[var(--card)]/90 backdrop-blur-md border border-[var(--border)] shadow-lg flex items-center justify-center gap-3 max-w-fit mx-auto ${className}`}
    >
      {/* Microphone Toggle */}
      <Button
        type="button"
        variant={isMicMuted ? "destructive" : "outline"}
        size="icon"
        onClick={onToggleMic}
        aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
        className={`w-11 h-11 rounded-xl transition-all shadow-xs ${
          !isMicMuted ? "border-[var(--border)] hover:bg-[var(--accent-soft)]" : ""
        }`}
      >
        <AppIcon icon={isMicMuted ? MicOff01Icon : Mic01Icon} size="sm" />
      </Button>

      {/* Camera Toggle */}
      <Button
        type="button"
        variant={isCameraOff ? "destructive" : "outline"}
        size="icon"
        onClick={onToggleCamera}
        aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
        className={`w-11 h-11 rounded-xl transition-all shadow-xs ${
          !isCameraOff ? "border-[var(--border)] hover:bg-[var(--accent-soft)]" : ""
        }`}
      >
        <AppIcon icon={isCameraOff ? CameraOff01Icon : Video01Icon} size="sm" />
      </Button>

      {/* Chat Toggle */}
      <Button
        type="button"
        variant={isChatOpen ? "default" : "outline"}
        size="icon"
        onClick={onToggleChat}
        aria-label={isChatOpen ? "Close chat panel" : "Open chat panel"}
        className={`w-11 h-11 rounded-xl transition-all shadow-xs ${
          isChatOpen
            ? "bg-[var(--primary)] text-white"
            : "border-[var(--border)] hover:bg-[var(--accent-soft)]"
        }`}
      >
        <AppIcon icon={Message01Icon} size="sm" />
      </Button>

      <div className="h-6 w-px bg-[var(--border)] mx-1" aria-hidden="true" />

      {/* Leave Call */}
      <Button
        type="button"
        variant="destructive"
        onClick={onLeaveCall}
        aria-label="Leave consultation call"
        className="h-11 px-4 rounded-xl font-semibold text-xs gap-2 shadow-xs bg-rose-600 hover:bg-rose-700 text-white"
      >
        <AppIcon icon={CallEnd01Icon} size="sm" />
        Leave Room
      </Button>
    </div>
  );
}
