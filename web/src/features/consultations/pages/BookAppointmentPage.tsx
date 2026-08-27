import React from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useClinician } from "../hooks/useClinicians";
import { AppointmentComposer } from "../components/booking/AppointmentComposer";
import { parseAppointmentDate } from "../utils/consultation-dates";
import { Button } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export default function BookAppointmentPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const clinician = useClinician(id);

  const rawDate = searchParams.get("date");
  const rawTime = searchParams.get("time");

  const initialDate = rawDate ? parseAppointmentDate(rawDate) : new Date();
  const initialSlot = rawTime || null;

  if (!clinician) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)] max-w-lg mx-auto my-12 space-y-4">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Clinician Not Found</h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          The requested specialist could not be resolved for scheduling.
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
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
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
        <Link
          to={`/app/consultations/doctor/${clinician.id}`}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium"
        >
          {clinician.name}
        </Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <span className="font-semibold text-[var(--foreground)]">Schedule Appointment</span>
      </div>

      <header>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Schedule Care Episode
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
          Select an available date, time slot, and consultation format with {clinician.name}.
        </p>
      </header>

      {/* Appointment Composer Flow */}
      <AppointmentComposer
        clinician={clinician}
        initialDate={initialDate}
        initialSlot={initialSlot}
        onSuccess={(createdId) => {
          navigate(`/app/consultations/${createdId}/confirmation`);
        }}
      />
    </div>
  );
}
