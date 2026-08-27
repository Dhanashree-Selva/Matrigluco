import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useConsultations } from "../hooks/useConsultations";
import { ConsultationsHeader } from "../components/ConsultationsHeader";
import { NextCareEpisode } from "../components/NextCareEpisode";
import { CareMatch } from "../components/CareMatch";
import { ConsultationsSkeleton } from "../components/ConsultationEmptyState";
import { Button, Avatar, AvatarFallback, AvatarImage } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { Calendar01Icon, ArrowRight01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

export default function ConsultationsPage() {
  const navigate = useNavigate();
  const { data: consultations = [], isLoading } = useConsultations();

  // Next upcoming active consultation
  const upcomingConsultations = useMemo(() => {
    return consultations.filter(
      (c) => c.stage !== "complete" && c.stage !== "cancelled"
    );
  }, [consultations]);

  const pastConsultations = useMemo(() => {
    return consultations.filter(
      (c) => c.stage === "complete" || c.stage === "cancelled"
    );
  }, [consultations]);

  const nextConsultation = upcomingConsultations[0];

  if (isLoading) {
    return <ConsultationsSkeleton />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 space-y-8">
      {/* Consultations Master Header */}
      <ConsultationsHeader
        upcomingCount={upcomingConsultations.length}
        onScheduleClick={() => {
          const careMatchEl = document.getElementById("care-match-section");
          if (careMatchEl) {
            careMatchEl.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />

      {/* Prominent Next Care Episode */}
      {nextConsultation && (
        <NextCareEpisode consultation={nextConsultation} />
      )}

      {/* Additional Upcoming Episodes if multiple */}
      {upcomingConsultations.length > 1 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-1">
            Other Upcoming Sessions ({upcomingConsultations.length - 1})
          </h2>
          <div className="space-y-2.5">
            {upcomingConsultations.slice(1).map((apt) => (
              <div
                key={apt.id}
                onClick={() => navigate(`/app/consultations/${apt.id}`)}
                className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 rounded-xl border border-[var(--border)]">
                    {apt.clinician?.avatarUrl && (
                      <AvatarImage src={apt.clinician.avatarUrl} alt={apt.doctorName} />
                    )}
                    <AvatarFallback className="bg-[var(--accent-soft)] text-[var(--primary)] font-bold text-xs">
                      {apt.clinician?.initials || apt.doctorName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                      {apt.doctorName}
                    </h3>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      {apt.fullDateTimeFormatted} · {apt.consultationType}
                    </p>
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="text-xs font-semibold gap-1 text-[var(--primary)]">
                  Details <AppIcon icon={ArrowRight01Icon} size="xxs" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Care Match Discovery Section */}
      <div id="care-match-section">
        <CareMatch
          onSelectDoctor={(clinicianId) =>
            navigate(`/app/consultations/book/${clinicianId}`)
          }
        />
      </div>

      {/* Past Care History Section */}
      {pastConsultations.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
                Consultation History
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Review past care episodes, clinician directives, and visit summaries.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {pastConsultations.map((past) => (
              <div
                key={past.id}
                onClick={() => navigate(`/app/consultations/${past.id}`)}
                className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-[var(--muted-foreground)] flex items-center justify-center font-bold text-xs shrink-0">
                    <AppIcon icon={Calendar01Icon} size="xs" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                      {past.doctorName}
                    </h3>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      {past.fullDateTimeFormatted} · {past.consultationType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    past.stage === "complete"
                      ? "bg-slate-500/10 text-[var(--muted-foreground)]"
                      : "bg-rose-500/10 text-rose-600"
                  }`}>
                    {past.stage === "complete" ? "Completed" : "Cancelled"}
                  </span>
                  <AppIcon icon={ArrowRight01Icon} size="xs" className="text-[var(--muted-foreground)]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
