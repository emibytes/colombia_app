"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, SpeakerSlash, SpeakerHigh } from "@phosphor-icons/react";
import { PLAYERS } from "@/lib/players";
import { GROUP_LABELS } from "@/lib/players";
import { PlayerGroup } from "@/types";
import { useSelectionStore } from "@/stores/selectionStore";
import { useSound } from "@/hooks/useSound";
import PlayerCard from "./PlayerCard";
import GoalOverlay from "@/components/ui/GoalOverlay";

const SQUAD_SIZE = 23;
const FILTERS = ["ALL", "GK", "DEF", "MID", "FWD"] as const;
type Filter = (typeof FILTERS)[number];

export default function SelectionClient() {
  const { selectedPlayers, togglePlayer } = useSelectionStore();
  const sound = useSound();
  const [filter, setFilter]     = useState<Filter>("ALL");
  const [showGoal, setShowGoal] = useState(false);

  const count    = selectedPlayers.length;
  const pct      = Math.round((count / SQUAD_SIZE) * 100);
  const complete = count === SQUAD_SIZE;

  const filtered = PLAYERS.filter(
    (p) => filter === "ALL" || p.group === filter
  );

  const handleToggle = useCallback(
    (id: number) => {
      const player = PLAYERS.find((p) => p.id === id);
      if (!player) return;

      const isSelected = selectedPlayers.includes(id);

      if (isSelected) {
        togglePlayer(id);
        sound.deselect();
        return;
      }

      if (count >= SQUAD_SIZE) {
        sound.limit();
        return;
      }

      const added = togglePlayer(id);
      if (added) {
        if (count + 1 === SQUAD_SIZE) {
          sound.goal();
          setShowGoal(true);
        } else {
          sound.select();
        }
      }
    },
    [selectedPlayers, count, togglePlayer, sound]
  );

  return (
    <div className="min-h-dvh pb-28">
      {/* ── Sticky counter bar ─────────────────────────── */}
      <div className="sticky top-[4.5rem] z-40 bg-[rgba(5,8,15,0.92)] backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">

          {/* Counter */}
          <div className="font-display text-2xl tracking-wide shrink-0">
            <span className="text-[var(--yellow)] text-3xl">{count}</span>
            <span className="text-[var(--muted)]"> / {SQUAD_SIZE}</span>
          </div>

          {/* Progress bar */}
          <div className="flex-1 min-w-[120px] h-1 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--yellow)] to-[var(--red)] rounded-full"
              style={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all duration-250 ${
                  filter === f
                    ? "bg-[var(--yellow)] text-black border-[var(--yellow)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border2)] hover:text-white"
                }`}
              >
                {GROUP_LABELS[f as PlayerGroup | "ALL"]}
              </button>
            ))}
          </div>

          {/* Sound toggle */}
          <button
            onClick={sound.toggle}
            className="p-2 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--border2)] transition-all duration-250"
          >
            {sound.muted
              ? <SpeakerSlash size={16} />
              : <SpeakerHigh  size={16} />}
          </button>
        </div>
      </div>

      {/* ── Player grid ────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 pt-6">

        {/* Section heading */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <span className="inline-flex items-center gap-2 bg-[rgba(252,209,22,0.08)] border border-[var(--border2)] rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--yellow)]">
            Prelista oficial · 36 jugadores
          </span>
          <h1 className="font-display text-4xl md:text-5xl mt-2 tracking-wide">
            ELIGE TUS{" "}
            <span className="text-[var(--yellow)]">23</span>
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            Haz clic en cada jugador para seleccionarlo o deseleccionarlo.
          </p>
        </motion.div>

        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
          >
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0  }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              >
                <PlayerCard
                  player={p}
                  selected={selectedPlayers.includes(p.id)}
                  disabled={count >= SQUAD_SIZE && !selectedPlayers.includes(p.id)}
                  onToggle={handleToggle}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Sticky bottom save bar ──────────────────────── */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(5,8,15,0.95)] backdrop-blur-xl border-t border-[var(--border)] px-4 py-3"
            initial={{ y: 80  }}
            animate={{ y: 0   }}
            exit={{ y: 80 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
              <p className="text-sm text-[var(--muted)]">
                <strong className="text-[var(--yellow)]">{count}</strong> de{" "}
                {SQUAD_SIZE} seleccionados
              </p>
              {complete && (
                <Link href="/once">
                  <motion.button
                    className="group flex items-center gap-2.5 bg-[var(--yellow)] text-black font-bold px-6 py-2.5 rounded-full text-sm"
                    whileHover={{ scale: 1.03, boxShadow: "0 0 32px rgba(252,209,22,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    Elegir mi 11 ideal
                    <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowRight size={14} weight="bold" />
                    </span>
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal overlay */}
      <GoalOverlay
        show={showGoal}
        text="¡23 ELEGIDOS!"
        onDone={() => setShowGoal(false)}
      />
    </div>
  );
}
