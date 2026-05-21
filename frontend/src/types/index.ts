// ─── Player ──────────────────────────────────────────────────────────────────
export type PlayerGroup = "GK" | "DEF" | "MID" | "FWD";

export interface Player {
  id:       number;
  name:     string;
  position: string;   // display label (Spanish, shown to user)
  group:    PlayerGroup;
  age:      number;
  club:     string;
  country:  string;
}

// ─── Formation ───────────────────────────────────────────────────────────────
export type FormationName =
  | "4-3-3"
  | "4-4-2"
  | "4-2-3-1"
  | "3-5-2"
  | "4-1-4-1";

export interface FieldPosition {
  slot:  string;
  label: string; // display label (Spanish, shown to user)
  x:     number; // % from left
  y:     number; // % from top
}

export interface Formation {
  name:      FormationName;
  positions: FieldPosition[];
}

// ─── Lineup state ─────────────────────────────────────────────────────────────
/** slot → playerId */
export type PlacedPlayersMap = Record<string, number>;

// ─── API ─────────────────────────────────────────────────────────────────────
export interface SaveSelectionPayload {
  session_id:      string;
  squad_players:   number[];
  starting_eleven: number[];
  formation:       FormationName;
}

export interface StatsResponse {
  ok:                boolean;
  total_selections:  number;
  top_squad:         Array<{ id: number; name: string; votes: number }>;
  top_eleven:        Array<{ id: number; name: string; votes: number }>;
}
