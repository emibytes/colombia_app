"use client";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { FORMATIONS } from "@/lib/formations";
import { FormationName } from "@/types";
import { useSelectionStore } from "@/stores/selectionStore";
import { useSound } from "@/hooks/useSound";
import { cn } from "@/lib/utils";
import FieldSVG from "./FieldSVG";
import FieldSpot from "./FieldSpot";
import PlayerAvatar from "@/components/ui/PlayerAvatar";
import GoalOverlay from "@/components/ui/GoalOverlay";

const FORMATION_NAMES: FormationName[] = ["4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "4-1-4-1"];

export default function LineupClient() {
  const {
    selectedPlayers, placedMap, formation, playersMap,
    setFormation, placeOnSlot, removeFromSlot,
  } = useSelectionStore();

  const sound = useSound();
  const [activePlayer, setActivePlayer] = useState<number | null>(null);
  const [showGoal, setShowGoal]         = useState(false);
  const [scrolled, setScrolled]         = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const placedCount  = Object.keys(placedMap).length;
  const formationDef = FORMATIONS[formation];

  const handleBenchClick = useCallback((id: number) => {
    const alreadyPlaced = Object.values(placedMap).includes(id);
    if (alreadyPlaced) return;
    setActivePlayer((prev) => (prev === id ? null : id));
    sound.select();
  }, [placedMap, sound]);

  const handleSpotClick = useCallback((slot: string) => {
    if (activePlayer !== null) {
      placeOnSlot(slot, activePlayer);
      setActivePlayer(null);
      sound.place();
      if (placedCount + 1 === 11) {
        sound.goal();
        setShowGoal(true);
      }
    } else if (placedMap[slot]) {
      removeFromSlot(slot);
      sound.deselect();
    }
  }, [activePlayer, placedMap, placedCount, placeOnSlot, removeFromSlot, sound]);

  const handleRemove = useCallback((slot: string) => {
    removeFromSlot(slot);
    sound.deselect();
  }, [removeFromSlot, sound]);

  const handleFormationChange = (f: FormationName) => {
    if (f === formation) return;
    setFormation(f);
    setActivePlayer(null);
  };

  if (selectedPlayers.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center text-center px-4 pt-20">
        <p className="text-[var(--muted)] text-lg mb-4">
          Primero selecciona tus <strong className="text-white">23 jugadores</strong>.
        </p>
        <Link href="/seleccion">
          <button className="bg-[var(--yellow)] text-black font-bold px-6 py-3 rounded-full">
            Ir a selección
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-24 pt-[4.5rem]">
      {/* ── Formation selector bar ─────────────────── */}
      <div className={`sticky top-[4.5rem] z-40 bg-[rgba(5,8,15,0.94)] backdrop-blur-xl transition-shadow duration-300 ${scrolled ? "shadow-[0_6px_24px_rgba(0,0,0,0.6)]" : ""}`}>
        <div className="max-w-screen-xl mx-auto px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <span className="font-display text-sm tracking-widest text-[var(--muted)] shrink-0">FORMACIÓN</span>
          <div className="flex gap-1.5 flex-wrap">
            {FORMATION_NAMES.map((f) => (
              <button
                key={f}
                onClick={() => handleFormationChange(f)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold border transition-all duration-250",
                  formation === f
                    ? "bg-[var(--yellow)] text-black border-[var(--yellow)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--border2)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="ml-auto font-display text-xl tracking-wide shrink-0">
            <span className="text-[var(--yellow)]">{placedCount}</span>
            <span className="text-[var(--muted)]"> / 11</span>
          </span>
        </div>
      </div>
      {/* tricolor separator */}
      <div className="flex h-px">
        <div className="flex-[3] bg-[var(--yellow)]/30" />
        <div className="flex-[2] bg-[var(--blue)]/40" />
        <div className="flex-[1.5] bg-[var(--red)]/35" />
      </div>

      {/* ── Main layout ────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* FIELD */}
        <div>
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 bg-[rgba(252,209,22,0.08)] border border-[var(--border2)] rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--yellow)]">
              Campo de juego · {formation}
            </span>
            <h1 className="font-display text-4xl md:text-5xl mt-2 tracking-wide">
              ARMA TU{" "}
              <span className="text-[var(--yellow)]">11</span>
            </h1>
            <p className="text-[var(--muted)] text-sm mt-1">
              {activePlayer
                ? `Selecciona una posición para ${playersMap[activePlayer]?.name}`
                : "Elige un jugador del banco y luego toca su posición en el campo."}
            </p>
          </div>

          {/* Field container — Double-Bezel */}
          <div className="bg-[rgba(0,48,135,0.06)] border border-[rgba(0,80,200,0.2)] rounded-[2rem] p-2 max-w-sm mx-auto lg:max-w-none">
            <div
              className="relative bg-gradient-to-b from-[#0D3B1A] via-[#115827] to-[#0D3B1A] rounded-[calc(2rem-6px)] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)]"
              style={{ aspectRatio: "0.68" }}
            >
              {/* Grass stripes */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "repeating-linear-gradient(180deg,rgba(255,255,255,0.025) 0px,rgba(255,255,255,0.025) 36px,transparent 36px,transparent 72px)"
                }}
              />
              <FieldSVG />

              {/* Position spots */}
              {formationDef.positions.map((pos) => {
                const playerId = placedMap[pos.slot];
                const player   = playerId ? playersMap[playerId] : undefined;
                return (
                  <FieldSpot
                    key={pos.slot}
                    pos={pos}
                    player={player}
                    active={activePlayer !== null && !placedMap[pos.slot]}
                    onSpotClick={handleSpotClick}
                    onRemove={handleRemove}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* BENCH SIDEBAR */}
        <aside className="lg:sticky lg:top-[8rem]">
          <p className="font-display text-lg tracking-widest text-[var(--muted)] mb-3">BANCO · 23</p>
          <div className="flex flex-col gap-1.5 max-h-[65vh] overflow-y-auto pr-1">
            <AnimatePresence>
              {selectedPlayers.map((id, i) => {
                const player  = playersMap[id];
                if (!player) return null;
                const placed   = Object.values(placedMap).includes(id);
                const isActive = activePlayer === id;

                return (
                  <motion.button
                    key={id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0  }}
                    transition={{ delay: i * 0.02, type: "spring", stiffness: 260, damping: 24 }}
                    onClick={() => handleBenchClick(id)}
                    disabled={placed}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-2 rounded-xl border text-left",
                      "transition-all duration-250",
                      placed
                        ? "opacity-30 pointer-events-none border-transparent"
                        : isActive
                          ? "border-[var(--yellow)] bg-[rgba(252,209,22,0.08)] shadow-[0_0_12px_rgba(252,209,22,0.15)]"
                          : "border-[var(--border)] hover:border-[var(--border2)] hover:translate-x-1"
                    )}
                  >
                    <PlayerAvatar name={player.name} group={player.group} photo={player.photo} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.78rem] font-semibold truncate">{player.name}</p>
                      <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide">{player.position}</p>
                    </div>
                    {placed && (
                      <span className="text-[10px] text-[var(--yellow)] font-bold shrink-0">EN CAMPO</span>
                    )}
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[var(--yellow)] shrink-0 animate-ping" />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </aside>
      </div>

      {/* ── Bottom CTA ─────────────────────────────── */}
      <AnimatePresence>
        {placedCount === 11 && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(5,8,15,0.95)] backdrop-blur-xl border-t border-[var(--border)] px-4 py-3"
            initial={{ y: 80 }}
            animate={{ y: 0  }}
            exit={{ y: 80 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
              <p className="text-sm text-[var(--muted)]">
                ¡Tu <strong className="text-[var(--yellow)]">11 ideal</strong> está completo!
              </p>
              <Link href="/resultado">
                <motion.button
                  className="group flex items-center gap-2.5 bg-[var(--yellow)] text-black font-bold px-6 py-2.5 rounded-full text-sm"
                  whileHover={{ scale: 1.03, boxShadow: "0 0 32px rgba(252,209,22,0.35)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Ver resultado y guardar
                  <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
                    <ArrowRight size={14} weight="bold" />
                  </span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GoalOverlay show={showGoal} text="¡11 IDEAL!" onDone={() => setShowGoal(false)} />
    </div>
  );
}
