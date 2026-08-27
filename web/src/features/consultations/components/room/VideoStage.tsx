import React, { useRef, useEffect, useState } from "react";
import { ConsultationRecord } from "../../types/consultation.types";
import { Avatar, AvatarFallback, AvatarImage, Badge } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  Video01Icon,
  CameraOff01Icon,
  Mic01Icon,
  MicOff01Icon,
  Shield01Icon,
  LockIcon,
} from "@hugeicons/core-free-icons";

interface VideoStageProps {
  consultation: ConsultationRecord;
  isCameraOff: boolean;
  isMicMuted: boolean;
  className?: string;
}

export function VideoStage({
  consultation,
  isCameraOff,
  isMicMuted,
  className = "",
}: VideoStageProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const clinician = consultation.clinician;

  // Request user camera only on video stage mount
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (!isCameraOff && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((s) => {
          activeStream = s;
          setStream(s);
          setHasPermission(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setHasPermission(false);
        });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isCameraOff]);

  return (
    <div
      className={`relative w-full aspect-video max-h-[68vh] rounded-3xl bg-slate-950 overflow-hidden border border-[var(--border)] shadow-md flex items-center justify-center ${className}`}
    >
      {/* Remote Clinician Feed Frame */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
        <Avatar className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/20 shadow-xl mb-4">
          {clinician?.avatarUrl && (
            <AvatarImage src={clinician.avatarUrl} alt={consultation.doctorName} />
          )}
          <AvatarFallback className="bg-[var(--primary)] text-white font-bold text-2xl">
            {clinician?.initials || consultation.doctorName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {consultation.doctorName}
        </h2>
        <p className="text-xs text-white/70 mt-0.5">
          {clinician?.title || consultation.consultationType}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected Securely (E2EE)
          </Badge>
        </div>
      </div>

      {/* Top Header Badge Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <Badge
          variant="outline"
          className="bg-black/40 backdrop-blur-md text-white/90 border-white/10 text-xs font-semibold px-3 py-1 gap-1.5"
        >
          <AppIcon icon={LockIcon} size="xxs" className="text-emerald-400" />
          Encrypted Consultation Room
        </Badge>
      </div>

      {/* Picture-in-Picture Local User Video */}
      <div className="absolute bottom-4 right-4 z-20 w-32 sm:w-44 aspect-video rounded-2xl bg-slate-900 border-2 border-white/20 shadow-lg overflow-hidden flex items-center justify-center">
        {!isCameraOff && hasPermission ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror -scale-x-100"
          />
        ) : (
          <div className="text-center p-2 text-white/60">
            <AppIcon icon={CameraOff01Icon} size="sm" className="mx-auto mb-1 opacity-70" />
            <span className="text-[10px] font-medium block">Camera Off</span>
          </div>
        )}

        {/* Local Mic Status Pill */}
        <div className="absolute bottom-1.5 left-1.5 p-1 rounded-md bg-black/60 backdrop-blur-xs text-white">
          <AppIcon icon={isMicMuted ? MicOff01Icon : Mic01Icon} size="xxs" />
        </div>
      </div>
    </div>
  );
}
