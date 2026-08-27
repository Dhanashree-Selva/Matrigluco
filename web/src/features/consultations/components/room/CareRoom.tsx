import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConsultationRecord } from "../../types/consultation.types";
import { VideoStage } from "./VideoStage";
import { MediaControls } from "./MediaControls";
import { ConsultationChat } from "./ConsultationChat";
import { Button } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

interface CareRoomProps {
  consultation: ConsultationRecord;
  className?: string;
}

export function CareRoom({ consultation, className = "" }: CareRoomProps) {
  const navigate = useNavigate();
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLeave = () => {
    navigate(`/app/consultations/${consultation.id}`);
  };

  return (
    <div className={`space-y-4 max-w-6xl mx-auto ${className}`}>
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLeave}
          className="gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <AppIcon icon={ArrowLeft01Icon} size="xs" />
          Back to Care Episode
        </Button>

        <span className="text-xs font-bold text-[var(--foreground)]">
          {consultation.doctorName} · {consultation.consultationType}
        </span>
      </div>

      {/* Main Video & Chat Grid */}
      <div className={`grid gap-4 items-start ${isChatOpen ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
        <div className={isChatOpen ? "lg:col-span-2 space-y-4" : "space-y-4"}>
          <VideoStage
            consultation={consultation}
            isCameraOff={isCameraOff}
            isMicMuted={isMicMuted}
          />

          {/* Floating / Anchored Media Controls */}
          <MediaControls
            isMicMuted={isMicMuted}
            onToggleMic={() => setIsMicMuted((prev) => !prev)}
            isCameraOff={isCameraOff}
            onToggleCamera={() => setIsCameraOff((prev) => !prev)}
            isChatOpen={isChatOpen}
            onToggleChat={() => setIsChatOpen((prev) => !prev)}
            onLeaveCall={handleLeave}
          />
        </div>

        {/* Side Chat Panel */}
        {isChatOpen && (
          <div className="lg:col-span-1">
            <ConsultationChat consultation={consultation} />
          </div>
        )}
      </div>
    </div>
  );
}
