import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useClinician } from "../hooks/useClinicians";
import { ClinicianPortrait } from "../components/doctor/ClinicianPortrait";
import { ClinicianOverview } from "../components/doctor/ClinicianOverview";
import { ClinicianAvailability } from "../components/doctor/ClinicianAvailability";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { ArrowLeft01Icon, Calendar01Icon, UserIcon } from "@hugeicons/core-free-icons";

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clinician = useClinician(id);

  if (!clinician) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)] max-w-lg mx-auto my-12 space-y-4">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Clinician Not Found</h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          The requested specialist profile is unavailable or may have been updated.
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
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Back Navigation Bar */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          to="/app/consultations"
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 font-medium"
        >
          <AppIcon icon={ArrowLeft01Icon} size="xs" />
          Consultations
        </Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <span className="font-semibold text-[var(--foreground)]">{clinician.name}</span>
      </div>

      {/* Clinician Portrait Header */}
      <ClinicianPortrait clinician={clinician} />

      {/* Tabs: Overview & Availability */}
      <Tabs defaultValue="availability" className="space-y-6">
        <TabsList className="bg-[var(--card)] border border-[var(--border)] p-1 rounded-2xl">
          <TabsTrigger
            value="availability"
            className="text-xs font-semibold gap-1.5 rounded-xl data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white"
          >
            <AppIcon icon={Calendar01Icon} size="xxs" />
            Book Availability
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="text-xs font-semibold gap-1.5 rounded-xl data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white"
          >
            <AppIcon icon={UserIcon} size="xxs" />
            Clinical Background
          </TabsTrigger>
        </TabsList>

        <TabsContent value="availability">
          <ClinicianAvailability clinician={clinician} />
        </TabsContent>

        <TabsContent value="overview">
          <ClinicianOverview clinician={clinician} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
