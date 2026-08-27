import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useConsultation } from "../hooks/useConsultation";
import { CareRoom } from "../components/room/CareRoom";
import { ConsultationsSkeleton } from "../components/ConsultationEmptyState";
import { Button } from "../../../shared/ui";

export default function ConsultationRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: consultation, isLoading, isError } = useConsultation(id);

  if (isLoading) {
    return <ConsultationsSkeleton />;
  }

  if (isError || !consultation) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)] max-w-lg mx-auto my-12 space-y-4">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Room Unavailable</h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          The requested consultation room could not be accessed.
        </p>
        <Button
          type="button"
          onClick={() => navigate("/app/consultations")}
          className="text-xs font-semibold bg-[var(--primary)] text-white"
        >
          Return to Consultations
        </Button>
      </div>
    );
  }

  return (
    <div className="py-2">
      <CareRoom consultation={consultation} />
    </div>
  );
}
