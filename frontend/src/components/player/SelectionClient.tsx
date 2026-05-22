"use client";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, SpeakerSlash, SpeakerHigh, MagnifyingGlass, X } from "@phosphor-icons/react";
import { GROUP_LABELS } from "@/lib/players";
import { PlayerGroup } from "@/types";
import { useSelectionStore } from "@/stores/selectionStore";
import { useSound } from "@/hooks/useSound";
import { getColombiaPlayers } from "@/lib/api";
import PlayerCard from "./PlayerCard";
import GoalOverlay from "@/components/ui/GoalOverlay";
import PlayerDetailModal from "./PlayerDetailModal";

const SQUAD_SIZE = 23;
const FILTERS = ["ALL", "GK", "DEF", "MID", "FWD"] as const;
type Filter = (typeof FILTERS)[number];

export default function SelectionClient() {
  const { players, setPlayers, selectedPlayers, togglePlayer } = useSelectionStore();
  const sound = useSound();
  const [filter, setFilter]     = useState<Filter>("ALL");
  const [search, setSearch]     = useState("");
  const [showGoal, setShowGoal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  useEffect(() => {
    getColombiaPlayers().then(setPlayers).catch(() => null);
  }, [setPlayers]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const count    = selectedPlayers.length;
  const pct      = Math.round((count / SQUAD_SIZE) * 100);
  const complete = count === SQUAD_SIZE;

  const query    = search.trim().toLowerCase();
  const filtered = players.filter(
    (p) =>
      (filter === "ALL" || p.group === filter) &&
      (query === "" || p.name.toLowerCase().includes(query))
  );

  const handleToggle = useCallback(
    (id: number) => {
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
    <div className="min-h-dvh pb-28 pt-[4.5rem]">
      {/* ── Sticky counter bar ─────────────────────────── */}
      <div className={`sticky top-[4.5rem] z-40 bg-[rgba(5,8,15,0.94)] backdrop-blur-xl transition-shadow duration-300 ${scrolled ? "shadow-[0_6px_24px_rgba(0,0,0,0.6)]" : ""}`}>
        <div className="max-w-screen-xl mx-auto px-4 pt-2.5 pb-2">
          {/* Row 1: counter · progress · sound */}
          <div className="flex items-center gap-3 mb-2">
            <div className="font-display tracking-wide shrink-0">
              <span className="text-[var(--yellow)] text-3xl">{count}</span>
              <span className="text-[var(--muted)] text-2xl"> / {SQUAD_SIZE}</span>
            </div>
            <div className="flex-1 min-w-0 h-1 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--yellow)] to-[var(--red)] rounded-full"
                style={{ width: `${pct}%` }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              />
            </div>
            <button
              onClick={sound.toggle}
              className="p-2 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--border2)] transition-all duration-250 shrink-0"
            >
              {sound.muted ? <SpeakerSlash size={16} /> : <SpeakerHigh size={16} />}
            </button>
          </div>
          {/* Row 2: filter pills — horizontal scroll, never wraps */}
          <div className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all duration-250 ${
                  filter === f
                    ? "bg-[var(--yellow)] text-black border-[var(--yellow)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border2)] hover:text-white"
                }`}
              >
                {GROUP_LABELS[f as PlayerGroup | "ALL"]}
              </button>
            ))}
          </div>
          {/* Row 3: búsqueda por nombre */}
          <div className="relative mt-1.5">
            <MagnifyingGlass
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jugador…"
              className="w-full bg-white/5 border border-[var(--border)] rounded-full pl-8 pr-8 py-1.5 text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--border2)] transition-colors duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
        {/* tricolor separator — inside sticky so siempre es visible */}
        <div className="flex h-px">
          <div className="flex-[3] bg-[var(--yellow)]/30" />
          <div className="flex-[2] bg-[var(--blue)]/40" />
          <div className="flex-[1.5] bg-[var(--red)]/35" />
        </div>
      </div>

      {/* ── Player grid ────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 pt-6">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <span className="inline-flex items-center gap-2 bg-[rgba(252,209,22,0.08)] border border-[var(--border2)] rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--yellow)]">
            Prelista oficial{players.length > 0 ? ` · ${players.length} jugadores` : ""}
          </span>
          <h1 className="font-display text-4xl md:text-5xl mt-2 tracking-wide">
            ELIGE TUS <span className="text-[var(--yellow)]">23</span>
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            Haz clic en cada jugador para seleccionarlo o deseleccionarlo.
          </p>
        </motion.div>

        {players.length === 0 ? (
          /* ── Skeleton mientras carga la API ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-[var(--border)] p-[5px]">
                <div className="bg-[var(--card2)] rounded-[calc(1.5rem-3px)] overflow-hidden">
                  <div className="aspect-square bg-white/5 animate-pulse" />
                  <div className="px-3 pt-2.5 pb-3 space-y-2">
                    <div className="h-3.5 bg-white/5 rounded-full animate-pulse" />
                    <div className="h-3 bg-white/5 rounded-full animate-pulse w-3/4" />
                    <div className="h-2.5 bg-white/4 rounded-full animate-pulse w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                >
                  <PlayerCard
                    player={p}
                    selected={selectedPlayers.includes(p.id)}
                    disabled={count >= SQUAD_SIZE && !selectedPlayers.includes(p.id)}
                    onToggle={handleToggle}
                    onDetail={setDetailId}
                  />
                </motion.div>
              ))}
              {filtered.length === 0 && players.length > 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full py-16 text-center"
                >
                  <p className="text-[var(--muted)] text-sm">
                    No se encontró ningún jugador con ese nombre.
                  </p>
                  <button
                    onClick={() => setSearch("")}
                    className="mt-3 text-xs text-[var(--yellow)] hover:underline"
                  >
                    Limpiar búsqueda
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Sticky bottom save bar ──────────────────────── */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(5,8,15,0.95)] backdrop-blur-xl border-t border-[var(--border)] px-4 py-3"
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
              <p className="text-sm text-[var(--muted)]">
                <strong className="text-[var(--yellow)]">{count}</strong> de {SQUAD_SIZE} seleccionados
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

      <PlayerDetailModal
        player={detailId !== null ? players.find((p) => p.id === detailId) ?? null : null}
        selected={detailId !== null ? selectedPlayers.includes(detailId) : false}
        onClose={() => setDetailId(null)}
        onToggle={handleToggle}
      />

      <GoalOverlay show={showGoal} text="¡23 ELEGIDOS!" onDone={() => setShowGoal(false)} />
    </div>
  );
}
