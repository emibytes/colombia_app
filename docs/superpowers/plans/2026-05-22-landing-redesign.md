# Landing Page Redesign — Mi Selección Colombia 2026

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the landing page from a centered generic hero to an asymmetric editorial split-screen that previews the actual product (player cards) and leverages the existing brand assets.

**Architecture:** Single `LandingPage.tsx` rewrite + one inline `PlayerCardMosaic` sub-component (no new files). Left 55% column holds all content (logo, title, CTAs, countdown, stats). Right 45% column shows a decorative 2×3 grid of animated player cards that preview the selection experience. Mobile collapses to single column, mosaic hidden.

**Tech Stack:** Next.js 15, React, Framer Motion, Tailwind CSS v4, `@phosphor-icons/react`, existing design tokens (`--yellow`, `--blue`, `--red`, `--dark`), existing `CountdownWidget`, `Logo`, `PlayerAvatar` components.

---

## Visual Concept

```
DESKTOP (lg+) — asymmetric split, left-aligned
┌─────────────────────────────────────────────────────────────────┐
│  [Navbar pill — fixed]                                          │
│                                                                 │
│  ┌─────────────────────────────┐  ┌────────────────────────┐   │
│  │                             │  │  [gradient left fade]  │   │
│  │  [Logo shield + wordmark]   │  │                        │   │
│  │                             │  │  ┌──────┐  ┌──────┐   │   │
│  │  ┈ Mundial 2026 · Lorenzo ┈ │  │  │  CV  │  │  LD  │   │   │
│  │                             │  │  │  GK✓ │  │ FWD✓ │   │   │
│  │  MI                         │  │  └──────┘  └──────┘   │   │
│  │  SELECCIÓN                  │  │                        │   │
│  │  COLOMBIA                   │  │  ┌──────┐  ┌──────┐   │   │
│  │                             │  │  │  RR  │  │  DS  │   │   │
│  │  ███▓░ (tricolor bar)       │  │  │ MID✓ │  │  DEF │   │   │
│  │                             │  │  └──────┘  └──────┘   │   │
│  │  Elige tus 23 jugadores...  │  │                        │   │
│  │                             │  │  ┌──────┐  ┌──────┐   │   │
│  │  Faltan: 385d 14h 32m 08s   │  │  │  JD  │  │  DM  │   │   │
│  │                             │  │  │ FWD✓ │  │  DEF │   │   │
│  │  [Armar selección →]        │  │  └──────┘  └──────┘   │   │
│  │  [Ver estadísticas]         │  │                        │   │
│  │                             │  └────────────────────────┘   │
│  │  55 jugadores · 23 cupos    │                               │
│  │  5 formaciones              │                               │
│  └─────────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘

MOBILE (< lg) — single column, left-aligned, mosaic hidden
┌─────────────────┐
│ [Logo]          │
│ [Eyebrow tag]   │
│ MI              │
│ SELECCIÓN       │
│ COLOMBIA        │
│ ══(tricolor)    │
│ Subtitle text   │
│ [Countdown]     │
│ [CTA primary]   │
│ [CTA secondary] │
│ 55 · 23 · 5     │
└─────────────────┘
```

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/src/components/layout/LandingPage.tsx` | **Rewrite** | Full redesign — split layout, inline PlayerCardMosaic |

No new files. No new dependencies.

---

## Task 1: Rewrite LandingPage.tsx

**Files:**
- Modify: `frontend/src/components/layout/LandingPage.tsx` (full rewrite)

### Design decisions locked in this task:

**Typography:**
- H1: `font-display text-[clamp(4rem,7vw,9.5rem)] leading-[0.88]` — left-aligned
- "MI" → `text-[var(--yellow)]`, "SELECCIÓN" → `text-white`, "COLOMBIA" → `text-[var(--red)]`

**Layout:**
- `grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]`
- Left column: `flex flex-col justify-center min-h-dvh pt-24 pb-16`
- Right column: `hidden lg:block relative` — decorative player card mosaic

**Tricolor bar:**
- Positioned immediately below H1 as visual separator
- `h-[3px] w-52 rounded-full` with the 3 flag segments

**Countdown:**
- Inline row: label + CountdownWidget in a compact pill-style container
- Positioned between subtitle and CTAs for urgency

**Stats:**
- Bottom of left column, horizontal row of 3 numbers
- Font: `font-display text-3xl text-[var(--yellow)]`

**Background:**
- Yellow orb: opacity `0.09` (up from 0.07) — more visible
- Blue orb: keeps 0.10
- Add a third subtle red orb bottom-left at 0.04

**Player Card Mosaic (inline component):**
- 6 hardcoded decorative players from the real prelista
- 2-column CSS grid with alternating `translateY` offsets per column
- Each card: `PlayerAvatar` (lg size) + name + position badge
- 3 out of 6 show selected state (yellow border + `CheckCircle` icon)
- Float animation: `animate={{ y: [0, -8, 0] }}` with staggered duration (2.8s–4.2s) and `repeat: Infinity, ease: "easeInOut"`
- Left-edge gradient fade: `absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[var(--dark)] to-transparent pointer-events-none`

- [ ] **Step 1: Write the full rewrite**

```tsx
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
const MOSAIC = [
  { initials: "CV", name: "Camilo Vargas",     group: "GK"  as PlayerGroup, badge: "Portero",    selected: true,  delay: 0,    duration: 3.2, offset: 0    },
  { initials: "LD", name: "Luis Díaz",         group: "FWD" as PlayerGroup, badge: "Delantero",  selected: true,  delay: 0.4,  duration: 3.8, offset: 28   },
  { initials: "RR", name: "Richard Ríos",      group: "MID" as PlayerGroup, badge: "Mediocampo", selected: true,  delay: 0.2,  duration: 4.1, offset: 0    },
  { initials: "DS", name: "Dávinson Sánchez",  group: "DEF" as PlayerGroup, badge: "Defensa",    selected: false, delay: 0.6,  duration: 3.5, offset: 28   },
  { initials: "JD", name: "Jhon Durán",        group: "FWD" as PlayerGroup, badge: "Delantero",  selected: true,  delay: 0.1,  duration: 2.9, offset: 0    },
  { initials: "DM", name: "Daniel Muñoz",      group: "DEF" as PlayerGroup, badge: "Defensa",    selected: false, delay: 0.5,  duration: 3.6, offset: 28   },
];

