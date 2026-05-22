"use client";
import { useId } from "react";

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export default function Logo({ size = 40, withWordmark = false, className = "" }: LogoProps) {
  const id = useId().replace(/:/g, "");
  const clipId = `shield-${id}`;
  const h = size * 1.2;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={h}
        viewBox="0 0 100 120"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Mi Selección Colombia"
        role="img"
      >
        <defs>
          <clipPath id={clipId}>
            {/* Inverted-pentagon badge with rounded top corners */}
            <path d="M 12,0 L 88,0 Q 100,0 100,12 L 100,80 L 50,120 L 0,80 L 0,12 Q 0,0 12,0 Z" />
          </clipPath>
        </defs>

        {/* ── Tricolor bands (flag ratio 2:1:1) ─────────────────── */}
        <rect x="0" y="0"  width="100" height="60" fill="#FCD116" clipPath={`url(#${clipId})`} />
        <rect x="0" y="60" width="100" height="30" fill="#003087" clipPath={`url(#${clipId})`} />
        <rect x="0" y="90" width="100" height="30" fill="#CE1126" clipPath={`url(#${clipId})`} />

        {/* ── Shield border ──────────────────────────────────────── */}
        <path
          d="M 12,0 L 88,0 Q 100,0 100,12 L 100,80 L 50,120 L 0,80 L 0,12 Q 0,0 12,0 Z"
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.5"
        />

        {/* ── Hexagon: football panel, centered in yellow band ───── */}
        <polygon
          points="50,15 59.5,20.5 59.5,31.5 50,37 40.5,31.5 40.5,20.5"
          fill="none"
          stroke="rgba(0,0,0,0.22)"
          strokeWidth="2.5"
        />

        {/* ── Selection checkmark spanning all three bands ────────── */}
        {/* Reads as: tactical pick / squad selector */}
        <polyline
          points="18,82 36,97 82,56"
          fill="none"
          stroke="white"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
      </svg>

      {withWordmark && (
        <div className="flex flex-col leading-none select-none">
          <span
            style={{ letterSpacing: "0.22em" }}
            className="text-[9px] font-bold text-white/50 uppercase"
          >
            Mi Selección
          </span>
          <span
            style={{ letterSpacing: "0.12em" }}
            className="text-lg font-display text-[#FCD116] uppercase leading-tight"
          >
            Colombia
          </span>
        </div>
      )}
    </div>
  );
}
