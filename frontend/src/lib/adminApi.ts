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

export const adminApi = {
  // Players
  getPlayers: ()                   => http.get<AdminPlayer[]>("/admin/players").then((r) => r.data),
  deletePlayer: (id: number)       => http.delete(`/admin/players/${id}`),
  updatePlayer: (id: number, data: Partial<AdminPlayer>) =>
    http.put<AdminPlayer>(`/admin/players/${id}`, data).then((r) => r.data),

  // Clubs
  getClubs: ()                     => http.get<AdminClub[]>("/admin/clubs").then((r) => r.data),
  deleteClub: (id: number)         => http.delete(`/admin/clubs/${id}`),
  updateClub: (id: number, data: Partial<AdminClub>) =>
    http.put<AdminClub>(`/admin/clubs/${id}`, data).then((r) => r.data),
};
