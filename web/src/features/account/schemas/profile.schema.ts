import { z } from "zod";

export const identityFormSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(150, "Name cannot exceed 150 characters"),
  phone: z
    .string()
    .max(30, "Phone number cannot exceed 30 characters")
    .optional()
    .or(z.literal("")),
  emergencyContact: z
    .string()
    .max(150, "Emergency contact cannot exceed 150 characters")
    .optional()
    .or(z.literal("")),
});

export type IdentityFormValues = z.infer<typeof identityFormSchema>;

export const careContextSchema = z.object({
  pregnancyWeek: z
    .number({ invalid_type_error: "Pregnancy week must be a number" })
    .int()
    .min(0, "Week cannot be negative")
    .max(45, "Pregnancy week must be between 0 and 45")
    .optional()
    .nullable(),
  expectedDueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date (YYYY-MM-DD)")
    .optional()
    .or(z.literal(""))
    .nullable(),
  previousPregnancies: z
    .number({ invalid_type_error: "Previous pregnancies must be a number" })
    .int()
    .min(0, "Cannot be negative")
    .max(20, "Please enter a valid count")
    .optional()
    .nullable(),
  bloodGroup: z
    .string()
    .max(10, "Blood group cannot exceed 10 characters")
    .optional()
    .or(z.literal(""))
    .nullable(),
  age: z
    .number({ invalid_type_error: "Age must be a number" })
    .int()
    .min(12, "Age must be at least 12")
    .max(120, "Please enter a valid age")
    .optional()
    .nullable(),
});

export type CareContextFormValues = z.infer<typeof careContextSchema>;
