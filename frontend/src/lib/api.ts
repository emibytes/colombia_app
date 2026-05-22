import axios from "axios";
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";
import { Player, SaveSelectionPayload, StatsResponse, SharedSelectionResponse } from "@/types";

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
  return data as { ok: boolean; message: string; id?: number; share_token?: string };
}

export async function getStats(): Promise<StatsResponse> {
  const { data } = await http.get("/selections/stats");
  return data as StatsResponse;
}

export async function getSharedSelection(token: string): Promise<SharedSelectionResponse> {
  const { data } = await http.get<SharedSelectionResponse>(`/selections/share/${token}`);
  return data;
}

// ─── Players ──────────────────────────────────────────────────────────────────

const POSITION_GROUP: Record<string, Player["group"]> = {
  goalkeeper: "GK",
  defender:   "DEF",
  midfielder: "MID",
  forward:    "FWD",
};

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: "Portero",
  defender:   "Defensa",
  midfielder: "Mediocampista",
  forward:    "Delantero",
};

interface ApiPlayerRaw {
  id:                  number;
  full_name:           string;
  position:            string;
  age:                 number | null;
  nationality:         string | null;
  in_wc_prelista_2026: boolean;
  club:                { name: string } | null;
  photo_url:           string | null;
}

export async function getColombiaPlayers(): Promise<Player[]> {
  const { data } = await http.get<{ data: ApiPlayerRaw[] }>(
    "/federations/COL/players",
    { params: { prelista: 1 } }
  );
  return data.data.map((p) => ({
    id:       p.id,
    name:     p.full_name,
    position: POSITION_LABEL[p.position] ?? p.position,
    group:    POSITION_GROUP[p.position] ?? "MID",
    age:      p.age ?? 0,
    club:     p.club?.name ?? "",
    country:  p.nationality ?? "",
    photo:    p.photo_url ?? null,
  }));
}
