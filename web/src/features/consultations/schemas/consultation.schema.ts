import { z } from "zod";

export const appointmentComposerSchema = z.object({
  clinicianId: z.string().min(1, "Please select a clinician"),
  doctorName: z.string().min(1, "Clinician name is required"),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid appointment date"),
  appointmentTime: z.string().min(1, "Please select an available time slot"),
  consultationType: z.enum(["video", "chat", "in_person"]).default("video"),
  symptoms: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type AppointmentComposerFormValues = z.infer<typeof appointmentComposerSchema>;

export const rescheduleAppointmentSchema = z.object({
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid appointment date"),
  appointmentTime: z.string().min(1, "Please select an available time slot"),
  consultationType: z.enum(["video", "chat", "in_person"]).optional(),
  symptoms: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type RescheduleAppointmentFormValues = z.infer<typeof rescheduleAppointmentSchema>;
