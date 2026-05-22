# UX Quick Wins — Búsqueda, Countdown, Match %

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tres mejoras de alto impacto y bajo esfuerzo: búsqueda de jugador en la selección, contador regresivo al Mundial 2026, y porcentaje de coincidencia con la comunidad.

**Architecture:** Cada feature es autocontenida en un solo componente. Sin nuevas dependencias ni rutas de API. Todo el cálculo de match % es client-side sobre datos ya cargados.

**Tech Stack:** Next.js 16 App Router · TypeScript · Framer Motion v12 · @phosphor-icons/react · Tailwind CSS v4

---

## File Map

**Modificar:**
- `frontend/src/components/player/SelectionClient.tsx` — añadir búsqueda por nombre
- `frontend/src/components/layout/LandingPage.tsx` — insertar `<CountdownWidget />`
- `frontend/src/components/layout/ResultClient.tsx` — añadir bloque % coincidencia

**Crear:**
- `frontend/src/components/ui/CountdownWidget.tsx` — widget de cuenta regresiva

---

## Task 1: Búsqueda de jugador por nombre

**Files:**
- Modify: `frontend/src/components/player/SelectionClient.tsx`

Contexto: `SelectionClient.tsx` ya tiene `filter` (posición) y `filtered` (array filtrado). Solo hay que añadir un estado `search` y ampliar el cómputo de `filtered`.

- [ ] **Step 1: Añadir estado `search` y actualizar `filtered`**

Localizar en `SelectionClient.tsx` (líneas 21-34):

```typescript
// ANTES
const [filter, setFilter]     = useState<Filter>("ALL");
const [showGoal, setShowGoal] = useState(false);
// ...
const filtered = players.filter(
  (p) => filter === "ALL" || p.group === filter
);
```

Reemplazar por:

```typescript
const [filter, setFilter]     = useState<Filter>("ALL");
const [search, setSearch]     = useState("");
const [showGoal, setShowGoal] = useState(false);
// ...
const query    = search.trim().toLowerCase();
const filtered = players.filter(
  (p) =>
    (filter === "ALL" || p.group === filter) &&
    (query === "" || p.name.toLowerCase().includes(query))
);
```

- [ ] **Step 2: Añadir el input de búsqueda al sticky bar**

Añadir MagnifyingGlass al import de @phosphor-icons/react:
```typescript
import { ArrowRight, SpeakerSlash, SpeakerHigh, MagnifyingGlass, X } from "@phosphor-icons/react";
```

En el sticky bar, después del bloque `{/* Row 2: filter pills */}` (línea ~90), añadir un Row 3:

```tsx
{/* Row 3: búsqueda */}
<div className="relative mt-1.5">
  <MagnifyingGlass
    size={13}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
  />
  <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Buscar jugador…"
    className="w-full bg-white/5 border border-[var(--border)] rounded-full pl-8 pr-8 py-1.5 text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--border2)] transition-colors duration-200"
  />
  {search && (
    <button
      onClick={() => setSearch("")}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-white transition-colors"
    >
      <X size={12} />
    </button>
  )}
</div>
```

- [ ] **Step 3: Mostrar "sin resultados" cuando el filtro combinado da 0**

En la sección del grid de jugadores, justo antes del `</div>` de cierre del grid, añadir:

```tsx
{filtered.length === 0 && players.length > 0 && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="col-span-full py-16 text-center"
  >
    <p className="text-[var(--muted)] text-sm">
      No se encontró ningún jugador con ese nombre.
    </p>
    <button
      onClick={() => setSearch("")}
      className="mt-3 text-xs text-[var(--yellow)] hover:underline"
    >
      Limpiar búsqueda
    </button>
  </motion.div>
)}
```

Insertar antes de `</AnimatePresence>` en el bloque de `filtered.map(...)`.

- [ ] **Step 4: Verificar manualmente**

- Abrir `/seleccion`.
- Escribir "James" → solo aparece James Rodríguez.
- Cambiar filtro a GK → si hay GK con ese nombre aparece, si no → mensaje vacío.
- Limpiar búsqueda → vuelven todos.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/player/SelectionClient.tsx
git commit -m "feat: add player name search to selection screen"
```

---

## Task 2: Contador regresivo al Mundial 2026

**Files:**
- Create: `frontend/src/components/ui/CountdownWidget.tsx`
- Modify: `frontend/src/components/layout/LandingPage.tsx`

El Mundial 2026 arranca el **11 de junio de 2026**. Hoy es 21 de mayo 2026 → quedan ~21 días.

- [ ] **Step 1: Crear `CountdownWidget.tsx`**

```tsx
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

