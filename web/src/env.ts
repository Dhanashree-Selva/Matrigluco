import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .url("VITE_API_BASE_URL must be a valid URL")
    .default("http://127.0.0.1:8000/api/v1"),
  VITE_SITE_URL: z
    .string()
    .url("VITE_SITE_URL must be a valid URL")
    .default("http://localhost:5173"),
  VITE_APP_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),
});

export const env = envSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_SITE_URL: import.meta.env.VITE_SITE_URL,
  VITE_APP_ENV: import.meta.env.MODE || import.meta.env.VITE_APP_ENV,
});
