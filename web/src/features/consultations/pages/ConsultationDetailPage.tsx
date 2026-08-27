import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useConsultation } from "../hooks/useConsultation";
import { useCancelConsultation } from "../hooks/useCancelConsultation";
import { CareEpisodeHeader } from "../components/detail/CareEpisodeHeader";
import { ConsultationJourney } from "../components/ConsultationJourney";
import { PreparationPanel } from "../components/detail/PreparationPanel";
import { VisitContextCard } from "../components/detail/VisitContextCard";
import { ConsultationsSkeleton } from "../components/ConsultationEmptyState";
import { ResourceUnavailableState } from "../../../pages/system/ResourceUnavailableState";
import { AppIcon } from "../../../components/common/AppIcon";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: consultation, isLoading, isError } = useConsultation(id);
  const cancelConsultationMutation = useCancelConsultation();

  if (isLoading) {
    return <ConsultationsSkeleton />;
  }

  if (isError || !consultation) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <ResourceUnavailableState resourceType="consultation" />
      </div>
    );
  }

  const handleCancel = () => {
    cancelConsultationMutation.mutate(consultation.id, {
      onSuccess: () => {
        navigate("/app/consultations");
      },
    });
  };

  const isCompleted = consultation.stage === "complete";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          to="/app/consultations"
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 font-medium"
        >
          <AppIcon icon={ArrowLeft01Icon} size="xs" />
          Consultations
        </Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <span className="font-semibold text-[var(--foreground)]">
          Care Episode #{consultation.id.slice(0, 8)}
        </span>
      </div>

      {/* Header with Status and Actions */}
      <CareEpisodeHeader
        consultation={consultation}
        isCancelling={cancelConsultationMutation.isPending}
        onCancel={handleCancel}
        onReschedule={() => {
          if (consultation.clinician) {
            navigate(`/app/consultations/book/${consultation.clinician.id}`);
          }
        }}
        onJoinRoom={() => {
          navigate(`/app/consultations/${consultation.id}/room`);
        }}
      />

      {/* Progress Journey */}
      <ConsultationJourney currentStage={consultation.stage} />

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {isCompleted ? (
            <VisitRecord
              record={{
                consultationId: consultation.id,
                completedAt: consultation.fullDateTimeFormatted,
                doctorName: consultation.doctorName,
                specialty: consultation.clinician?.specialty || "Maternal Healthcare",
                summaryNotes:
                  "Comprehensive review of 2nd-trimester glucose profiles. Blood glucose targets well maintained with slight post-dinner elevation. Continued adherence to low-glycemic dietary distribution advised.",
                prescriptions: [
                  {
                    id: "rx-1",
                    medicationName: "Prenatal Multivitamin with Methylfolate",
                    dosage: "1 Tablet",
                    frequency: "Once Daily",
                    duration: "30 Days",
                    instructions: "Take with breakfast.",
                  },
                  {
                    id: "rx-2",
                    medicationName: "Calcium Carbonate with Vitamin D3",
                    dosage: "500 mg",
                    frequency: "Twice Daily",
                    duration: "30 Days",
                    instructions: "Take after meals.",
                  },
                ],
                followUpRecommended: "Follow-up consultation in 3 weeks with new HbA1c lab report.",
              }}
            />
          ) : (
            <PreparationPanel />
          )}
        </div>

        <div className="lg:col-span-1">
          <VisitContextCard consultation={consultation} />
        </div>
      </div>
    </div>
  );
}
