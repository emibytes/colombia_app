"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FORMATIONS } from "@/lib/formations";
import { SharedSelectionResponse } from "@/types";
import { useSelectionStore } from "@/stores/selectionStore";
import PlayerAvatar from "@/components/ui/PlayerAvatar";
import FieldSVG from "@/components/field/FieldSVG";
import FieldSpot from "@/components/field/FieldSpot";

interface Props {
  shared: SharedSelectionResponse;
}

const EASE_OUT = [0.32, 0.72, 0, 1] as [number, number, number, number];

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

export default function DuelClient({ shared }: Props) {
  const { selectedPlayers, placedMap, formation, playersMap } = useSelectionStore();

  const myFormationDef     = FORMATIONS[formation];
  const sharedFormationDef = FORMATIONS[shared.formation];

  const sharedPlacedMap = useMemo<Record<string, number>>(() => {
    if (!shared.starting_eleven) return {};
    const def = FORMATIONS[shared.formation];
    return Object.fromEntries(
      def.positions
        .map((pos, i) => [pos.slot, shared.starting_eleven![i]])
        .filter(([, id]) => id !== undefined)
    );
  }, [shared]);

  const commonSquad = useMemo(() => {
    const sharedSet = new Set(shared.squad_players);
    return selectedPlayers.filter((id) => sharedSet.has(id));
  }, [selectedPlayers, shared.squad_players]);

  const hasMyLineup     = Object.keys(placedMap).length === 11;
  const hasSharedLineup = (shared.starting_eleven?.length ?? 0) > 0;

  if (selectedPlayers.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center text-center px-4 pt-20">
        <p className="text-[var(--muted)] text-lg mb-4">
          Primero arma tu propia selección para poder comparar.
        </p>
        <Link href="/seleccion">
          <button className="bg-[var(--yellow)] text-black font-bold px-6 py-3 rounded-full">
            Armar mi selección
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-20">
      {/* Header */}
      <div className="text-center pt-28 pb-10 px-4">
        <motion.div {...fadeUp()}>
          <span className="inline-flex items-center gap-2 bg-[rgba(252,209,22,0.08)] border border-[var(--border2)] rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--yellow)]">
            Modo Duelo · Colombia 2026
          </span>
          <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] leading-tight mt-3">
            TU <span className="text-[var(--yellow)]">SELECCIÓN</span>{" "}
            VS. <span className="text-[var(--blue)]">AMIGO</span>
          </h1>
          <p className="text-[var(--muted)] text-sm mt-2">
            {commonSquad.length} jugadores en común de{" "}
            {Math.min(selectedPlayers.length, shared.squad_players.length)}
          </p>
        </motion.div>
      </div>

      {/* Side-by-side field previews */}
      {hasMyLineup && hasSharedLineup && (
        <div className="max-w-screen-xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {/* My formation */}
          <motion.div
            {...fadeUp(0.1)}
            className="bg-[rgba(252,209,22,0.04)] border border-[var(--border)] rounded-[2rem] p-1.5"
          >
            <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-4">
              <h2 className="font-display text-xl text-[var(--yellow)] tracking-wide mb-3">
                TU 11 · {formation}
              </h2>
              <div className="bg-[rgba(0,48,135,0.06)] border border-[rgba(0,80,200,0.2)] rounded-2xl p-1.5">
                <div
                  className="relative bg-gradient-to-b from-[#0D3B1A] via-[#115827] to-[#0D3B1A] rounded-[calc(1rem-4px)] overflow-hidden"
                  style={{ aspectRatio: "0.68" }}
                >
                  <FieldSVG />
                  {myFormationDef.positions.map((pos) => (
                    <FieldSpot
                      key={pos.slot}
                      pos={pos}
                      player={placedMap[pos.slot] ? playersMap[placedMap[pos.slot]] : undefined}
                      active={false}
                      onSpotClick={() => {}}
                      onRemove={() => {}}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Friend's formation */}
          <motion.div
            {...fadeUp(0.2)}
            className="bg-[rgba(0,80,200,0.06)] border border-[var(--border)] rounded-[2rem] p-1.5"
          >
            <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-4">
              <h2 className="font-display text-xl text-[var(--blue)] tracking-wide mb-3">
                SU 11 · {shared.formation}
              </h2>
              <div className="bg-[rgba(0,48,135,0.06)] border border-[rgba(0,80,200,0.2)] rounded-2xl p-1.5">
                <div
                  className="relative bg-gradient-to-b from-[#0D3B1A] via-[#115827] to-[#0D3B1A] rounded-[calc(1rem-4px)] overflow-hidden"
                  style={{ aspectRatio: "0.68" }}
                >
                  <FieldSVG />
                  {sharedFormationDef.positions.map((pos) => {
                    const playerId = sharedPlacedMap[pos.slot];
                    // shared.players uses number keys but Record<number, SharedPlayer> access
                    const player   = playerId ? (shared.players[playerId] as any) : undefined;
                    return (
                      <FieldSpot
                        key={pos.slot}
                        pos={pos}
                        player={player}
                        active={false}
                        onSpotClick={() => {}}
                        onRemove={() => {}}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Common players */}
      {commonSquad.length > 0 && (
        <motion.div
          {...fadeUp(0.3)}
          className="max-w-screen-xl mx-auto px-4 mb-10"
        >
          <div className="bg-[rgba(252,209,22,0.04)] border border-[var(--border)] rounded-[2rem] p-1.5">
            <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-5">
              <h2 className="font-display text-2xl text-[var(--yellow)] tracking-wide mb-4">
                EN COMÚN · {commonSquad.length} JUGADORES
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {commonSquad.map((id) => {
                  const player = playersMap[id];
                  if (!player) return null;
                  return (
                    <div key={id} className="flex items-center gap-2 bg-white/4 rounded-xl px-3 py-2">
                      <PlayerAvatar name={player.name} group={player.group} size="sm" />
                      <span className="text-xs font-semibold truncate">{player.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* CTAs */}
      <div className="max-w-screen-xl mx-auto px-4 flex flex-wrap gap-3 justify-center">
        <Link href="/resultado">
          <button className="bg-[var(--yellow)] text-black font-bold px-8 py-3.5 rounded-full text-sm">
            Ver mi resultado completo
          </button>
        </Link>
        <Link href="/seleccion">
          <button className="border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--border2)] font-semibold px-6 py-3.5 rounded-full text-sm transition-all duration-300">
            Cambiar mi selección
          </button>
        </Link>
      </div>
    </div>
  );
}
