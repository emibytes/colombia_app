import axios from "axios";
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";
import { SaveSelectionPayload, StatsResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export const http = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Attach Bearer token when present (authStore writes to localStorage via persist)
http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw   = localStorage.getItem("colombia-auth");
      const state = raw ? JSON.parse(raw) : null;
      const token = state?.state?.token as string | undefined;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function logout(): Promise<void> {
  await http.post("/auth/logout");
}

export async function getMe(): Promise<AuthResponse["user"]> {
  const { data } = await http.get<{ user: AuthResponse["user"] }>("/auth/me");
  return data.user;
}

export function oauthRedirectUrl(provider: "google" | "facebook"): string {
  return `${API_URL}/auth/${provider}/redirect`;
}

// ─── Selections ───────────────────────────────────────────────────────────────

export async function saveSelection(payload: SaveSelectionPayload) {
  const { data } = await http.post("/selections", payload);
  return data as { ok: boolean; message: string; id?: number };
}

export async function getStats(): Promise<StatsResponse> {
  const { data } = await http.get("/selections/stats");
  return data as StatsResponse;
}
