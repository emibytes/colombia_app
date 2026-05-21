"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { Player, FieldPosition } from "@/types";
import { getInitials } from "@/lib/utils";

interface Props {
  pos:         FieldPosition;
  player?:     Player;
  active:      boolean; // a bench player is active and ready to be placed
  onSpotClick: (slot: string) => void;
  onRemove:    (slot: string) => void;
}

export default function FieldSpot({ pos, player, active, onSpotClick, onRemove }: Props) {
  const filled = !!player;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      <motion.button
        onClick={() => onSpotClick(pos.slot)}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 340, damping: 22 }}
        className="relative flex flex-col items-center focus:outline-none group"
        aria-label={pos.label}
      >
        {/* Token circle */}
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            border-2 transition-all duration-300
            ${filled
              ? `avatar-${player!.group} border-[var(--yellow)] shadow-[0_0_16px_rgba(252,209,22,0.4)]`
              : active
                ? "border-dashed border-[var(--yellow)] bg-[rgba(252,209,22,0.1)] animate-[pulse_1.5s_ease-in-out_infinite]"
                : "border-dashed border-white/25 bg-black/40 hover:border-[var(--yellow)] hover:bg-[rgba(252,209,22,0.08)]"
            }
          `}
        >
          <AnimatePresence mode="wait">
            {filled ? (
              <motion.span
                key="initials"
                className="font-display text-sm text-white/90 font-black"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                {getInitials(player!.name)}
              </motion.span>
            ) : (
              <motion.span
                key="plus"
                className="text-white/25 text-xl font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                +
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Name label */}
        <div className="mt-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm max-w-[5.5rem]">
          <p className="text-[9px] font-bold text-white text-center leading-tight truncate">
            {filled
              ? player!.name.split(" ").slice(-1)[0]
              : pos.label}
          </p>
        </div>

        {/* Remove button */}
        {filled && (
          <motion.button
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--red)] text-white flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => { e.stopPropagation(); onRemove(pos.slot); }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.8 }}
          >
            <X size={8} weight="bold" />
          </motion.button>
        )}
      </motion.button>
    </div>
  );
}
