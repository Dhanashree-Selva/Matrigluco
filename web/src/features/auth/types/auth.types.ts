export interface User {
  id: string | number;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  is_active?: boolean;
  is_verified?: boolean;
  role?: string;
  pregnancy_week?: number | null;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  expected_due_date?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface MessageResponse {
  message: string;
}
