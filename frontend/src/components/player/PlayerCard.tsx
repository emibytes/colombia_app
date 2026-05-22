"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";
import { Player } from "@/types";
import { cn } from "@/lib/utils";
import PlayerAvatar from "@/components/ui/PlayerAvatar";

interface Props {
  player:   Player;
  selected: boolean;
  disabled: boolean;
  onToggle: (id: number) => void;
}

const BADGE_LABELS: Record<string, string> = {
  GK:  "Portero",
  DEF: "Defensa",
  MID: "Medioc.",
  FWD: "Delantero",
};

export default function PlayerCard({ player, selected, disabled, onToggle }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled && !selected) return;

    // Ripple effect
    const card = cardRef.current;
    if (card) {
      const rect = card.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const dot  = document.createElement("div");
      dot.className = "ripple-dot";
      dot.style.cssText = `
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top  - size / 2}px;
      `;
      card.appendChild(dot);
      setTimeout(() => dot.remove(), 700);
    }

    onToggle(player.id);
  };

  return (
    /* Outer shell — Double-Bezel architecture */
    <motion.div
      ref={cardRef}
      onClick={handleClick}
      whileHover={!disabled || selected ? { y: -4, scale: 1.01 } : {}}
      whileTap={!disabled || selected   ? { scale: 0.97 } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={cn(
        "relative cursor-pointer select-none overflow-hidden rounded-3xl p-[5px]",
        "border transition-[border-color,box-shadow] duration-350",
        selected
          ? "border-[var(--yellow)] shadow-[0_0_24px_rgba(252,209,22,0.22),inset_0_1px_1px_rgba(252,209,22,0.15)]"
          : "border-[var(--border)] hover:border-[var(--border2)]",
        disabled && !selected ? "opacity-50 saturate-50 pointer-events-none" : ""
      )}
    >
      {/* Radial glow on hover/selected */}
      <div
        className={cn(
          "absolute inset-0 z-0 pointer-events-none transition-opacity duration-350",
          "bg-[radial-gradient(circle_at_50%_-20%,rgba(252,209,22,0.09),transparent_70%)]",
          selected ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Inner core */}
      <div className="relative z-10 bg-[var(--card2)] rounded-[calc(1.5rem-3px)] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">

        {/* Avatar */}
        <PlayerAvatar name={player.name} group={player.group} size="lg" />

        {/* Info */}
        <div className="px-3 pt-2.5 pb-3">
          <p className="font-heading font-bold text-[0.95rem] leading-tight text-white line-clamp-2">
            {player.name}
          </p>

          <div className="flex items-center justify-between mt-1.5 gap-1">
            <span className={cn("badge-" + player.group, "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full")}>
              {BADGE_LABELS[player.group]}
            </span>
            <span className="text-[11px] text-[var(--muted)]">{player.age} años</span>
          </div>

          <p className="text-[10px] text-[var(--muted)] mt-1 truncate">
            {player.club} · {player.country}
          </p>
        </div>
      </div>

      {/* Check badge */}
      <motion.div
        className="absolute top-2.5 right-2.5 z-20 text-[var(--yellow)] drop-shadow-[0_0_8px_rgba(252,209,22,0.6)]"
        initial={{ scale: 0, rotate: -45 }}
        animate={selected ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -45 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
      >
        <CheckCircle size={22} weight="fill" />
      </motion.div>
    </motion.div>
  );
}
