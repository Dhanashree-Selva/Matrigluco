import {
  ConsultationBackendStatus,
  CareEpisodeStage,
  ConsultationRecord,
  ClinicianProfile,
} from "../types/consultation.types";
import {
  parseAppointmentDate,
  formatAppointmentDateLabel,
  normalizeTimeString,
  resolveConsultationMode,
} from "../utils/consultation-dates";

/**
 * Raw API schema returned by FastAPI GET/POST/PATCH /api/v1/consultations
 */
export interface RawAppointmentApiItem {
  id: string;
  user_id?: string | null;
  patient_name: string;
  doctor_name: string;
  consultation_type?: string | null;
  appointment_date: string; // "YYYY-MM-DD"
  appointment_time: string;
  symptoms?: string | null;
  status: string;
  created_at?: string | null;
}

/**
 * Maps raw backend appointment status string to Care Episode stage.
 */
export function mapStatusToCareStage(backendStatus?: string): CareEpisodeStage {
  if (!backendStatus) return "booked";
  const s = backendStatus.toLowerCase().trim();

  switch (s) {
    case "booked":
    case "confirmed":
    case "scheduled":
      return "booked";
    case "ready":
    case "preparing":
      return "prepare";
    case "in_progress":
    case "active":
    case "consult":
      return "consult";
    case "completed":
    case "done":
      return "complete";
    case "cancelled":
    case "canceled":
    case "no_show":
      return "cancelled";
    default:
      return "booked";
  }
}

/**
 * Human-friendly status label.
 */
export function getStageDisplayLabel(stage: CareEpisodeStage): string {
  switch (stage) {
    case "booked":
      return "Scheduled";
    case "prepare":
      return "Ready to Prepare";
    case "consult":
      return "In Consultation";
    case "complete":
      return "Completed";
    case "cancelled":
      return "Cancelled";
  }
}

/**
 * Maps raw API item into strongly-typed ConsultationRecord domain entity.
 */
export function mapApiToConsultationRecord(
  apiItem: RawAppointmentApiItem,
  clinicians: ClinicianProfile[] = []
): ConsultationRecord {
  const stage = mapStatusToCareStage(apiItem.status);
  const stageLabel = getStageDisplayLabel(stage);
  const mode = resolveConsultationMode(apiItem.consultation_type);
  const formattedDate = formatAppointmentDateLabel(apiItem.appointment_date);
  const formattedTime = normalizeTimeString(apiItem.appointment_time);

  const matchedClinician = clinicians.find(
    (c) =>
      c.name.toLowerCase() === apiItem.doctor_name.toLowerCase() ||
      apiItem.doctor_name.toLowerCase().includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(apiItem.doctor_name.toLowerCase())
  );

  const appointmentDateObj = parseAppointmentDate(apiItem.appointment_date);
  const now = new Date();
  const isPast =
    stage === "complete" ||
    stage === "cancelled" ||
    (appointmentDateObj.getTime() < now.setHours(0, 0, 0, 0) && stage === "booked");

  const isJoinable = stage === "consult" || stage === "prepare";

  return {
    id: apiItem.id,
    userId: apiItem.user_id || undefined,
    patientName: apiItem.patient_name,
    doctorName: apiItem.doctor_name,
    consultationType: apiItem.consultation_type || "Video Consultation",
    appointmentDate: apiItem.appointment_date,
    appointmentTime: formattedTime,
    symptoms: apiItem.symptoms || null,
    status: apiItem.status as ConsultationBackendStatus,
    createdAt: apiItem.created_at || undefined,
    stage,
    stageLabel,
    mode,
    clinician: matchedClinician,
    formattedDate,
    formattedTime,
    fullDateTimeFormatted: `${formattedDate} · ${formattedTime}`,
    isJoinable,
    isPast,
  };
}
