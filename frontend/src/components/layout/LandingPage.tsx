"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import CountdownWidget from "@/components/ui/CountdownWidget";
import Logo from "@/components/ui/Logo";
import PlayerAvatar from "@/components/ui/PlayerAvatar";
import { cn } from "@/lib/utils";
import { PlayerGroup } from "@/types";

/* ── Animation variants ─────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0  },
};
const stagger = {
  show: { transition: { staggerChildren: 0.10 } },
};

/* ── Mosaic data (decorative, non-interactive) ───────── */
const MOSAIC: Array<{
  initials: string;
  name: string;
  group: PlayerGroup;
  badge: string;
  selected: boolean;
  delay: number;
  duration: number;
  offset: number;
}> = [
  { initials: "CV", name: "Camilo Vargas",    group: "GK",  badge: "Portero",    selected: true,  delay: 0,   duration: 3.2, offset: 0  },
  { initials: "LD", name: "Luis Díaz",        group: "FWD", badge: "Delantero",  selected: true,  delay: 0.4, duration: 3.8, offset: 28 },
  { initials: "RR", name: "Richard Ríos",     group: "MID", badge: "Mediocampo", selected: true,  delay: 0.2, duration: 4.1, offset: 0  },
  { initials: "DS", name: "Dávinson Sánchez", group: "DEF", badge: "Defensa",    selected: false, delay: 0.6, duration: 3.5, offset: 28 },
  { initials: "JD", name: "Jhon Durán",       group: "FWD", badge: "Delantero",  selected: true,  delay: 0.1, duration: 2.9, offset: 0  },
  { initials: "DM", name: "Daniel Muñoz",     group: "DEF", badge: "Defensa",    selected: false, delay: 0.5, duration: 3.6, offset: 28 },
];

const STATS = [
  { value: "55", label: "Jugadores"   },
  { value: "23", label: "Cupos"       },
  { value: "5",  label: "Formaciones" },
];

/* ── Mosaic card (decorative only) ──────────────────── */
function MosaicCard({
  initials, name, group, badge, selected, delay, duration, offset,
}: typeof MOSAIC[0]) {
  return (
    <motion.div
      className={cn(
        "relative rounded-2xl p-[4px] border transition-colors",
        selected
          ? "border-[var(--yellow)] shadow-[0_0_16px_rgba(252,209,22,0.18)]"
          : "border-[var(--border)]"
      )}
      style={{ marginTop: offset }}
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 180, damping: 20 }}
    >
      {/* Float loop */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
      >
        <div className="bg-[var(--card2)] rounded-[calc(1rem-2px)] overflow-hidden">
          <PlayerAvatar name={initials} group={group} size="lg" />
          <div className="px-2.5 pt-2 pb-2.5">
            <p className="text-[0.72rem] font-semibold text-white leading-tight truncate">{name}</p>
            <span className={cn(`badge-${group}`, "mt-1 inline-block text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full")}>
              {badge}
            </span>
          </div>
        </div>
      </motion.div>
      {/* Selected checkmark */}
      {selected && (
        <div className="absolute top-2 right-2 text-[var(--yellow)] drop-shadow-[0_0_6px_rgba(252,209,22,0.7)]">
          <CheckCircle size={18} weight="fill" />
        </div>
      )}
    </motion.div>
  );
}

