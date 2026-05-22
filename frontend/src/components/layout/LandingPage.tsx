"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0  },
};

const stagger = {
  show: { transition: { staggerChildren: 0.12 } },
};

export default function LandingPage() {
  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Background radial orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[20%] w-[70vmax] h-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(252,209,22,0.07)_0%,transparent_70%)]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60vmax] h-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(0,48,135,0.1)_0%,transparent_70%)]" />
      </div>

      <motion.section
        className="relative z-10 flex flex-col items-center text-center max-w-4xl pt-24 pb-20"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Eyebrow tag */}
        <motion.div variants={fadeUp}>
          <span className="inline-flex items-center gap-2 bg-[rgba(252,209,22,0.1)] border border-[var(--border2)] rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--yellow)]">
            🏆 Mundial 2026 · Néstor Lorenzo
          </span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          variants={fadeUp}
          className="font-display text-[clamp(2.6rem,12vw,11rem)] leading-[0.88] mt-6 tracking-wide text-center"
        >
          <span className="text-[var(--yellow)]">MI</span>{" "}
          <span className="text-white">SELECCIÓN</span>
          <br />
          <span className="text-[var(--red)]">COLOMBIA</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          variants={fadeUp}
          className="mt-5 text-[var(--muted)] text-base md:text-lg leading-relaxed max-w-md"
        >
          Elige tus <strong className="text-white">23 jugadores</strong> de la prelista
          oficial y arma tu <strong className="text-white">11 ideal</strong>.
          ¡Demuestra que sabes de fútbol!
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4 justify-center">
          {/* Primary CTA */}
          <Link href="/seleccion">
            <button className="group relative flex items-center gap-3 bg-[var(--yellow)] text-black font-bold text-base px-7 py-3.5 rounded-full transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[0_0_48px_rgba(252,209,22,0.4)] active:scale-[0.97]">
              Armar mi selección
              <span className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:scale-110">
                <ArrowRight size={16} weight="bold" />
              </span>
            </button>
          </Link>

          {/* Secondary CTA */}
          <Link href="/resultado">
            <button className="flex items-center gap-2 border border-[var(--border2)] text-white/70 font-semibold text-base px-7 py-3.5 rounded-full transition-all duration-300 hover:border-[var(--yellow)] hover:text-[var(--yellow)] hover:-translate-y-0.5">
              Ver estadísticas
            </button>
          </Link>
        </motion.div>

        {/* Colombian flag strip */}
        <motion.div
          variants={fadeUp}
          className="mt-16 flex h-1.5 w-56 rounded-full overflow-hidden"
        >
          <div className="flex-[2] bg-[var(--yellow)]" />
          <div className="flex-1 bg-[var(--blue)]" />
          <div className="flex-1 bg-[var(--red)]" />
        </motion.div>

        {/* Stats bar */}
        <motion.div
          variants={fadeUp}
          className="mt-8 flex items-center gap-8 text-center"
        >
          {[
            { value: "36",   label: "Jugadores prelista" },
            { value: "23",   label: "Cupos disponibles"  },
            { value: "5",    label: "Formaciones"         },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl text-[var(--yellow)]">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* Floating player cards preview (decorative) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 flex justify-center gap-4 overflow-hidden opacity-20 translate-y-12">
        {["GK","DEF","MID","FWD"].map((g, i) => (
          <motion.div
            key={g}
            className={`avatar-${g} w-24 h-24 rounded-2xl`}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.7, ease: [0.32,0.72,0,1] }}
          />
        ))}
      </div>
    </main>
  );
}
