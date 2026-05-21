"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FormationName, PlacedPlayersMap, Player } from "@/types";
import { PLAYERS } from "@/lib/players";

interface SelectionState {
  // Dynamic player catalog (starts with static fallback, updated from API)
  players:    Player[];
  playersMap: Record<number, Player>;
  setPlayers: (players: Player[]) => void;

  // Squad of 23
  selectedPlayers: number[];
  addPlayer:       (id: number) => void;
  removePlayer:    (id: number) => void;
  togglePlayer:    (id: number) => boolean;

  // Starting 11
  placedMap:      PlacedPlayersMap;
  formation:      FormationName;
  setFormation:   (f: FormationName) => void;
  placeOnSlot:    (slot: string, playerId: number) => void;
  removeFromSlot: (slot: string) => void;
  resetLineup:    () => void;

  // Full reset
  resetAll: () => void;
}

const SQUAD_SIZE = 23;

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set, get) => ({
      // ── Player catalog ────────────────────────────────
      players:    PLAYERS,
      playersMap: Object.fromEntries(PLAYERS.map((p) => [p.id, p])),

      setPlayers: (players) =>
        set({
          players,
          playersMap: Object.fromEntries(players.map((p) => [p.id, p])),
        }),

      // ── Squad of 23 ──────────────────────────────────
      selectedPlayers: [],

      addPlayer: (id) =>
        set((s) => ({
          selectedPlayers:
            s.selectedPlayers.length < SQUAD_SIZE
              ? [...s.selectedPlayers, id]
              : s.selectedPlayers,
        })),

      removePlayer: (id) =>
        set((s) => ({
          selectedPlayers: s.selectedPlayers.filter((x) => x !== id),
          placedMap: Object.fromEntries(
            Object.entries(s.placedMap).filter(([, v]) => v !== id)
          ),
        })),

      togglePlayer: (id) => {
        const { selectedPlayers, addPlayer, removePlayer } = get();
        if (selectedPlayers.includes(id)) {
          removePlayer(id);
          return false;
        }
        if (selectedPlayers.length >= SQUAD_SIZE) return false;
        addPlayer(id);
        return true;
      },

      // ── Starting 11 ──────────────────────────────────
      placedMap: {},
      formation: "4-3-3",

      setFormation: (f) => set({ formation: f, placedMap: {} }),

      placeOnSlot: (slot, playerId) =>
        set((s) => {
          const cleaned = Object.fromEntries(
            Object.entries(s.placedMap).filter(([, v]) => v !== playerId)
          );
          return { placedMap: { ...cleaned, [slot]: playerId } };
        }),

      removeFromSlot: (slot) =>
        set((s) => {
          const next = { ...s.placedMap };
          delete next[slot];
          return { placedMap: next };
        }),

      resetLineup: () => set({ placedMap: {}, formation: "4-3-3" }),

      // ── Full reset ────────────────────────────────────
      resetAll: () =>
        set({ selectedPlayers: [], placedMap: {}, formation: "4-3-3" }),
    }),
    {
      name: "colombia-mundialista-2026",
      partialize: (s) => ({
        selectedPlayers: s.selectedPlayers,
        placedMap:       s.placedMap,
        formation:       s.formation,
        // players y playersMap NO se persisten — vienen de la API en cada sesión
      }),
    }
  )
);
