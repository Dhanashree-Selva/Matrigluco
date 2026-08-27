export interface AppConfig {
  apiBaseUrl: string;
  appName: string;
  version: string;
  isDevelopment: boolean;
}

export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1",
  appName: "Matrigluco",
  version: "2.0.0",
  isDevelopment: import.meta.env.DEV || false,
};
