"use client";
import { useEffect, useState } from "react";

const TARGET = new Date("2026-06-11T20:00:00Z"); // Partido inaugural en UTC

function getTimeLeft() {
  const diff = Math.max(0, TARGET.getTime() - Date.now());
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1_000),
  };
}

type TimeLeft = ReturnType<typeof getTimeLeft>;

export default function CountdownWidget() {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1_000);
    return () => clearInterval(id);
  }, []);

  // Render placeholder with same dimensions to avoid layout shift
  if (!time) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-3">
        {["Días", "Horas", "Minutos", "Seg"].map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 sm:gap-3">
            {i > 0 && <span className="text-[var(--muted)] text-sm font-bold leading-none mb-2">:</span>}
            <div className="text-center">
              <p className="font-display text-2xl sm:text-3xl leading-none text-[var(--yellow)] tabular-nums">--</p>
              <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-[var(--muted)] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const units = [
    { value: time.days,    label: "Días"    },
    { value: time.hours,   label: "Horas"   },
    { value: time.minutes, label: "Minutos" },
    { value: time.seconds, label: "Seg"     },
  ];

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {units.map(({ value, label }, i) => (
        <div key={label} className="flex items-center gap-1.5 sm:gap-3">
          {i > 0 && (
            <span className="text-[var(--muted)] text-sm font-bold leading-none mb-2">:</span>
          )}
          <div className="text-center">
            <p className="font-display text-2xl sm:text-3xl leading-none text-[var(--yellow)] tabular-nums">
              {String(value).padStart(2, "0")}
            </p>
            <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-[var(--muted)] mt-0.5">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
