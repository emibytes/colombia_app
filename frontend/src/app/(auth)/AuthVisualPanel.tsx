"use client";
import { motion } from "framer-motion";

const BADGES = [
  { key: "GK",  label: "Portero",    cls: "avatar-GK",  delay: 0    },
  { key: "DEF", label: "Defensa",    cls: "avatar-DEF", delay: 0.5  },
  { key: "MID", label: "Mediocampo", cls: "avatar-MID", delay: 1.0  },
  { key: "FWD", label: "Delantero",  cls: "avatar-FWD", delay: 1.5  },
];

const container = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } },
};
const item = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.32, 0.72, 0, 1] } },
};

export default function AuthVisualPanel() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden min-h-dvh p-10 lg:p-14">
      {/* Ambient orbs */}
      <div className="auth-orb auth-orb-yellow" />
      <div className="auth-orb auth-orb-blue" />
      <div className="auth-orb auth-orb-red" />

      {/* Football pitch texture */}
      <div className="absolute inset-0 flex items-end justify-end pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 680 1050"
          className="w-[520px] translate-x-[32%] translate-y-[18%] rotate-[8deg] opacity-[0.035]"
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        >
          <rect x="10" y="10" width="660" height="1030" />
          <line x1="10" y1="525" x2="670" y2="525" />
          <circle cx="340" cy="525" r="91.5" />
          <circle cx="340" cy="525" r="6" fill="white" stroke="none" />
          <rect x="175" y="10" width="330" height="165" />
          <rect x="255" y="10" width="170" height="55" />
          <path d="M 271 175 A 91.5 91.5 0 0 1 409 175" />
          <circle cx="340" cy="120" r="6" fill="white" stroke="none" />
          <rect x="175" y="875" width="330" height="165" />
          <rect x="255" y="985" width="170" height="55" />
          <path d="M 271 875 A 91.5 91.5 0 0 0 409 875" />
          <circle cx="340" cy="930" r="6" fill="white" stroke="none" />
          <path d="M 10 50 A 40 40 0 0 1 50 10" />
          <path d="M 630 10 A 40 40 0 0 1 670 50" />
          <path d="M 10 1000 A 40 40 0 0 0 50 1040" />
          <path d="M 630 1040 A 40 40 0 0 0 670 1000" />
        </svg>
      </div>

      {/* Right edge separator */}
      <div className="absolute right-0 top-[8%] bottom-[8%] w-px bg-gradient-to-b from-transparent via-[rgba(252,209,22,0.14)] to-transparent" />

      {/* Brand mark */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <span className="font-[family-name:var(--font-bebas)] text-xl tracking-[0.35em] text-[#FCD116]">
          COL2026
        </span>
      </motion.div>

      {/* Main content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col justify-center gap-6 py-10"
      >
        <motion.div variants={item}>
          <span className="inline-flex items-center rounded-full bg-[rgba(252,209,22,0.08)] border border-[rgba(252,209,22,0.18)] px-3 py-1 text-[10px] uppercase tracking-[0.22em] font-semibold text-[#FCD116]">
            Mundial 2026
          </span>
        </motion.div>

        <motion.h2
          variants={item}
          className="font-[family-name:var(--font-bebas)] text-[80px] lg:text-[96px] leading-[0.9] text-[#F0EDE8] tracking-wide"
        >
          TU<br />
          <span className="text-[#FCD116]">SELECCIÓN.</span>
        </motion.h2>

        <motion.p
          variants={item}
          className="text-[#6B7280] text-sm leading-relaxed max-w-[30ch]"
        >
          Elige tus 23. Define tu 11 ideal. Vive el sueño colombiano en el Mundial.
        </motion.p>

        {/* Position badges */}
        <motion.div variants={item} className="flex flex-wrap gap-2.5 mt-1">
          {BADGES.map((b) => (
            <motion.div
              key={b.key}
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 2.6 + b.delay * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: b.delay,
              }}
              className={`${b.cls} rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]`}
            >
              <span className="text-[11px] font-bold text-white tracking-widest">{b.key}</span>
              <span className="w-px h-3 bg-white/20" />
              <span className="text-[10px] text-white/75 font-medium">{b.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Tricolor stripe */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="flex gap-1 origin-left"
      >
        <div className="h-[3px] flex-[3] rounded-full bg-[#FCD116]" />
        <div className="h-[3px] flex-[2] rounded-full bg-[#003087]" />
        <div className="h-[3px] flex-[1.5] rounded-full bg-[#CE1126]" />
      </motion.div>
    </div>
  );
}
