"use client";
import { motion } from "framer-motion";

const EASE_OUT = [0.32, 0.72, 0, 1] as [number, number, number, number];
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props {
  pct: number;
  gradientId: string;
  gradientFrom: string;
  gradientTo: string;
  outerBgClass?: string;
  title: string;
  description: string;
  footnote: string;
  animDelay?: number;
}

export default function CircularGaugeCard({
  pct,
  gradientId,
  gradientFrom,
  gradientTo,
  outerBgClass = "bg-[rgba(252,209,22,0.04)]",
  title,
  description,
  footnote,
  animDelay = 0.4,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay, duration: 0.6, ease: EASE_OUT }}
      className="max-w-screen-xl mx-auto px-4 mb-10"
    >
      <div className={`${outerBgClass} border border-[var(--border)] rounded-[2rem] p-1.5`}>
        <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-5 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <motion.circle
                cx="50" cy="50" r={RADIUS} fill="none"
                stroke={`url(#${gradientId})`} strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - pct / 100) }}
                transition={{ delay: animDelay + 0.1, duration: 1.2, ease: EASE_OUT }}
              />
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={gradientFrom} />
                  <stop offset="100%" stopColor={gradientTo} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-2xl text-[var(--yellow)]">{pct}%</span>
            </div>
          </div>
          <div>
            <h2 className="font-display text-2xl text-[var(--yellow)] tracking-wide mb-1">{title}</h2>
            <p className="text-[var(--muted)] text-sm leading-relaxed">{description}</p>
            <p className="text-[10px] text-[var(--muted)] mt-2 uppercase tracking-widest">{footnote}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
