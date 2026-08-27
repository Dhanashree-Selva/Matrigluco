import { describe, it, expect } from "vitest";
import {
  mapStatusToCareStage,
  getStageDisplayLabel,
  mapApiToConsultationRecord,
  RawAppointmentApiItem,
} from "../mappers/consultation.mapper";
import { ACCREDITED_CLINICIANS } from "../data/clinicians.data";

describe("Consultation Domain Mappers", () => {
  it("maps backend status strings to unified Care Episode stages", () => {
    expect(mapStatusToCareStage("booked")).toBe("booked");
    expect(mapStatusToCareStage("confirmed")).toBe("booked");
    expect(mapStatusToCareStage("scheduled")).toBe("booked");
    expect(mapStatusToCareStage("ready")).toBe("prepare");
    expect(mapStatusToCareStage("preparing")).toBe("prepare");
    expect(mapStatusToCareStage("in_progress")).toBe("consult");
    expect(mapStatusToCareStage("active")).toBe("consult");
    expect(mapStatusToCareStage("completed")).toBe("complete");
    expect(mapStatusToCareStage("cancelled")).toBe("cancelled");
    expect(mapStatusToCareStage("no_show")).toBe("cancelled");
  });

  it("returns appropriate human-readable display labels for stages", () => {
    expect(getStageDisplayLabel("booked")).toBe("Scheduled");
    expect(getStageDisplayLabel("prepare")).toBe("Ready to Prepare");
    expect(getStageDisplayLabel("consult")).toBe("In Consultation");
    expect(getStageDisplayLabel("complete")).toBe("Completed");
    expect(getStageDisplayLabel("cancelled")).toBe("Cancelled");
  });

  it("maps RawAppointmentApiItem to full ConsultationRecord with clinician association", () => {
    const raw: RawAppointmentApiItem = {
      id: "apt-1234-uuid",
      user_id: "usr-456",
      patient_name: "Sarah Jenkins",
      doctor_name: "Dr. Priya Sharma",
      consultation_type: "Video Consultation",
      appointment_date: "2026-08-22",
      appointment_time: "16:30",
      symptoms: "Glycemic review for 24 weeks gestation",
      status: "booked",
      created_at: "2026-08-18T10:00:00Z",
    };

    const record = mapApiToConsultationRecord(raw, ACCREDITED_CLINICIANS);

    expect(record.id).toBe("apt-1234-uuid");
    expect(record.patientName).toBe("Sarah Jenkins");
    expect(record.doctorName).toBe("Dr. Priya Sharma");
    expect(record.stage).toBe("booked");
    expect(record.stageLabel).toBe("Scheduled");
    expect(record.mode).toBe("video");
    expect(record.formattedTime).toBe("4:30 PM");
    expect(record.clinician).toBeDefined();
    expect(record.clinician?.specialty).toBe("Obstetrics & Gynecology");
  });
});
