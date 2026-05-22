"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { Player } from "@/types";
import PlayerAvatar from "@/components/ui/PlayerAvatar";
import { cn } from "@/lib/utils";

const POSITION_FULL: Record<string, string> = {
  GK:  "Portero",
  DEF: "Defensa",
  MID: "Mediocampista",
  FWD: "Delantero",
};

interface Props {
  player:   Player | null;
  selected: boolean;
  onClose:  () => void;
  onToggle: (id: number) => void;
}

export default function PlayerDetailModal({ player, selected, onClose, onToggle }: Props) {
  return (
    <AnimatePresence>
      {player && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)] border-t border-[var(--border)] rounded-t-[2rem] max-h-[80dvh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-[var(--border)] rounded-full" />
            </div>

            <div className="px-6 pb-8">
              <div className="flex items-start gap-4 my-5">
                <PlayerAvatar name={player.name} group={player.group} size="lg" />
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-2xl text-white leading-tight">{player.name}</h2>
                  <p className="text-[var(--muted)] text-sm mt-0.5">{POSITION_FULL[player.group] ?? player.position}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-[var(--muted)] hover:text-white transition-colors shrink-0"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>

              <dl className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: "Edad",      value: `${player.age} años` },
                  { label: "Posición",  value: player.group },
                  { label: "Club",      value: player.club  || "—" },
                  { label: "País",      value: player.country || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[var(--card2)] rounded-2xl p-3.5">
                    <dt className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted)] font-semibold">{label}</dt>
                    <dd className="text-white font-semibold mt-1 text-sm">{value}</dd>
                  </div>
                ))}
              </dl>

              <button
                onClick={() => { onToggle(player.id); onClose(); }}
                className={cn(
                  "w-full font-bold py-3.5 rounded-full text-sm transition-all duration-300",
                  selected
                    ? "bg-white/10 text-[var(--muted)] border border-[var(--border)] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                    : "bg-[var(--yellow)] text-black hover:shadow-[0_0_32px_rgba(252,209,22,0.35)]"
                )}
              >
                {selected ? "Quitar de la selección" : "Agregar a mi selección"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
