"use client";
import { motion } from "framer-motion";
import { Player } from "@/types";
import { cn } from "@/lib/utils";
import PlayerAvatar from "@/components/ui/PlayerAvatar";

const EASE_OUT = [0.32, 0.72, 0, 1] as [number, number, number, number];

interface Props {
  playerIds: number[];
  playersMap: Record<number, Player>;
}

export default function SquadCard({ playerIds, playersMap }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6, ease: EASE_OUT }}
      className="bg-[rgba(252,209,22,0.04)] border border-[var(--border)] rounded-[2rem] p-1.5"
    >
      <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <h2 className="font-display text-2xl text-[var(--yellow)] tracking-wide mb-4">
          MIS 23 JUGADORES
        </h2>
        <div className="grid grid-cols-1 gap-1.5">
          {playerIds.map((id, i) => {
            const player = playersMap[id];
            if (!player) return null;
            return (
              <div key={id} className="flex items-center gap-3 py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="font-display text-lg text-[var(--muted)] w-6 text-center shrink-0">{i + 1}</span>
                <PlayerAvatar name={player.name} group={player.group} photo={player.photo} size="sm" />
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
  );
}
