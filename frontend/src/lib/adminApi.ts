import { http } from "@/lib/api";

export interface AdminPlayer {
  id:                  number;
  full_name:           string;
  first_name:          string;
  last_name:           string;
  position:            string;
  jersey_number:       number | null;
  in_wc_prelista_2026: boolean;
  active:              boolean;
  federation_id:       number;
  club_id:             number | null;
}

export interface AdminClub {
  id:           number;
  name:         string;
  short_name:   string | null;
  country:      string | null;
  country_code: string | null;
  city:         string | null;
  league_name:  string | null;
}

export interface AdminFederation {
  id:           number;
  country:      string;
  country_code: string;
  short_name:   string;
}

export const adminApi = {
  // Players
  getPlayers: () =>
    http.get<AdminPlayer[]>("/admin/players").then((r) => r.data),
  createPlayer: (data: {
    federation_id:        number;
    first_name:           string;
    last_name:            string;
    position:             string;
    jersey_number?:       number | null;
    active?:              boolean;
    in_wc_prelista_2026?: boolean;
  }) =>
    http.post<AdminPlayer>("/admin/players", data).then((r) => r.data),
  updatePlayer: (id: number, data: Partial<AdminPlayer>) =>
    http.put<AdminPlayer>(`/admin/players/${id}`, data).then((r) => r.data),
  deletePlayer: (id: number) => http.delete(`/admin/players/${id}`),

  // Clubs
  getClubs: () =>
    http.get<AdminClub[]>("/admin/clubs").then((r) => r.data),
  createClub: (data: {
    name:          string;
    short_name?:   string | null;
    country?:      string | null;
    country_code?: string | null;
    city?:         string | null;
    league_name?:  string | null;
  }) =>
    http.post<AdminClub>("/admin/clubs", data).then((r) => r.data),
  updateClub: (id: number, data: Partial<AdminClub>) =>
    http.put<AdminClub>(`/admin/clubs/${id}`, data).then((r) => r.data),
  deleteClub: (id: number) => http.delete(`/admin/clubs/${id}`),

  // Federations (para select al crear jugadores)
  getFederations: () =>
    http
      .get<{ data: AdminFederation[] }>("/federations")
      .then((r) => r.data.data),

  // Confederations admin CRUD
  getConfederations: () =>
    http.get<AdminConfederation[]>("/admin/confederations").then((r) => r.data),
  createConfederation: (data: Partial<AdminConfederation>) =>
    http.post<AdminConfederation>("/admin/confederations", data).then((r) => r.data),
  updateConfederation: (id: number, data: Partial<AdminConfederation>) =>
    http.put<AdminConfederation>(`/admin/confederations/${id}`, data).then((r) => r.data),
  deleteConfederation: (id: number) =>
    http.delete(`/admin/confederations/${id}`),

  // Federations admin CRUD
  getAdminFederations: () =>
    http.get<AdminFederationRow[]>("/admin/federations").then((r) => r.data),
  createFederation: (data: Partial<AdminFederationRow>) =>
    http.post<AdminFederationRow>("/admin/federations", data).then((r) => r.data),
  updateFederation: (id: number, data: Partial<AdminFederationRow>) =>
    http.put<AdminFederationRow>(`/admin/federations/${id}`, data).then((r) => r.data),
  deleteFederation: (id: number) =>
    http.delete(`/admin/federations/${id}`),
};

// ── New admin types ────────────────────────────────────────

export interface AdminConfederation {
  id:                   number;
  name:                 string;
  full_name:            string;
  region:               string;
  president:            string | null;
  headquarters_city:    string | null;
  headquarters_country: string | null;
  founded_year:         number | null;
  member_nations:       number | null;
  federations_count?:   number;
}

export interface AdminFederationRow {
  id:                 number;
  confederation_id:   number;
  confederation_name: string | null;
  name:               string;
  short_name:         string;
  country:            string;
  country_code:       string;
  continent:          string;
  fifa_ranking:       number | null;
  qualified_wc_2026:  boolean;
  head_coach:         string | null;
  founded_year:       number | null;
}
