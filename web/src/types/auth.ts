export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  due_date?: string | null;
  expected_due_date?: string | null;
  is_active: boolean;
  two_factor_auth?: boolean;
  security_logs?: boolean;
  created_at?: string;
  updated_at?: string;
  user_metadata?: {
    full_name?: string;
    expected_due_date?: string;
    two_factor_auth?: boolean;
    security_logs?: boolean;
  };
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserProfile;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
  due_date?: string;
}
