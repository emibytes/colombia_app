"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FORMATIONS } from "@/lib/formations";
import { useSelectionStore } from "@/stores/selectionStore";
import { useSound } from "@/hooks/useSound";
import { getSessionId } from "@/lib/utils";
import { saveSelection, getStats } from "@/lib/api";
import { StatsResponse } from "@/types";
import GoalOverlay from "@/components/ui/GoalOverlay";
import ShareImageButton from "@/components/ui/ShareImageButton";
import SquadCard from "@/components/result/SquadCard";
import LineupPreviewCard from "@/components/result/LineupPreviewCard";
import TopPlayersChart from "@/components/result/TopPlayersChart";
import FormationChart from "@/components/result/FormationChart";
import CircularGaugeCard from "@/components/result/CircularGaugeCard";
import ResultActions from "@/components/result/ResultActions";

const EASE_OUT = [0.32, 0.72, 0, 1] as [number, number, number, number];
const SQUAD_SIZE = 23;

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function ResultClient() {
  const { selectedPlayers, placedMap, formation, playersMap, resetAll } = useSelectionStore();
  const sound       = useSound();
  const captureRef  = useRef<HTMLDivElement>(null);
  const [status,     setStatus]     = useState<SaveStatus>("idle");
  const [stats,      setStats]      = useState<StatsResponse | null>(null);
  const [showGoal,   setShowGoal]   = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  const formationDef   = FORMATIONS[formation];
  const startingEleven = formationDef.positions
    .map((p) => placedMap[p.slot])
    .filter((id): id is number => typeof id === "number");
  const hasLineup = startingEleven.length === 11;

  const matchPct = (() => {
    if (!stats || stats.top_squad.length < SQUAD_SIZE) return null;
    const topIds = new Set(stats.top_squad.slice(0, SQUAD_SIZE).map((s) => s.id));
    const matchCount = selectedPlayers.filter((id) => topIds.has(id)).length;
    return Math.round((matchCount / SQUAD_SIZE) * 100);
  })();

  const dtStats = (() => {
    if (!stats?.dt_squad || stats.dt_squad.length === 0) return null;
    const dtSet   = new Set(stats.dt_squad);
    const matched = selectedPlayers.filter((id) => dtSet.has(id)).length;
    const total   = stats.dt_squad.length;
    return { pct: Math.round((matched / total) * 100), matched, total };
  })();

  useEffect(() => {
    getStats().then(setStats).catch(() => null);
  }, []);

  const handleSave = useCallback(async () => {
    if (status === "saving" || status === "saved") return;
    if (selectedPlayers.length < 1) return;
    setStatus("saving");
    try {
      const result = await saveSelection({
        session_id:      getSessionId(),
        squad_players:   selectedPlayers,
        starting_eleven: startingEleven,
        formation,
      });
      setStatus("saved");
      if (result.share_token) setShareToken(result.share_token);
      sound.victory();
      setShowGoal(true);
      getStats().then(setStats).catch(() => null);
    } catch {
      setStatus("error");
    }
  }, [status, selectedPlayers, startingEleven, formation, sound]);

  const handleReset = () => { resetAll(); window.location.href = "/seleccion"; };

  if (selectedPlayers.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center text-center px-4 pt-20">
        <p className="text-[var(--muted)] text-lg mb-4">Aún no has hecho tu selección.</p>
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
      {/* Header */}
      <div className="text-center pt-28 pb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          <span className="inline-flex items-center gap-2 bg-[rgba(252,209,22,0.08)] border border-[var(--border2)] rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--yellow)]">
            🇨🇴 Tu selección Colombia 2026
          </span>
          <h1 className="font-display text-[clamp(3rem,10vw,7rem)] leading-tight mt-3">
            MI <span className="text-[var(--yellow)]">SELECCIÓN</span>
          </h1>
        </motion.div>
      </div>

      {/* Share capture canvas */}
      <div className="max-w-screen-xl mx-auto px-4 mb-4">
        <div
          ref={captureRef}
          className="rounded-[2rem] overflow-hidden"
          style={{ background: "#07090E", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Branded header */}
          <div className="relative flex items-center justify-between px-6 py-4 overflow-hidden">
            {/* Tricolor bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
              <div className="flex-1 bg-[var(--yellow)]" />
              <div className="flex-1 bg-[var(--blue)]" />
              <div className="flex-1 bg-[var(--red)]" />
            </div>
            <div>
              <p className="font-display text-[11px] tracking-[0.22em] text-[var(--muted)] uppercase">Mi Selección</p>
              <p className="font-display text-xl leading-tight text-white">COLOMBIA <span className="text-[var(--yellow)]">2026</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-[0.15em] text-[var(--muted)] uppercase">Mundial</p>
              <p className="font-display text-base text-[var(--yellow)]">FIFA WC 2026</p>
            </div>
          </div>

          {/* Cards grid — always 2 cols inside the capture */}
          <div className="grid grid-cols-2 gap-3 px-4 pb-4">
            <SquadCard playerIds={selectedPlayers} playersMap={playersMap} />
            <LineupPreviewCard
              formation={formation}
              placedMap={placedMap}
              playersMap={playersMap}
              hasLineup={hasLineup}
            />
          </div>

          {/* Branded footer */}
          <div className="relative flex items-center justify-between px-6 py-3 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] flex">
              <div className="flex-1 bg-[var(--yellow)]" />
              <div className="flex-1 bg-[var(--blue)]" />
              <div className="flex-1 bg-[var(--red)]" />
            </div>
            <p className="text-[10px] text-[var(--muted)] tracking-wide">seleccion.emibytes.com</p>
            <p className="text-[10px] text-[var(--yellow)] font-semibold tracking-wide">#MiSeleccionColombia</p>
          </div>
        </div>
      </div>

      {/* Share button — prominent, right below capture */}
      <div className="max-w-screen-xl mx-auto px-4 mb-10 flex justify-center">
        <ShareImageButton captureRef={captureRef} />
      </div>

      {/* Community stats */}
      {stats && stats.top_squad.length > 0 && (
        <TopPlayersChart
          items={stats.top_squad}
          totalSelections={stats.total_selections}
          playersMap={playersMap}
        />
      )}

      {/* Formation popularity */}
      {stats && stats.formation_distribution.length > 0 && (
        <FormationChart
          items={stats.formation_distribution}
          totalSelections={stats.total_selections}
        />
      )}

      {/* Community match % gauge */}
      {matchPct !== null && (
        <CircularGaugeCard
          pct={matchPct}
          gradientId="matchGrad"
          gradientFrom="var(--yellow)"
          gradientTo="var(--red)"
          title="COINCIDENCIA CON LA COMUNIDAD"
          description={
            matchPct >= 80 ? "¡Eres un experto! Tu selección coincide casi perfectamente con la de la comunidad."
            : matchPct >= 60 ? "Buena selección. Tienes buen ojo para el talento colombiano."
            : matchPct >= 40 ? "Selección interesante. Tienes apuestas diferentes a la comunidad."
            : "¡Eres un selector atrevido! Tu selección es muy original."
          }
          footnote={`${selectedPlayers.filter((id) => stats!.top_squad.slice(0, SQUAD_SIZE).some((s) => s.id === id)).length} de ${SQUAD_SIZE} jugadores en común`}
          animDelay={0.4}
        />
      )}

      {/* DT official comparison gauge */}
      {dtStats && (
        <CircularGaugeCard
          pct={dtStats.pct}
          gradientId="dtGrad"
          gradientFrom="var(--blue)"
          gradientTo="var(--yellow)"
          outerBgClass="bg-[rgba(0,80,200,0.06)]"
          title="VS. EL DT OFICIAL"
          description={
            dtStats.pct >= 80 ? "¡Pensás igual que el DT! Tu selección casi coincide con la oficial."
            : dtStats.pct >= 60 ? "Muy buen ojo. La mayoría de tus elegidos están en la lista del DT."
            : dtStats.pct >= 40 ? "Tienes tus propias apuestas. Algunos coinciden con el DT, otros no."
            : "Tu selección es muy diferente a la del DT. ¡Eres un selector audaz!"
          }
          footnote={`${dtStats.matched} de ${dtStats.total} jugadores coinciden con la lista oficial`}
          animDelay={0.45}
        />
      )}

      <ResultActions
        status={status}
        onSave={handleSave}
        onReset={handleReset}
        shareToken={shareToken}
      />

      <GoalOverlay show={showGoal} text="¡GUARDADO!" onDone={() => setShowGoal(false)} />
    </div>
  );
}
