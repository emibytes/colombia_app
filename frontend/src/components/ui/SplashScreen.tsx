"use client";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const BADGE_W = 144;
const BADGE_H = BADGE_W * 1.2; // 172.8

// Easing curves
const EASE_OUT  = [0.32, 0.72, 0, 1]  as const;
const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;

export default function SplashScreen() {
  const uid    = useId().replace(/:/g, "");
  const clipId = `sp-shield-${uid}`;

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("col_splash_v1")) return;
    sessionStorage.setItem("col_splash_v1", "1");

    // Lock scroll while splash is visible
    document.body.style.overflow = "hidden";
    setShow(true);

    const t = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 3200);

    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07090E] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          {/* ── Ambient yellow glow ───────────────────────────────── */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1.4 }}
            aria-hidden
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 560,
                height: 560,
                background:
                  "radial-gradient(circle, rgba(252,209,22,0.09) 0%, transparent 65%)",
              }}
            />
          </motion.div>

          {/* ── Checkmark flash (momentary pulse on draw) ─────────── */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.18, 0] }}
            transition={{ delay: 1.38, duration: 0.55, ease: "easeOut" }}
            aria-hidden
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 320,
                height: 320,
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)",
              }}
            />
          </motion.div>

          {/* ── Badge ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.72, ease: EASE_SPRING }}
            style={{ filter: "drop-shadow(0 12px 40px rgba(252,209,22,0.18))" }}
          >
            <svg
              width={BADGE_W}
              height={BADGE_H}
              viewBox="0 0 100 120"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Mi Selección Colombia"
            >
              <defs>
                <clipPath id={clipId}>
                  <path d="M 12,0 L 88,0 Q 100,0 100,12 L 100,80 L 50,120 L 0,80 L 0,12 Q 0,0 12,0 Z" />
                </clipPath>
              </defs>

              {/* Yellow band — fills from top */}
              <motion.rect
                x="0" y="0" width="100" height="60"
                fill="#FCD116"
                clipPath={`url(#${clipId})`}
                style={{ transformBox: "fill-box", transformOrigin: "top" }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.22, duration: 0.52, ease: EASE_OUT }}
              />

              {/* Blue band */}
              <motion.rect
                x="0" y="60" width="100" height="30"
                fill="#003087"
                clipPath={`url(#${clipId})`}
                style={{ transformBox: "fill-box", transformOrigin: "top" }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.42, duration: 0.42, ease: EASE_OUT }}
              />

              {/* Red band */}
              <motion.rect
                x="0" y="90" width="100" height="30"
                fill="#CE1126"
                clipPath={`url(#${clipId})`}
                style={{ transformBox: "fill-box", transformOrigin: "top" }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.58, duration: 0.42, ease: EASE_OUT }}
              />

              {/* Shield border draws itself */}
              <motion.path
                d="M 12,0 L 88,0 Q 100,0 100,12 L 100,80 L 50,120 L 0,80 L 0,12 Q 0,0 12,0 Z"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.52, duration: 0.9, ease: "easeInOut" }}
              />

              {/* Hexagon (football panel) draws itself */}
              <motion.polygon
                points="50,15 59.5,20.5 59.5,31.5 50,37 40.5,31.5 40.5,20.5"
                fill="none"
                stroke="rgba(0,0,0,0.22)"
                strokeWidth="2.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.82, duration: 0.48, ease: "easeInOut" }}
              />

              {/* ✓ Checkmark — the hero moment */}
              <motion.polyline
                points="18,82 36,97 82,56"
                fill="none"
                stroke="white"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.95 }}
                transition={{ delay: 1.08, duration: 0.44, ease: EASE_SPRING }}
              />
            </svg>
          </motion.div>

          {/* ── Wordmark ──────────────────────────────────────────── */}
          <motion.div
            className="mt-7 flex flex-col items-center select-none"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.38, duration: 0.52, ease: EASE_OUT }}
          >
            <span
              className="text-[10px] font-bold uppercase text-white/35"
              style={{ letterSpacing: "0.32em" }}
            >
              Mi Selección
            </span>
            <motion.span
              className="font-display uppercase text-[#FCD116] leading-none mt-1"
              style={{ fontSize: 48, letterSpacing: "0.14em" }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.52, duration: 0.48, ease: EASE_SPRING }}
            >
              Colombia
            </motion.span>
          </motion.div>

          {/* ── Tagline ───────────────────────────────────────────── */}
          <motion.p
            className="mt-3 text-[11px] uppercase text-white/22"
            style={{ letterSpacing: "0.28em" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.72, duration: 0.6 }}
          >
            Mundial 2026 · Néstor Lorenzo
          </motion.p>

          {/* ── Tricolor strip ────────────────────────────────────── */}
          <motion.div
            className="mt-9 h-[3px] rounded-full overflow-hidden flex"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 112, opacity: 1 }}
            transition={{ delay: 1.88, duration: 0.55, ease: EASE_OUT }}
          >
            <div style={{ flex: 2, background: "#FCD116" }} />
            <div style={{ flex: 1, background: "#003087" }} />
            <div style={{ flex: 1, background: "#CE1126" }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