/* ── Main component ──────────────────────────────────── */
export default function LandingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">

      {/* ── Background orbs ──────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[25%] -left-[15%] w-[65vmax] h-[65vmax] rounded-full
                        bg-[radial-gradient(circle,rgba(252,209,22,0.09)_0%,transparent_70%)]" />
        <div className="absolute -bottom-[25%] -right-[15%] w-[55vmax] h-[55vmax] rounded-full
                        bg-[radial-gradient(circle,rgba(0,48,135,0.11)_0%,transparent_70%)]" />
        <div className="absolute bottom-[10%] -left-[10%] w-[40vmax] h-[40vmax] rounded-full
                        bg-[radial-gradient(circle,rgba(206,17,38,0.05)_0%,transparent_70%)]" />
      </div>

      {/* ── Page grid ────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6 md:px-10 lg:px-12
                      grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_460px]
                      gap-10 lg:gap-6 min-h-dvh items-center pt-24 pb-16">

        {/* ── LEFT: Content ────────────────────────── */}
        <motion.div
          className="flex flex-col"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Logo */}
          <motion.div variants={fadeUp}>
            <Logo size={36} withWordmark />
          </motion.div>

          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="mt-7">
            <span className="inline-flex items-center gap-2 bg-[rgba(252,209,22,0.1)] border
                             border-[var(--border2)] rounded-full px-4 py-1.5 text-[10px]
                             uppercase tracking-[0.2em] font-semibold text-[var(--yellow)]">
              Mundial 2026 · Néstor Lorenzo
            </span>
          </motion.div>

          {/* Title — left-aligned, large */}
          <motion.h1
            variants={fadeUp}
            className="font-display text-[clamp(4rem,7.5vw,9.5rem)] leading-[0.88] mt-4 tracking-wide"
          >
            <span className="text-[var(--yellow)]">MI</span>
            <br />
            <span className="text-white">SELECCIÓN</span>
            <br />
            <span className="text-[var(--red)]">COLOMBIA</span>
          </motion.h1>

          {/* Tricolor accent bar */}
          <motion.div variants={fadeUp} className="flex h-[3px] w-52 rounded-full overflow-hidden mt-5">
            <div className="flex-[2] bg-[var(--yellow)]" />
            <div className="flex-1 bg-[var(--blue)]"   />
            <div className="flex-1 bg-[var(--red)]"    />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="mt-5 text-[var(--muted)] text-base md:text-lg leading-relaxed max-w-[44ch]"
          >
            Elige tus <strong className="text-white">23 jugadores</strong> de la
            prelista oficial y arma tu <strong className="text-white">11 ideal</strong>.
            Compara con la comunidad y demuestra que sabes de fútbol.
          </motion.p>

          {/* Countdown — inline, compact */}
          <motion.div
            variants={fadeUp}
            className="mt-5 inline-flex items-center gap-3 self-start
                       bg-white/[0.04] border border-[var(--border)] rounded-2xl px-4 py-2.5"
          >
            <span className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted)] font-semibold shrink-0">
              Faltan
            </span>
            <CountdownWidget />
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3">
            <Link href="/seleccion">
              <button className="group flex items-center gap-3 bg-[var(--yellow)] text-black
                                 font-bold text-base px-7 py-3.5 rounded-full
                                 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                                 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(252,209,22,0.4)]
                                 active:scale-[0.97]">
                Armar mi selección
                <span className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center
                                 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                                 group-hover:translate-x-1 group-hover:scale-110">
                  <ArrowRight size={16} weight="bold" />
                </span>
              </button>
            </Link>
            <Link href="/resultado">
              <button className="flex items-center gap-2 border border-[var(--border2)]
                                 text-white/70 font-semibold text-base px-7 py-3.5 rounded-full
                                 transition-all duration-300
                                 hover:border-[var(--yellow)] hover:text-[var(--yellow)]
                                 hover:-translate-y-0.5">
                Ver estadísticas
              </button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="mt-10 flex items-center gap-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl text-[var(--yellow)]">{s.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── RIGHT: Player card mosaic (desktop only) ── */}
        <div className="hidden lg:block relative self-stretch">
          {/* Left-edge fade blending into background */}
          <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none
                          bg-gradient-to-r from-[var(--dark)] to-transparent" />
          {/* Top + bottom fades */}
          <div className="absolute inset-x-0 top-0 h-24 z-10 pointer-events-none
                          bg-gradient-to-b from-[var(--dark)] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 z-10 pointer-events-none
                          bg-gradient-to-t from-[var(--dark)] to-transparent" />

          {/* Card grid — 2 columns, alternating vertical offsets via marginTop */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-2 w-full max-w-[260px]">
              {MOSAIC.map((card) => (
                <MosaicCard key={card.initials} {...card} />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── SPONSORS SECTION ── */}
      <section className="mt-24 md:mt-32 mb-24 md:mb-32 border-t border-[var(--border)] pt-16 md:pt-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="max-w-4xl mx-auto px-4 sm:px-6"
        >
          <motion.h2
            variants={fadeUp}
            className="text-center font-display text-2xl md:text-3xl text-white mb-4"
          >
            Patrocinadores
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-center text-[var(--muted)] text-sm md:text-base mb-12 md:mb-16"
          >
            Gracias a nuestros aliados por hacer posible esta experiencia
          </motion.p>

          {/* Sponsors Grid */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20"
          >
            {/* Emibytes */}
            <a
              href="#"
              className="group flex items-center justify-center p-6 rounded-2xl
                         border border-[var(--border)] bg-white/[0.02]
                         transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                         hover:border-[var(--yellow)] hover:bg-white/[0.04] hover:-translate-y-1"
            >
              <img
                src="/emibytes-logo.png"
                alt="Emibytes"
                className="h-16 md:h-20 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </a>

            {/* Luisafer */}
            <a
              href="#"
              className="group flex items-center justify-center p-6 rounded-2xl
                         border border-[var(--border)] bg-white/[0.02]
                         transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                         hover:border-[var(--yellow)] hover:bg-white/[0.04] hover:-translate-y-1"
            >
              <img
                src="/luisafer-logo.jpeg"
                alt="Luisafer"
                className="h-16 md:h-20 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </a>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