const STATS = [
  { value: "55", label: "Jugadores" },
  { value: "23", label: "Cupos"     },
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

          {/* Title — LEFT ALIGNED, large */}
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
            ¡Demuestra que sabes de fútbol!
          </motion.p>

          {/* Countdown — inline, compact */}
          <motion.div
            variants={fadeUp}
            className="mt-5 inline-flex items-center gap-3 self-start
                       bg-white/4 border border-[var(--border)] rounded-2xl px-4 py-2.5"
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

          {/* Card grid — 2 columns, column 2 offset down */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-3 w-full max-w-[380px]">
              {MOSAIC.map((card) => (
                <MosaicCard key={card.initials} {...card} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verificar que no hay imports faltantes**

Confirmar que `@/components/ui/Logo` y `@/components/ui/PlayerAvatar` existen (ya existen en el proyecto).

- [ ] **Step 3: Revisar mobile**

En viewport < 1024px, la columna derecha (`hidden lg:block`) desaparece. La columna izquierda es full-width con el contenido centrado... wait — en mobile queremos left-aligned también. Verificar que no hay `items-center` en el `<main>`. El `<main>` usa `min-h-dvh` + padding, sin `items-center justify-center` global. La columna izquierda usa `flex flex-col` que por defecto es left-aligned. ✓

- [ ] **Step 4: Verificar animaciones**

- El `stagger` anima el lado izquierdo con `staggerChildren: 0.10`
- Las `MosaicCard` tienen sus propias animaciones de entrada (`delay` individual)
- El float loop usa `animate={{ y: [0, -8, 0] }}` con `repeat: Infinity`
- Framer Motion ya está instalado (confirmado en código existente)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/layout/LandingPage.tsx
git commit -m "redesign: asymmetric editorial hero with player card mosaic"
```

---

## Ajustes post-implementación opcionales

Estos NO son parte del plan principal pero se pueden aplicar si el resultado necesita tuning:

| Ajuste | Descripción |
|--------|-------------|
| H1 font size | Si "SELECCIÓN" se parte en 2 líneas en lg, reducir `7.5vw` a `6.5vw` |
| Mosaic card size | Si las cards se ven muy grandes, cambiar `max-w-[380px]` a `max-w-[340px]` |
| Float intensity | Si el movimiento se ve exagerado, reducir `y: [0, -8, 0]` a `[0, -5, 0]` |
| Right column width | Si el grid se siente apretado, cambiar `400px` a `360px` en `lg:grid-cols-[1fr_400px]` |

---

## Self-Review

- [x] **Spec coverage:** Split-screen ✓ | Left-aligned ✓ | Logo ✓ | Player mosaic ✓ | Countdown reposicionado ✓ | Stats ✓ | Mobile collapse ✓ | Background mejorado ✓
- [x] **Placeholder scan:** No "TBD", no "TODO", no "implement later" found.
- [x] **Type consistency:** `PlayerGroup` importado correctamente. `MOSAIC` tipado inline con `as PlayerGroup`. `MosaicCard` recibe `typeof MOSAIC[0]`.
- [x] **No new dependencies:** Solo imports de componentes ya existentes en el proyecto.
