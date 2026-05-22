"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FormationName, PlacedPlayersMap, Player } from "@/types";
import { FORMATIONS } from "@/lib/formations";
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

      setFormation: (f) =>
        set((s) => {
          const newFormationPositions = FORMATIONS[f].positions;
          const newFormationSlots = new Set(
            newFormationPositions.map((pos) => pos.slot)
          );

          // Helper para determinar el tipo de posición
          const getPositionType = (slot: string): string => {
            if (slot === "GK") return "GK";
            if (
              slot === "RB" ||
              slot === "LB" ||
              slot === "CB1" ||
              slot === "CB2" ||
              slot === "CB3" ||
              slot === "RWB" ||
              slot === "LWB"
            )
              return "DEF";
            if (
              slot === "CM1" ||
              slot === "CM2" ||
              slot === "CM3" ||
              slot === "DM" ||
              slot === "DM1" ||
              slot === "DM2" ||
              slot === "RM" ||
              slot === "LM" ||
              slot === "AM"
            )
              return "MID";
            return "FWD"; // RW, LW, ST, ST1, ST2
          };

          const newPlacedMap: PlacedPlayersMap = {};
          const usedSlots = new Set<string>();
          const playersToReplace: Array<{
            playerId: number;
            oldSlot: string;
            positionType: string;
          }> = [];

          // Paso 1: Mantener jugadores en sus slots actuales si existen
          for (const [slot, playerId] of Object.entries(s.placedMap)) {
            if (newFormationSlots.has(slot)) {
              newPlacedMap[slot] = playerId;
              usedSlots.add(slot);
            } else {
              playersToReplace.push({
                playerId,
                oldSlot: slot,
                positionType: getPositionType(slot),
              });
            }
          }

          // Paso 2: Crear pool de slots disponibles por tipo
          const availableSlotsByType: Record<string, string[]> = {
            GK: [],
            DEF: [],
            MID: [],
            FWD: [],
          };

          for (const pos of newFormationPositions) {
            if (!usedSlots.has(pos.slot)) {
              const type = getPositionType(pos.slot);
              availableSlotsByType[type].push(pos.slot);
            }
          }

          // Paso 3: Reasignar jugadores en orden, garantizando que todos se coloquen
          for (const { playerId, positionType } of playersToReplace) {
            const availableSlots = availableSlotsByType[positionType];

            if (availableSlots.length > 0) {
              // Usar el primer slot disponible de ese tipo
              const slot = availableSlots.shift()!;
              newPlacedMap[slot] = playerId;
              usedSlots.add(slot);
            } else {
              // Si no hay del mismo tipo, buscar compatibles (fallback)
              let placed = false;

              // Intentar en otros tipos (DEF → MID, etc.)
              const fallbackOrder = {
                GK: ["DEF", "MID", "FWD"],
                DEF: ["MID", "FWD"],
                MID: ["DEF", "FWD"],
                FWD: ["MID", "DEF"],
              };

              for (const fallbackType of fallbackOrder[
                positionType as keyof typeof fallbackOrder
              ] || []) {
                if (availableSlotsByType[fallbackType].length > 0) {
                  const slot = availableSlotsByType[fallbackType].shift()!;
                  newPlacedMap[slot] = playerId;
                  usedSlots.add(slot);
                  placed = true;
                  break;
                }
              }

              // Como último recurso (no debería pasar), simplemente colocar en cualquier disponible
              if (!placed) {
                for (const typeSlots of Object.values(availableSlotsByType)) {
                  if (typeSlots.length > 0) {
                    const slot = typeSlots.shift()!;
                    newPlacedMap[slot] = playerId;
                    usedSlots.add(slot);
                    break;
                  }
                }
              }
            }
          }

          return { formation: f, placedMap: newPlacedMap };
        }),

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
