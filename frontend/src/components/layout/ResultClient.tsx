"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowCounterClockwise, FloppyDisk } from "@phosphor-icons/react";
import { PLAYERS_MAP } from "@/lib/players";
import { FORMATIONS } from "@/lib/formations";
import { useSelectionStore } from "@/stores/selectionStore";
import { useSound } from "@/hooks/useSound";
import { getSessionId, cn } from "@/lib/utils";
import { saveSelection, getStats } from "@/lib/api";
import { StatsResponse } from "@/types";
import PlayerAvatar from "@/components/ui/PlayerAvatar";
import GoalOverlay from "@/components/ui/GoalOverlay";
import FieldSVG from "@/components/field/FieldSVG";
import FieldSpot from "@/components/field/FieldSpot";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function ResultClient() {
  const { selectedPlayers, placedMap, formation, resetAll } = useSelectionStore();
  const sound      = useSound();
  const [status,   setStatus]   = useState<SaveStatus>("idle");
  const [stats,    setStats]    = useState<StatsResponse | null>(null);
  const [showGoal, setShowGoal] = useState(false);

  const formationDef  = FORMATIONS[formation];
  const startingEleven = Object.values(placedMap);
  const hasLineup     = startingEleven.length === 11;

  useEffect(() => {
    getStats().then(setStats).catch(() => null);
  }, []);

  const handleSave = useCallback(async () => {
    if (status === "saving" || status === "saved") return;
    if (selectedPlayers.length < 1) return;

    setStatus("saving");
    try {
      await saveSelection({
        session_id:      getSessionId(),
        squad_players:   selectedPlayers,
        starting_eleven: startingEleven,
        formation,
      });
      setStatus("saved");
      sound.victory();
      setShowGoal(true);
      getStats().then(setStats).catch(() => null);
    } catch {
      setStatus("error");
    }
  }, [status, selectedPlayers, startingEleven, formation, sound]);

  if (selectedPlayers.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center text-center px-4 pt-20">
        <p className="text-[var(--muted)] text-lg mb-4">
          Aún no has hecho tu selección.
        </p>
        <Link href="/seleccion">
          <button className="bg-[var(--yellow)] text-black font-bold px-6 py-3 rounded-full">
            Comenzar
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-20">
      {/* ── Header ─────────────────────────────────── */}
      <div className="text-center pt-28 pb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <span className="inline-flex items-center gap-2 bg-[rgba(252,209,22,0.08)] border border-[var(--border2)] rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--yellow)]">
            🇨🇴 Tu selección Colombia 2026
          </span>
          <h1 className="font-display text-[clamp(3rem,10vw,7rem)] leading-tight mt-3">
            MI <span className="text-[var(--yellow)]">SELECCIÓN</span>
          </h1>
        </motion.div>
      </div>

      {/* ── Content grid ───────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        {/* Squad of 23 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="bg-[rgba(252,209,22,0.04)] border border-[var(--border)] rounded-[2rem] p-1.5"
        >
          <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <h2 className="font-display text-2xl text-[var(--yellow)] tracking-wide mb-4">
              MIS 23 JUGADORES
            </h2>
            <div className="grid grid-cols-1 gap-1.5">
              {selectedPlayers.map((id, i) => {
                const player = PLAYERS_MAP[id];
                if (!player) return null;
                return (
                  <div key={id} className="flex items-center gap-3 py-1.5 border-b border-[var(--border)] last:border-0">
                    <span className="font-display text-lg text-[var(--muted)] w-6 text-center shrink-0">{i + 1}</span>
                    <PlayerAvatar name={player.name} group={player.group} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{player.name}</p>
                      <p className="text-[10px] text-[var(--muted)]">{player.position} · {player.age} años</p>
                    </div>
                    <span className={cn("badge-" + player.group, "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0")}>
                      {player.group}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Starting 11 field preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="bg-[rgba(252,209,22,0.04)] border border-[var(--border)] rounded-[2rem] p-1.5"
        >
          <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <h2 className="font-display text-2xl text-[var(--yellow)] tracking-wide mb-4">
              MI 11 IDEAL · {formation}
            </h2>
            {hasLineup ? (
              <div className="bg-[rgba(0,48,135,0.06)] border border-[rgba(0,80,200,0.2)] rounded-2xl p-1.5">
                <div
                  className="relative bg-gradient-to-b from-[#0D3B1A] via-[#115827] to-[#0D3B1A] rounded-[calc(1rem-4px)] overflow-hidden"
                  style={{ aspectRatio: "0.68" }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ background: "repeating-linear-gradient(180deg,rgba(255,255,255,0.02) 0px,rgba(255,255,255,0.02) 30px,transparent 30px,transparent 60px)" }}
                  />
                  <FieldSVG />
                  {formationDef.positions.map((pos) => {
                    const playerId = placedMap[pos.slot];
                    return (
                      <FieldSpot
                        key={pos.slot}
                        pos={pos}
                        player={playerId ? PLAYERS_MAP[playerId] : undefined}
                        active={false}
                        onSpotClick={() => {}}
                        onRemove={() => {}}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-[var(--muted)] mb-4">Aún no definiste tu 11 ideal.</p>
                <Link href="/once">
                  <button className="bg-[var(--yellow)] text-black font-bold px-5 py-2.5 rounded-full text-sm">
                    Definir 11 ideal
                  </button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Community stats ─────────────────────────── */}
      {stats && stats.top_squad.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="max-w-screen-xl mx-auto px-4 mb-10"
        >
          <div className="bg-[rgba(252,209,22,0.04)] border border-[var(--border)] rounded-[2rem] p-1.5">
            <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-[var(--yellow)] tracking-wide">
                  LOS MÁS ELEGIDOS
                </h2>
                <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest">
                  {stats.total_selections.toLocaleString()} selecciones
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {stats.top_squad.map((item, i) => {
                  const maxVotes = stats.top_squad[0]?.votes ?? 1;
                  const pct = Math.round((item.votes / maxVotes) * 100);
                  // Names live client-side; enrich from PLAYERS_MAP by id
                  const displayName = PLAYERS_MAP[item.id]?.name ?? item.name;
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="font-display text-lg text-[var(--muted)] w-5 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-semibold truncate">{displayName}</span>
                          <span className="text-[10px] text-[var(--muted)] shrink-0 ml-2">{item.votes.toLocaleString()}</span>
                        </div>
                        <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[var(--yellow)] to-[var(--red)] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.4 + i * 0.05, duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Action buttons ──────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 flex flex-wrap gap-3 justify-center">
        <motion.button
          onClick={handleSave}
          disabled={status === "saving" || status === "saved"}
          className={cn(
            "group flex items-center gap-2.5 font-bold px-8 py-3.5 rounded-full text-sm transition-all duration-300",
            status === "saved"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : status === "error"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-[var(--yellow)] text-black hover:shadow-[0_0_40px_rgba(252,209,22,0.4)] hover:-translate-y-0.5"
          )}
          whileHover={status === "idle" ? { scale: 1.02 } : {}}
          whileTap={status === "idle"   ? { scale: 0.97 } : {}}
        >
          <FloppyDisk size={18} weight="bold" />
          {status === "saving" ? "Guardando…"
           : status === "saved"  ? "¡Guardado con éxito!"
           : status === "error"  ? "Error — reintentar"
           : "Guardar mi selección"}
        </motion.button>

        <button
          onClick={() => { resetAll(); window.location.href = "/seleccion"; }}
          className="flex items-center gap-2 border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--border2)] font-semibold px-6 py-3.5 rounded-full text-sm transition-all duration-300"
        >
          <ArrowCounterClockwise size={16} weight="bold" />
          Empezar de nuevo
        </button>
      </div>

      <GoalOverlay show={showGoal} text="¡GUARDADO!" onDone={() => setShowGoal(false)} />
    </div>
  );
}
