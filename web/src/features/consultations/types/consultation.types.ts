export type ConsultationBackendStatus =
  | "booked"
  | "confirmed"
  | "scheduled"
  | "ready"
  | "preparing"
  | "in_progress"
  | "active"
  | "completed"
  | "cancelled"
  | "no_show";

export type CareEpisodeStage = "booked" | "prepare" | "consult" | "complete" | "cancelled";

export type ConsultationModeType = "video" | "chat" | "in_person";

export interface ClinicianProfile {
  id: string;
  name: string;
  specialty: string;
  title: string;
  experienceYears: number;
  clinicOrHospital?: string;
  languages?: string[];
  bio: string;
  avatarUrl?: string;
  initials: string;
  supportedModes: ConsultationModeType[];
  isAvailableToday?: boolean;
  nextAvailableSlotFormatted?: string;
  consultationFeeFormatted?: string;
  timezone: string;
}

export interface TimeSlot {
  id: string;
  time24: string; // "16:30"
  timeFormatted: string; // "4:30 PM"
  period: "morning" | "afternoon" | "evening";
  isAvailable: boolean;
  datetimeIso: string;
}

export interface ConsultationRecord {
  id: string;
  userId?: string;
  patientName: string;
  doctorName: string;
  consultationType: string;
  appointmentDate: string; // "YYYY-MM-DD"
  appointmentTime: string; // "10:30 AM" or "10:30"
  symptoms?: string | null;
  status: ConsultationBackendStatus;
  createdAt?: string;

  // Domain mapped fields
  stage: CareEpisodeStage;
  stageLabel: string;
  mode: ConsultationModeType;
  clinician?: ClinicianProfile;
  formattedDate: string; // "Aug 22, 2026" or "Today"
  formattedTime: string; // "4:30 PM"
  fullDateTimeFormatted: string;
  isJoinable: boolean;
  joinAvailableAt?: string;
  isPast: boolean;
}

export interface ConsultationCreatePayload {
  patient_name: string;
  doctor_name: string;
  consultation_type: string;
  appointment_date: string; // "YYYY-MM-DD"
  appointment_time: string;
  symptoms?: string | null;
  status?: string;
}

export interface ConsultationUpdatePayload {
  doctor_name?: string;
  consultation_type?: string;
  appointment_date?: string;
  appointment_time?: string;
  symptoms?: string | null;
  status?: string;
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface VisitRecordData {
  consultationId: string;
  completedAt: string;
  doctorName: string;
  specialty: string;
  summaryNotes?: string;
  prescriptions: PrescriptionItem[];
  followUpRecommended?: string;
}
