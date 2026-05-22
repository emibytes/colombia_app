"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { FORMATIONS } from "@/lib/formations";
import { FormationName, PlacedPlayersMap, Player } from "@/types";
import FieldSVG from "@/components/field/FieldSVG";
import FieldSpot from "@/components/field/FieldSpot";

const EASE_OUT = [0.32, 0.72, 0, 1] as [number, number, number, number];

interface Props {
  formation: FormationName;
  placedMap: PlacedPlayersMap;
  playersMap: Record<number, Player>;
  hasLineup: boolean;
}

export default function LineupPreviewCard({ formation, placedMap, playersMap, hasLineup }: Props) {
  const formationDef = FORMATIONS[formation];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6, ease: EASE_OUT }}
      className="bg-[rgba(252,209,22,0.04)] border border-[var(--border)] rounded-[2rem] p-1.5"
    >
      <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <h2 className="font-display text-2xl text-[var(--yellow)] tracking-wide mb-4">
          MI 11 IDEAL · {formation}
        </h2>
        {hasLineup ? (
          <div className="bg-[rgba(0,48,135,0.06)] border border-[rgba(0,80,200,0.2)] rounded-2xl p-1.5">
            <div
              className="relative bg-gradient-to-b from-[#0D3B1A] via-[#115827] to-[#0D3B1A] rounded-[calc(1rem-4px)] overflow-hidden"
              style={{ aspectRatio: "0.68" }}
            >
              <div
                className="absolute inset-0"
                style={{ background: "repeating-linear-gradient(180deg,rgba(255,255,255,0.02) 0px,rgba(255,255,255,0.02) 30px,transparent 30px,transparent 60px)" }}
              />
              <FieldSVG />
              {formationDef.positions.map((pos) => {
                const playerId = placedMap[pos.slot];
                return (
                  <FieldSpot
                    key={pos.slot}
                    pos={pos}
                    player={playerId ? playersMap[playerId] : undefined}
                    active={false}
                    onSpotClick={() => {}}
                    onRemove={() => {}}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[var(--muted)] mb-4">Aún no definiste tu 11 ideal.</p>
            <Link href="/once">
              <button className="bg-[var(--yellow)] text-black font-bold px-5 py-2.5 rounded-full text-sm">
                Definir 11 ideal
              </button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
