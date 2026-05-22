"use client";
import { motion } from "framer-motion";
import { Player, StatsResponse } from "@/types";

const EASE_OUT = [0.32, 0.72, 0, 1] as [number, number, number, number];

interface Props {
  items: StatsResponse["top_squad"];
  totalSelections: number;
  playersMap: Record<number, Player>;
}

export default function TopPlayersChart({ items, totalSelections, playersMap }: Props) {
  const maxVotes = items[0]?.votes ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: EASE_OUT }}
      className="max-w-screen-xl mx-auto px-4 mb-10"
    >
      <div className="bg-[rgba(252,209,22,0.04)] border border-[var(--border)] rounded-[2rem] p-1.5">
        <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-[var(--yellow)] tracking-wide">
              LOS MÁS ELEGIDOS
            </h2>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest">
              {totalSelections.toLocaleString()} selecciones
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {items.map((item, i) => {
              const pct = Math.round((item.votes / maxVotes) * 100);
              const displayName = playersMap[item.id]?.name ?? item.name;
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
                        transition={{ delay: 0.4 + i * 0.05, duration: 0.8, ease: EASE_OUT }}
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
  );
}
