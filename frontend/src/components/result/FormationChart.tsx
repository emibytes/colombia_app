"use client";
import { motion } from "framer-motion";
import { StatsResponse } from "@/types";

const EASE_OUT = [0.32, 0.72, 0, 1] as [number, number, number, number];

interface Props {
  items: StatsResponse["formation_distribution"];
  totalSelections: number;
}

export default function FormationChart({ items, totalSelections }: Props) {
  const maxCount = items[0]?.count ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.6, ease: EASE_OUT }}
      className="max-w-screen-xl mx-auto px-4 mb-10"
    >
      <div className="bg-[rgba(252,209,22,0.04)] border border-[var(--border)] rounded-[2rem] p-1.5">
        <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl text-[var(--yellow)] tracking-wide">
              FORMACIONES POPULARES
            </h2>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest">
              {totalSelections.toLocaleString()} selecciones
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {items.map((item, i) => {
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.formation} className="flex items-center gap-3">
                  <span className="font-display text-sm text-[var(--yellow)] w-16 shrink-0 tabular-nums">
                    {item.formation}
                  </span>
                  <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--yellow)] to-[var(--blue)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4 + i * 0.07, duration: 0.8, ease: EASE_OUT }}
                    />
                  </div>
                  <span className="text-[11px] text-[var(--muted)] w-10 text-right shrink-0 tabular-nums">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
