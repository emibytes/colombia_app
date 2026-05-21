export interface AuthUser {
  id:    number;
  name:  string;
  email: string;
  role:  "user" | "admin";
}

export interface AuthState {
  user:  AuthUser | null;
  token: string | null;
}

export interface RegisterPayload {
  name:                    string;
  email:                   string;
  password:                string;
  password_confirmation:   string;
  data_treatment_accepted: boolean;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user:  AuthUser;
}