export default function CountdownWidget() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1_000);
    return () => clearInterval(id);
  }, []);

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
```

- [ ] **Step 2: Insertar el widget en `LandingPage.tsx`**

Añadir el import al inicio de `LandingPage.tsx`:
```typescript
import CountdownWidget from "@/components/ui/CountdownWidget";
```

Localizar el bloque de Stats bar (líneas ~89-103 en LandingPage.tsx) que empieza con:
```tsx
{/* Stats bar */}
<motion.div
  variants={fadeUp}
  className="mt-8 flex items-center gap-8 text-center"
>
```

Insertar **antes** de ese bloque (después del tricolor strip):

```tsx
{/* Countdown */}
<motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-2">
  <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-semibold">
    Faltan para el Mundial 2026
  </p>
  <CountdownWidget />
</motion.div>
```

- [ ] **Step 3: Verificar manualmente**

- Abrir `/`.
- El countdown debe mostrar ~21 días y los segundos deben cambiar en tiempo real.
- En mobile: los números deben ser legibles sin overflow horizontal.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ui/CountdownWidget.tsx frontend/src/components/layout/LandingPage.tsx
git commit -m "feat: add World Cup 2026 countdown widget to landing page"
```

---

## Task 3: % de coincidencia con la comunidad

**Files:**
- Modify: `frontend/src/components/layout/ResultClient.tsx`

`stats.top_squad` ya está cargado. Contiene los jugadores más votados por la comunidad con su ID. La idea: cuántos de los 23 del usuario aparecen en el top de la comunidad.

- [ ] **Step 1: Calcular `matchPct` después de que `stats` cargue**

En `ResultClient.tsx`, localizar:
```typescript
const formationDef  = FORMATIONS[formation];
const startingEleven = Object.values(placedMap);
const hasLineup     = startingEleven.length === 11;
```

Añadir después:

```typescript
const SQUAD_SIZE = 23;

const matchPct = (() => {
  if (!stats || stats.top_squad.length < SQUAD_SIZE) return null;
  const topIds = new Set(stats.top_squad.slice(0, SQUAD_SIZE).map((s) => s.id));
  const matchCount = selectedPlayers.filter((id) => topIds.has(id)).length;
  return Math.round((matchCount / SQUAD_SIZE) * 100);
})();
```

- [ ] **Step 2: Mostrar el bloque de coincidencia**

En el componente `ResultClient`, localizar el bloque `{/* ── Community stats ─────────────────────────── */}` (línea ~176). Añadir **después** de ese bloque (antes de `{/* ── Action buttons ──────────────────────────── */}`):

```tsx
{/* ── Match % ─────────────────────────────────── */}
{matchPct !== null && (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
    className="max-w-screen-xl mx-auto px-4 mb-10"
  >
    <div className="bg-[rgba(252,209,22,0.04)] border border-[var(--border)] rounded-[2rem] p-1.5">
      <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-5 flex flex-col sm:flex-row items-center gap-6">
        {/* Gauge */}
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <motion.circle
              cx="50" cy="50" r="40" fill="none"
              stroke="url(#matchGrad)" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - matchPct / 100) }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
            />
            <defs>
              <linearGradient id="matchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--yellow)" />
                <stop offset="100%" stopColor="var(--red)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-2xl text-[var(--yellow)]">{matchPct}%</span>
          </div>
        </div>
        {/* Text */}
        <div>
          <h2 className="font-display text-2xl text-[var(--yellow)] tracking-wide mb-1">
            COINCIDENCIA CON LA COMUNIDAD
          </h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            {matchPct >= 80
              ? "¡Eres un experto! Tu selección coincide casi perfectamente con la de la comunidad."
              : matchPct >= 60
              ? "Buena selección. Tienes buen ojo para el talento colombiano."
              : matchPct >= 40
              ? "Selección interesante. Tienes apuestas diferentes a la comunidad."
              : "¡Eres un selector atrevido! Tu selección es muy original."}
          </p>
          <p className="text-[10px] text-[var(--muted)] mt-2 uppercase tracking-widest">
            {selectedPlayers.filter((id) =>
              stats!.top_squad.slice(0, SQUAD_SIZE).some((s) => s.id === id)
            ).length} de {SQUAD_SIZE} jugadores en común
          </p>
        </div>
      </div>
    </div>
  </motion.div>
)}
```

- [ ] **Step 3: Verificar manualmente**

- Guardar una selección con varios jugadores populares (los del top de LOS MÁS ELEGIDOS).
- El bloque debe aparecer con un porcentaje y el SVG circular animado.
- Cambiar algunos jugadores y guardar de nuevo → el número debe reflejar el cambio.
- Si `stats.top_squad.length < 23` (base de datos vacía), el bloque no aparece.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/layout/ResultClient.tsx
git commit -m "feat: show community match percentage on result page"
```
