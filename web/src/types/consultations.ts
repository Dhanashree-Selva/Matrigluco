export type ConsultationType = "video" | "in_person";
export type ConsultationStatus = "booked" | "completed" | "cancelled" | "in_progress";

export interface ConsultationRecord {
  id: string;
  user_id?: string;
  provider_name: string;
  provider_specialty: string;
  consultation_type: ConsultationType;
  scheduled_at: string;
  status: ConsultationStatus;
  notes?: string | null;
  meeting_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ConsultationCreate {
  provider_name: string;
  provider_specialty?: string;
  consultation_type: ConsultationType;
  scheduled_at: string;
  notes?: string;
}

export interface ConsultationListResponse {
  items: ConsultationRecord[];
  total: number;
}
