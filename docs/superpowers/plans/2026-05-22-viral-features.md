# Viral Features — Share Image, Player Modal, Formation Stats, DT Comparison, Duel Mode

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 fan-engagement features: share lineup as an image, player detail modal in selection, formation popularity stats, DT comparison gauge, and a duel mode with shareable links.

**Architecture:** Tasks 1–2 are frontend-only additions with no backend changes. Tasks 3–4 extend the existing `/api/selections/stats` JSON response. Tasks 5–6 add a config-based DT comparison to the same stats endpoint. Tasks 7–9 introduce a `share_token` column (migration), a new public `GET /api/selections/share/{token}` endpoint, and a new Next.js `/duelo/[token]` page.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript, Framer Motion 12, Zustand 5, Tailwind CSS v4, `@phosphor-icons/react`, `html-to-image` (must install), Laravel 11, Eloquent, PHP 8.2.

**Note on independence:** Each task group (1–2, 3–4, 5–6, 7–9) can be committed and deployed independently. Implement them in order to avoid merge conflicts on `ResultClient.tsx` and `SelectionController.php`.

---

## File Map

### New files
| File | Purpose |
|------|---------|
| `frontend/src/components/player/PlayerDetailModal.tsx` | Bottom-sheet drawer with player stats |
| `frontend/src/components/ui/ShareImageButton.tsx` | Capture + share/download image button |
| `frontend/src/app/duelo/[token]/page.tsx` | SSR page that fetches shared selection |
| `frontend/src/components/layout/DuelClient.tsx` | Client component: side-by-side comparison UI |
| `backend/config/dt_selection.php` | Config holding official DT squad IDs (null until announced) |
| `backend/database/migrations/2026_05_22_000001_add_share_token_to_selections.php` | Adds `share_token` UUID column |
| `backend/tests/Feature/SelectionStatsExtendedTest.php` | Tests for formation_distribution + dt_squad |
| `backend/tests/Feature/SelectionShareTest.php` | Tests for share endpoint |

### Modified files
| File | Changes |
|------|---------|
| `frontend/src/components/player/PlayerCard.tsx` | Add optional `onDetail` prop + info icon button |
| `frontend/src/components/player/SelectionClient.tsx` | Add `detailId` state + render `PlayerDetailModal` |
| `frontend/src/components/layout/ResultClient.tsx` | Add captureRef, ShareImageButton, formation bar chart, DT gauge, share token + duel button |
| `frontend/src/types/index.ts` | Extend `StatsResponse`, add `SharedSelectionResponse` |
| `frontend/src/lib/api.ts` | Add `getSharedSelection(token)` |
| `backend/app/Http/Controllers/Api/SelectionController.php` | Add `formation_distribution`, `dt_squad` to `stats()`, generate `share_token` in `store()`, add `share()` method |
| `backend/app/Models/Selection.php` | Add `share_token` to fillable |
| `backend/routes/api.php` | Add `GET /api/selections/share/{token}` route |

---

## Task 1: Player Detail Modal

**Files:**
- Modify: `frontend/src/components/player/PlayerCard.tsx`
- Create: `frontend/src/components/player/PlayerDetailModal.tsx`
- Modify: `frontend/src/components/player/SelectionClient.tsx`

- [ ] **Step 1: Add `onDetail` prop and info button to PlayerCard**

Replace the full content of `frontend/src/components/player/PlayerCard.tsx`:

```tsx
"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Info } from "@phosphor-icons/react";
import { Player } from "@/types";
import { cn } from "@/lib/utils";
import PlayerAvatar from "@/components/ui/PlayerAvatar";

interface Props {
  player:    Player;
  selected:  boolean;
  disabled:  boolean;
  onToggle:  (id: number) => void;
  onDetail?: (id: number) => void;
}

const BADGE_LABELS: Record<string, string> = {
  GK:  "Portero",
  DEF: "Defensa",
  MID: "Medioc.",
  FWD: "Delantero",
};

export default function PlayerCard({ player, selected, disabled, onToggle, onDetail }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled && !selected) return;

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
      <div
        className={cn(
          "absolute inset-0 z-0 pointer-events-none transition-opacity duration-350",
          "bg-[radial-gradient(circle_at_50%_-20%,rgba(252,209,22,0.09),transparent_70%)]",
          selected ? "opacity-100" : "opacity-0"
        )}
      />

      <div className="relative z-10 bg-[var(--card2)] rounded-[calc(1.5rem-3px)] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <PlayerAvatar name={player.name} group={player.group} size="lg" />

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

      {/* Selected badge */}
      <motion.div
        className="absolute top-2.5 right-2.5 z-20 text-[var(--yellow)] drop-shadow-[0_0_8px_rgba(252,209,22,0.6)]"
        initial={{ scale: 0, rotate: -45 }}
        animate={selected ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -45 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
      >
        <CheckCircle size={22} weight="fill" />
      </motion.div>

      {/* Info button — only when onDetail is provided */}
      {onDetail && (
        <button
          onClick={(e) => { e.stopPropagation(); onDetail(player.id); }}
          className="absolute bottom-[4.5rem] right-2 z-20 p-1 rounded-full text-[var(--muted)] hover:text-white transition-colors duration-200"
          aria-label="Ver detalles"
        >
          <Info size={14} weight="bold" />
        </button>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create PlayerDetailModal**

Create `frontend/src/components/player/PlayerDetailModal.tsx`:

```tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { Player } from "@/types";
import PlayerAvatar from "@/components/ui/PlayerAvatar";
import { cn } from "@/lib/utils";

const POSITION_FULL: Record<string, string> = {
  GK:  "Portero",
  DEF: "Defensa",
  MID: "Mediocampista",
  FWD: "Delantero",
};

interface Props {
  player:   Player | null;
  selected: boolean;
  onClose:  () => void;
  onToggle: (id: number) => void;
}

export default function PlayerDetailModal({ player, selected, onClose, onToggle }: Props) {
  return (
    <AnimatePresence>
      {player && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)] border-t border-[var(--border)] rounded-t-[2rem] max-h-[80dvh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-[var(--border)] rounded-full" />
            </div>

            <div className="px-6 pb-8">
              {/* Header */}
              <div className="flex items-start gap-4 my-5">
                <PlayerAvatar name={player.name} group={player.group} size="lg" />
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-2xl text-white leading-tight">{player.name}</h2>
                  <p className="text-[var(--muted)] text-sm mt-0.5">{POSITION_FULL[player.group] ?? player.position}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-[var(--muted)] hover:text-white transition-colors shrink-0"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>

              {/* Stats grid */}
              <dl className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: "Edad",      value: `${player.age} años` },
                  { label: "Posición",  value: player.group },
                  { label: "Club",      value: player.club  || "—" },
                  { label: "País",      value: player.country || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[var(--card2)] rounded-2xl p-3.5">
                    <dt className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted)] font-semibold">{label}</dt>
                    <dd className="text-white font-semibold mt-1 text-sm">{value}</dd>
                  </div>
                ))}
              </dl>

              {/* Toggle button */}
              <button
                onClick={() => { onToggle(player.id); onClose(); }}
                className={cn(
                  "w-full font-bold py-3.5 rounded-full text-sm transition-all duration-300",
                  selected
                    ? "bg-white/10 text-[var(--muted)] border border-[var(--border)] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                    : "bg-[var(--yellow)] text-black hover:shadow-[0_0_32px_rgba(252,209,22,0.35)]"
                )}
              >
                {selected ? "Quitar de la selección" : "Agregar a mi selección"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Wire modal into SelectionClient**

In `frontend/src/components/player/SelectionClient.tsx`, make these changes:

**Add import** (after existing imports):
```tsx
import PlayerDetailModal from "./PlayerDetailModal";
```

**Add state** (after `const [scrolled, setScrolled] = useState(false);`):
```tsx
const [detailId, setDetailId] = useState<number | null>(null);
```

**Update PlayerCard render** to pass `onDetail`:
```tsx
<PlayerCard
  player={p}
  selected={selectedPlayers.includes(p.id)}
  disabled={count >= SQUAD_SIZE && !selectedPlayers.includes(p.id)}
  onToggle={handleToggle}
  onDetail={setDetailId}
/>
```

**Add modal** before the closing `</div>` of the component return (before `<GoalOverlay ...`):
```tsx
<PlayerDetailModal
  player={detailId !== null ? players.find((p) => p.id === detailId) ?? null : null}
  selected={detailId !== null ? selectedPlayers.includes(detailId) : false}
  onClose={() => setDetailId(null)}
  onToggle={handleToggle}
/>
```

- [ ] **Step 4: Verify in browser**

Start the dev server: `cd frontend && npm run dev`

Open `http://localhost:3000/seleccion`. Click the `ⓘ` icon on any player card. The bottom sheet should slide up showing name, age, club, country, and an add/remove button. Clicking outside the modal closes it.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/player/PlayerCard.tsx \
        frontend/src/components/player/PlayerDetailModal.tsx \
        frontend/src/components/player/SelectionClient.tsx
git commit -m "feat: add player detail modal with bottom-sheet drawer"
```

---

## Task 2: Share as Image

**Files:**
- Install: `html-to-image`
- Create: `frontend/src/components/ui/ShareImageButton.tsx`
- Modify: `frontend/src/components/layout/ResultClient.tsx`

- [ ] **Step 1: Install html-to-image**

```bash
cd frontend && npm install html-to-image
```

Expected: `added 1 package` (or similar). No peer-dep warnings.

- [ ] **Step 2: Create ShareImageButton**

Create `frontend/src/components/ui/ShareImageButton.tsx`:

```tsx
"use client";
import { useState, RefObject } from "react";
import { motion } from "framer-motion";
import { ShareNetwork, DownloadSimple } from "@phosphor-icons/react";

interface Props {
  captureRef: RefObject<HTMLDivElement | null>;
  filename?: string;
}

export default function ShareImageButton({ captureRef, filename = "mi-seleccion-colombia.png" }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const handle = async () => {
    if (!captureRef.current || state === "loading") return;
    setState("loading");

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(captureRef.current, {
        backgroundColor: "#05080f",
        pixelRatio: 2,
        cacheBust: true,
      });

      const blob  = await fetch(dataUrl).then((r) => r.blob());
      const file  = new File([blob], filename, { type: "image/png" });

      if (typeof navigator.share === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Mi Selección Colombia 2026",
          text:  "¡Esta es mi selección Colombia para el Mundial 2026! ¿La tuya?",
          files: [file],
        });
      } else {
        const a  = document.createElement("a");
        a.href   = dataUrl;
        a.download = filename;
        a.click();
      }
      setState("done");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("idle");
    }
  };

  return (
    <motion.button
      onClick={handle}
      disabled={state === "loading"}
      className="group flex items-center gap-2.5 border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--yellow)] font-semibold px-6 py-3.5 rounded-full text-sm transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      {state === "done"
        ? <DownloadSimple size={18} weight="bold" />
        : <ShareNetwork  size={18} weight="bold" />}
      {state === "loading" ? "Generando imagen…"
       : state === "done"  ? "¡Imagen lista!"
       : "Compartir mi selección"}
    </motion.button>
  );
}
```

- [ ] **Step 3: Add captureRef and ShareImageButton to ResultClient**

In `frontend/src/components/layout/ResultClient.tsx`:

**Add import** after existing imports:
```tsx
import { useRef } from "react";
import ShareImageButton from "@/components/ui/ShareImageButton";
```

(Add `useRef` to the existing `{ useState, useEffect, useCallback }` import if not already there.)

**Add ref** after `const sound = useSound();`:
```tsx
const captureRef = useRef<HTMLDivElement>(null);
```

**Wrap the two-column grid** (the div that contains "MIS 23 JUGADORES" and "MI 11 IDEAL") with the ref. Find this line:
```tsx
<div className="max-w-screen-xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
```
Change it to:
```tsx
<div ref={captureRef} className="max-w-screen-xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 pb-2">
```

**Add ShareImageButton** in the action buttons section, after the "Guardar mi selección" button and before the "Editar mi 11" button:
```tsx
<ShareImageButton captureRef={captureRef} />
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:3000/resultado` (with a selection already made). Click "Compartir mi selección". On mobile Chrome it should open the native share sheet; on desktop it should download `mi-seleccion-colombia.png`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ui/ShareImageButton.tsx \
        frontend/src/components/layout/ResultClient.tsx \
        frontend/package.json frontend/package-lock.json
git commit -m "feat: share lineup as downloadable/shareable image"
```

---

## Task 3: Formation Stats — Backend

**Files:**
- Modify: `backend/app/Http/Controllers/Api/SelectionController.php`
- Create: `backend/tests/Feature/SelectionStatsExtendedTest.php`

- [ ] **Step 1: Write the failing test**

Create `backend/tests/Feature/SelectionStatsExtendedTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\Selection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SelectionStatsExtendedTest extends TestCase
{
    use RefreshDatabase;

    public function test_stats_includes_formation_distribution(): void
    {
        Selection::create([
            'session_id'      => 'sess-a',
            'squad_players'   => [1, 2, 3],
            'starting_eleven' => [1, 2, 3],
            'formation'       => '4-3-3',
        ]);
        Selection::create([
            'session_id'      => 'sess-b',
            'squad_players'   => [4, 5, 6],
            'starting_eleven' => [4, 5, 6],
            'formation'       => '4-3-3',
        ]);
        Selection::create([
            'session_id'      => 'sess-c',
            'squad_players'   => [7, 8, 9],
            'starting_eleven' => [7, 8, 9],
            'formation'       => '4-4-2',
        ]);

        $res = $this->getJson('/api/selections/stats');

        $res->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonStructure([
                'formation_distribution' => [
                    '*' => ['formation', 'count'],
                ],
            ]);

        $dist = collect($res->json('formation_distribution'));
        $this->assertEquals(2, $dist->firstWhere('formation', '4-3-3')['count']);
        $this->assertEquals(1, $dist->firstWhere('formation', '4-4-2')['count']);
    }

    public function test_stats_includes_dt_squad_key(): void
    {
        $res = $this->getJson('/api/selections/stats');

        $res->assertOk()->assertJsonStructure(['dt_squad']);
        // dt_squad is null when config has no IDs set
        $this->assertNull($res->json('dt_squad'));
    }
}
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd backend && php artisan test --filter=SelectionStatsExtendedTest
```

Expected: FAIL — `formation_distribution` key missing from response.

- [ ] **Step 3: Add formation_distribution and dt_squad to stats()**

In `backend/app/Http/Controllers/Api/SelectionController.php`, replace the `stats()` method body:

```php
public function stats(): JsonResponse
{
    $total = Selection::count();

    $topSquad = Vote::where('type', 'squad')
        ->selectRaw('player_id as id, COUNT(*) as votes')
        ->groupBy('player_id')
        ->orderByDesc('votes')
        ->limit(15)
        ->get()
        ->map(fn ($row) => [
            'id'    => $row->id,
            'name'  => '',
            'votes' => $row->votes,
        ]);

    $topEleven = Vote::where('type', 'starting_eleven')
        ->selectRaw('player_id as id, COUNT(*) as votes')
        ->groupBy('player_id')
        ->orderByDesc('votes')
        ->limit(11)
        ->get()
        ->map(fn ($row) => [
            'id'    => $row->id,
            'name'  => '',
            'votes' => $row->votes,
        ]);

    $formationDist = Selection::selectRaw('formation, COUNT(*) as count')
        ->groupBy('formation')
        ->orderByDesc('count')
        ->get()
        ->map(fn ($row) => [
            'formation' => $row->formation,
            'count'     => (int) $row->count,
        ]);

    $dtIds = config('dt_selection.squad_player_ids', []);
    $dtSquad = !empty($dtIds) ? $dtIds : null;

    return response()->json([
        'ok'                   => true,
        'total_selections'     => $total,
        'top_squad'            => $topSquad,
        'top_eleven'           => $topEleven,
        'formation_distribution' => $formationDist,
        'dt_squad'             => $dtSquad,
    ]);
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
php artisan test --filter=SelectionStatsExtendedTest
```

Expected: PASS (both tests green). `formation_distribution` is present; `dt_squad` is null.

- [ ] **Step 5: Commit**

```bash
git add backend/app/Http/Controllers/Api/SelectionController.php \
        backend/tests/Feature/SelectionStatsExtendedTest.php
git commit -m "feat: add formation_distribution and dt_squad to stats endpoint"
```

---

## Task 4: Formation Stats — Frontend

**Files:**
- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/components/layout/ResultClient.tsx`

- [ ] **Step 1: Extend StatsResponse type**

In `frontend/src/types/index.ts`, replace the `StatsResponse` interface:

```typescript
export interface StatsResponse {
  ok:                     boolean;
  total_selections:       number;
  top_squad:              Array<{ id: number; name: string; votes: number }>;
  top_eleven:             Array<{ id: number; name: string; votes: number }>;
  formation_distribution: Array<{ formation: string; count: number }>;
  dt_squad:               number[] | null;
}
```

- [ ] **Step 2: Add formation bar chart to ResultClient**

In `frontend/src/components/layout/ResultClient.tsx`, add this block **after** the `{/* ── Community stats ── */}` block and **before** the `{/* ── Match % ── */}` block:

```tsx
{/* ── Formation stats ────────────────────────── */}
{stats && stats.formation_distribution.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.35, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
    className="max-w-screen-xl mx-auto px-4 mb-10"
  >
    <div className="bg-[rgba(252,209,22,0.04)] border border-[var(--border)] rounded-[2rem] p-1.5">
      <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl text-[var(--yellow)] tracking-wide">
            FORMACIONES POPULARES
          </h2>
          <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest">
            {stats.total_selections.toLocaleString()} selecciones
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {stats.formation_distribution.map((item, i) => {
            const maxCount = stats.formation_distribution[0]?.count ?? 1;
            const pct = Math.round((item.count / maxCount) * 100);
            return (
              <div key={item.formation} className="flex items-center gap-3">
                <span className="font-display text-sm text-[var(--yellow)] w-16 shrink-0 tabular-nums">
                  {item.formation}
                </span>
                <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--yellow)] to-[var(--blue)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.4 + i * 0.07, duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                  />
                </div>
                <span className="text-[11px] text-[var(--muted)] w-10 text-right shrink-0 tabular-nums">
                  {item.count.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </motion.div>
)}
```

- [ ] **Step 3: Verify in browser**

Open `/resultado`. If there are selections with different formations in the DB, the "FORMACIONES POPULARES" section should appear below "LOS MÁS ELEGIDOS". Bars animate in sequentially with a stagger.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/index.ts \
        frontend/src/components/layout/ResultClient.tsx
git commit -m "feat: display formation popularity bar chart on result page"
```

---

## Task 5: DT Comparison — Backend Config

**Files:**
- Create: `backend/config/dt_selection.php`

- [ ] **Step 1: Create DT selection config**

Create `backend/config/dt_selection.php`:

```php
<?php

/**
 * Official DT (Head Coach) squad selection.
 *
 * Set 'squad_player_ids' to an array of Player IDs (from the players table)
 * when the official 26-man World Cup 2026 squad is announced.
 * Leave as empty array to disable the DT comparison feature.
 */

return [
    'squad_player_ids' => env('DT_SQUAD_IDS', ''),
];
```

This reads from the `.env` file. To activate the feature, add in `backend/.env`:
```
DT_SQUAD_IDS=1,5,8,12,17,21,24,30,33,38,40,42,44,47,49,51,52,53,54,55,3,7,11
```
(23 comma-separated player IDs from the players table.)

However, the config value comes as a string, so `stats()` needs to handle parsing. Update `SelectionController::stats()` — replace the `$dtIds` line:

```php
$raw    = config('dt_selection.squad_player_ids', '');
$dtIds  = ($raw !== '' && $raw !== null)
    ? array_map('intval', explode(',', (string) $raw))
    : [];
$dtSquad = !empty($dtIds) ? $dtIds : null;
```

- [ ] **Step 2: Run all tests to confirm nothing broke**

```bash
cd backend && php artisan test
```

Expected: All green.

- [ ] **Step 3: Commit**

```bash
git add backend/config/dt_selection.php \
        backend/app/Http/Controllers/Api/SelectionController.php
git commit -m "feat: add DT squad config and include dt_squad in stats endpoint"
```

---

## Task 6: DT Comparison — Frontend

**Files:**
- Modify: `frontend/src/components/layout/ResultClient.tsx`

*(StatsResponse already has `dt_squad: number[] | null` from Task 4)*

- [ ] **Step 1: Add DT comparison section to ResultClient**

In `frontend/src/components/layout/ResultClient.tsx`, add this block **after** the `{/* ── Match % ── */}` block:

```tsx
{/* ── DT comparison ──────────────────────────── */}
{stats?.dt_squad && stats.dt_squad.length > 0 && (() => {
  const dtSet    = new Set(stats.dt_squad);
  const matched  = selectedPlayers.filter((id) => dtSet.has(id)).length;
  const total    = stats.dt_squad.length;
  const dtPct    = Math.round((matched / total) * 100);
  const circumference = 2 * Math.PI * 40;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      className="max-w-screen-xl mx-auto px-4 mb-10"
    >
      <div className="bg-[rgba(0,80,200,0.06)] border border-[var(--border)] rounded-[2rem] p-1.5">
        <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-5 flex flex-col sm:flex-row items-center gap-6">
          {/* Gauge */}
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <motion.circle
                cx="50" cy="50" r="40" fill="none"
                stroke="url(#dtGrad)" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - dtPct / 100) }}
                transition={{ delay: 0.55, duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
              />
              <defs>
                <linearGradient id="dtGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--blue)" />
                  <stop offset="100%" stopColor="var(--yellow)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-2xl text-[var(--yellow)]">{dtPct}%</span>
            </div>
          </div>
          {/* Text */}
          <div>
            <h2 className="font-display text-2xl text-[var(--yellow)] tracking-wide mb-1">
              VS. EL DT OFICIAL
            </h2>
            <p className="text-[var(--muted)] text-sm leading-relaxed">
              {dtPct >= 80
                ? "¡Pensás igual que el DT! Tu selección casi coincide con la oficial."
                : dtPct >= 60
                ? "Muy buen ojo. La mayoría de tus elegidos están en la lista del DT."
                : dtPct >= 40
                ? "Tienes tus propias apuestas. Algunos coinciden con el DT, otros no."
                : "Tu selección es muy diferente a la del DT. ¡Sos un selector audaz!"}
            </p>
            <p className="text-[10px] text-[var(--muted)] mt-2 uppercase tracking-widest">
              {matched} de {total} jugadores coinciden con la lista oficial
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
})()}
```

- [ ] **Step 2: Verify in browser**

Without `DT_SQUAD_IDS` set in `.env`, the section should not render. Add `DT_SQUAD_IDS=1,2,3,4,5` to `backend/.env`, restart `php artisan serve`, reload `/resultado` — the blue "VS. EL DT OFICIAL" gauge should appear.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/ResultClient.tsx
git commit -m "feat: add DT official comparison gauge on result page"
```

---

## Task 7: Duel Mode — Database Migration

**Files:**
- Create: `backend/database/migrations/2026_05_22_000001_add_share_token_to_selections.php`
- Modify: `backend/app/Models/Selection.php`

- [ ] **Step 1: Create migration**

Create `backend/database/migrations/2026_05_22_000001_add_share_token_to_selections.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('selections', function (Blueprint $table) {
            $table->uuid('share_token')->nullable()->unique()->after('formation');
        });
    }

    public function down(): void
    {
        Schema::table('selections', function (Blueprint $table) {
            $table->dropColumn('share_token');
        });
    }
};
```

- [ ] **Step 2: Update Selection model**

In `backend/app/Models/Selection.php`, replace `$fillable`:

```php
protected $fillable = ['session_id', 'user_id', 'squad_players', 'starting_eleven', 'formation', 'share_token'];
```

- [ ] **Step 3: Run migration**

```bash
cd backend && php artisan migrate
```

Expected: `Migrating: 2026_05_22_000001_add_share_token_to_selections` → `Migrated`.

- [ ] **Step 4: Update store() to generate and return share_token**

In `backend/app/Http/Controllers/Api/SelectionController.php`, replace the entire `store()` method:

```php
public function store(StoreSelectionRequest $request): JsonResponse
{
    $data   = $request->validated();
    $pat    = $request->bearerToken()
                ? PersonalAccessToken::findToken($request->bearerToken())
                : null;
    $userId = $pat?->tokenable_id;

    $updateData = [
        'squad_players'   => $data['squad_players'],
        'starting_eleven' => $data['starting_eleven'] ?? null,
        'formation'       => $data['formation'],
    ];
    if ($userId) {
        $updateData['user_id'] = $userId;
    }

    // Find existing record to preserve share_token
    $existing  = Selection::where('session_id', $data['session_id'])->first();
    $shareToken = $existing?->share_token ?? (string) \Illuminate\Support\Str::uuid();

    $selection = Selection::updateOrCreate(
        ['session_id' => $data['session_id']],
        array_merge($updateData, ['share_token' => $shareToken])
    );

    // Record individual votes when a starting 11 is provided
    if (!empty($data['starting_eleven'])) {
        Vote::whereIn('player_id', array_merge(
            $data['squad_players'],
            $data['starting_eleven']
        ))->delete();

        $votes = [];
        foreach ($data['squad_players'] as $playerId) {
            $votes[] = [
                'player_id'  => $playerId,
                'type'       => 'squad',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        foreach ($data['starting_eleven'] as $playerId) {
            $votes[] = [
                'player_id'  => $playerId,
                'type'       => 'starting_eleven',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        Vote::insert($votes);
    }

    return response()->json([
        'ok'          => true,
        'message'     => '¡Selección guardada con éxito!',
        'id'          => $selection->id,
        'share_token' => $selection->share_token,
    ], 201);
}
```

- [ ] **Step 5: Run all tests**

```bash
php artisan test
```

Expected: All green (existing tests still pass; existing tests that call `store()` will now also receive `share_token` in the response, which they don't assert on, so no breakage).

- [ ] **Step 6: Commit**

```bash
git add backend/database/migrations/2026_05_22_000001_add_share_token_to_selections.php \
        backend/app/Models/Selection.php \
        backend/app/Http/Controllers/Api/SelectionController.php
git commit -m "feat: add share_token to selections and return it from store endpoint"
```

---

## Task 8: Duel Mode — Backend Share Endpoint

**Files:**
- Modify: `backend/app/Http/Controllers/Api/SelectionController.php`
- Modify: `backend/routes/api.php`
- Create: `backend/tests/Feature/SelectionShareTest.php`

- [ ] **Step 1: Write failing tests**

Create `backend/tests/Feature/SelectionShareTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\Player;
use App\Models\Selection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SelectionShareTest extends TestCase
{
    use RefreshDatabase;

    private function makeSelection(string $token): Selection
    {
        return Selection::create([
            'session_id'      => 'sess-share-' . $token,
            'squad_players'   => [1, 2, 3],
            'starting_eleven' => [1, 2, 3],
            'formation'       => '4-3-3',
            'share_token'     => $token,
        ]);
    }

    public function test_share_endpoint_returns_selection_data(): void
    {
        $token = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
        $this->makeSelection($token);

        $res = $this->getJson("/api/selections/share/{$token}");

        $res->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('formation', '4-3-3')
            ->assertJsonStructure(['squad_players', 'starting_eleven', 'formation', 'players']);
    }

    public function test_share_endpoint_returns_404_for_unknown_token(): void
    {
        $res = $this->getJson('/api/selections/share/nonexistent-token');
        $res->assertNotFound()->assertJsonPath('ok', false);
    }
}
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && php artisan test --filter=SelectionShareTest
```

Expected: FAIL — route doesn't exist yet (404 on the first test, but not the expected 404).

- [ ] **Step 3: Add share() method to SelectionController**

Add this method to `backend/app/Http/Controllers/Api/SelectionController.php`, after `stats()`:

```php
/**
 * GET /api/selections/share/{token}
 * Public endpoint — returns a selection by its share_token with enriched player data.
 */
public function share(string $token): JsonResponse
{
    $selection = Selection::where('share_token', $token)->first();

    if (!$selection) {
        return response()->json(['ok' => false, 'message' => 'Selección no encontrada.'], 404);
    }

    $allIds = array_unique(array_merge(
        $selection->squad_players   ?? [],
        $selection->starting_eleven ?? []
    ));

    $positionGroup = [
        'goalkeeper' => 'GK',
        'defender'   => 'DEF',
        'midfielder' => 'MID',
        'forward'    => 'FWD',
    ];
    $positionLabel = [
        'goalkeeper' => 'Portero',
        'defender'   => 'Defensa',
        'midfielder' => 'Mediocampista',
        'forward'    => 'Delantero',
    ];

    $players = \App\Models\Player::with('club')
        ->whereIn('id', $allIds)
        ->get()
        ->keyBy('id')
        ->map(fn ($p) => [
            'id'       => $p->id,
            'name'     => $p->full_name,
            'position' => $positionLabel[$p->position] ?? $p->position,
            'group'    => $positionGroup[$p->position]  ?? 'MID',
            'age'      => $p->age ?? 0,
            'club'     => $p->club?->name ?? '',
            'country'  => $p->nationality ?? '',
        ]);

    return response()->json([
        'ok'              => true,
        'share_token'     => $token,
        'squad_players'   => $selection->squad_players,
        'starting_eleven' => $selection->starting_eleven,
        'formation'       => $selection->formation,
        'players'         => $players,
    ]);
}
```

- [ ] **Step 4: Add route**

In `backend/routes/api.php`, inside the `Route::prefix('selections')` group, add a third route:

```php
Route::prefix('selections')->group(function () {
    Route::post('/',              [SelectionController::class, 'store']);
    Route::get('/stats',          [SelectionController::class, 'stats']);
    Route::get('/share/{token}',  [SelectionController::class, 'share']);
});
```

- [ ] **Step 5: Run tests**

```bash
php artisan test --filter=SelectionShareTest
```

Expected: PASS — both tests green.

- [ ] **Step 6: Run all tests**

```bash
php artisan test
```

Expected: All green.

- [ ] **Step 7: Commit**

```bash
git add backend/app/Http/Controllers/Api/SelectionController.php \
        backend/routes/api.php \
        backend/tests/Feature/SelectionShareTest.php
git commit -m "feat: add public share endpoint GET /api/selections/share/{token}"
```

---

## Task 9: Duel Mode — Frontend

**Files:**
- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/lib/api.ts`
- Create: `frontend/src/app/duelo/[token]/page.tsx`
- Create: `frontend/src/components/layout/DuelClient.tsx`
- Modify: `frontend/src/components/layout/ResultClient.tsx`

- [ ] **Step 1: Add SharedSelectionResponse type**

In `frontend/src/types/index.ts`, add after `StatsResponse`:

```typescript
export interface SharedPlayer {
  id:       number;
  name:     string;
  position: string;
  group:    PlayerGroup;
  age:      number;
  club:     string;
  country:  string;
}

export interface SharedSelectionResponse {
  ok:              boolean;
  share_token:     string;
  squad_players:   number[];
  starting_eleven: number[] | null;
  formation:       FormationName;
  players:         Record<number, SharedPlayer>;
}
```

- [ ] **Step 2: Add getSharedSelection() to api.ts**

In `frontend/src/lib/api.ts`, add after `getStats()`:

```typescript
export async function getSharedSelection(token: string): Promise<SharedSelectionResponse> {
  const { data } = await http.get<SharedSelectionResponse>(`/selections/share/${token}`);
  return data;
}
```

Also add `SharedSelectionResponse` to the import from `@/types`:
```typescript
import { Player, SaveSelectionPayload, StatsResponse, SharedSelectionResponse } from "@/types";
```

- [ ] **Step 3: Create /duelo/[token]/page.tsx (server component)**

Create `frontend/src/app/duelo/[token]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { SharedSelectionResponse } from "@/types";
import DuelClient from "@/components/layout/DuelClient";

interface PageProps {
  params: Promise<{ token: string }>;
}

async function fetchShared(token: string): Promise<SharedSelectionResponse | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
  try {
    const res = await fetch(`${apiUrl}/selections/share/${token}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<SharedSelectionResponse>;
  } catch {
    return null;
  }
}

export default async function DuelPage({ params }: PageProps) {
  const { token } = await params;
  const shared    = await fetchShared(token);

  if (!shared || !shared.ok) notFound();

  return <DuelClient shared={shared} />;
}
```

- [ ] **Step 4: Create DuelClient.tsx**

Create `frontend/src/components/layout/DuelClient.tsx`:

```tsx
"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FORMATIONS } from "@/lib/formations";
import { SharedSelectionResponse } from "@/types";
import { useSelectionStore } from "@/stores/selectionStore";
import { cn } from "@/lib/utils";
import PlayerAvatar from "@/components/ui/PlayerAvatar";
import FieldSVG from "@/components/field/FieldSVG";
import FieldSpot from "@/components/field/FieldSpot";

interface Props {
  shared: SharedSelectionResponse;
}

const fadeUp = {
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] as const },
};

export default function DuelClient({ shared }: Props) {
  const { selectedPlayers, placedMap, formation, playersMap } = useSelectionStore();

  const myFormationDef     = FORMATIONS[formation];
  const sharedFormationDef = FORMATIONS[shared.formation];

  const sharedPlacedMap: Record<string, number> = useMemo(() => {
    if (!shared.starting_eleven) return {};
    const def = FORMATIONS[shared.formation];
    return Object.fromEntries(
      def.positions.map((pos, i) => [pos.slot, shared.starting_eleven![i]])
        .filter(([, id]) => id !== undefined)
    );
  }, [shared]);

  const commonSquad = useMemo(() => {
    const sharedSet = new Set(shared.squad_players);
    return selectedPlayers.filter((id) => sharedSet.has(id));
  }, [selectedPlayers, shared.squad_players]);

  const hasMyLineup     = Object.keys(placedMap).length === 11;
  const hasSharedLineup = (shared.starting_eleven?.length ?? 0) > 0;

  if (selectedPlayers.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center text-center px-4 pt-20">
        <p className="text-[var(--muted)] text-lg mb-4">
          Primero arma tu propia selección para poder comparar.
        </p>
        <Link href="/seleccion">
          <button className="bg-[var(--yellow)] text-black font-bold px-6 py-3 rounded-full">
            Armar mi selección
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-20">
      {/* Header */}
      <div className="text-center pt-28 pb-10 px-4">
        <motion.div {...fadeUp}>
          <span className="inline-flex items-center gap-2 bg-[rgba(252,209,22,0.08)] border border-[var(--border2)] rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--yellow)]">
            Modo Duelo · Colombia 2026
          </span>
          <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] leading-tight mt-3">
            TU <span className="text-[var(--yellow)]">SELECCIÓN</span> VS. <span className="text-[var(--blue)]">AMIGO</span>
          </h1>
          <p className="text-[var(--muted)] text-sm mt-2">
            {commonSquad.length} jugadores en común de {Math.min(selectedPlayers.length, shared.squad_players.length)}
          </p>
        </motion.div>
      </div>

      {/* Side-by-side formations */}
      {hasMyLineup && hasSharedLineup && (
        <div className="max-w-screen-xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {/* My formation */}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="bg-[rgba(252,209,22,0.04)] border border-[var(--border)] rounded-[2rem] p-1.5"
          >
            <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-4">
              <h2 className="font-display text-xl text-[var(--yellow)] tracking-wide mb-3">
                TU 11 · {formation}
              </h2>
              <div className="bg-[rgba(0,48,135,0.06)] border border-[rgba(0,80,200,0.2)] rounded-2xl p-1.5">
                <div className="relative bg-gradient-to-b from-[#0D3B1A] via-[#115827] to-[#0D3B1A] rounded-[calc(1rem-4px)] overflow-hidden" style={{ aspectRatio: "0.68" }}>
                  <FieldSVG />
                  {myFormationDef.positions.map((pos) => (
                    <FieldSpot
                      key={pos.slot}
                      pos={pos}
                      player={placedMap[pos.slot] ? playersMap[placedMap[pos.slot]] : undefined}
                      active={false}
                      onSpotClick={() => {}}
                      onRemove={() => {}}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Friend's formation */}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="bg-[rgba(0,80,200,0.06)] border border-[var(--border)] rounded-[2rem] p-1.5"
          >
            <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-4">
              <h2 className="font-display text-xl text-[var(--blue)] tracking-wide mb-3">
                SU 11 · {shared.formation}
              </h2>
              <div className="bg-[rgba(0,48,135,0.06)] border border-[rgba(0,80,200,0.2)] rounded-2xl p-1.5">
                <div className="relative bg-gradient-to-b from-[#0D3B1A] via-[#115827] to-[#0D3B1A] rounded-[calc(1rem-4px)] overflow-hidden" style={{ aspectRatio: "0.68" }}>
                  <FieldSVG />
                  {sharedFormationDef.positions.map((pos) => {
                    const playerId = sharedPlacedMap[pos.slot];
                    const player   = playerId ? shared.players[playerId] : undefined;
                    return (
                      <FieldSpot
                        key={pos.slot}
                        pos={pos}
                        player={player as any}
                        active={false}
                        onSpotClick={() => {}}
                        onRemove={() => {}}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Common players */}
      {commonSquad.length > 0 && (
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }}
          className="max-w-screen-xl mx-auto px-4 mb-10"
        >
          <div className="bg-[rgba(252,209,22,0.04)] border border-[var(--border)] rounded-[2rem] p-1.5">
            <div className="bg-[var(--card2)] rounded-[calc(2rem-5px)] p-5">
              <h2 className="font-display text-2xl text-[var(--yellow)] tracking-wide mb-4">
                EN COMÚN · {commonSquad.length} JUGADORES
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {commonSquad.map((id) => {
                  const player = playersMap[id];
                  if (!player) return null;
                  return (
                    <div key={id} className="flex items-center gap-2 bg-white/4 rounded-xl px-3 py-2">
                      <PlayerAvatar name={player.name} group={player.group} size="sm" />
                      <span className="text-xs font-semibold truncate">{player.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <div className="max-w-screen-xl mx-auto px-4 flex flex-wrap gap-3 justify-center">
        <Link href="/resultado">
          <button className="bg-[var(--yellow)] text-black font-bold px-8 py-3.5 rounded-full text-sm">
            Ver mi resultado completo
          </button>
        </Link>
        <Link href="/seleccion">
          <button className="border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--border2)] font-semibold px-6 py-3.5 rounded-full text-sm transition-all duration-300">
            Cambiar mi selección
          </button>
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Add "Retar a un amigo" button to ResultClient**

In `frontend/src/components/layout/ResultClient.tsx`:

**Add state** (after `const [showGoal, setShowGoal] = useState(false);`):
```tsx
const [shareToken, setShareToken] = useState<string | null>(null);
const [copied,     setCopied]     = useState(false);
```

**Update handleSave** to capture the token. In the `try` block of `handleSave`, after `setStatus("saved")`:
```tsx
// Store the share token returned by the API
const result = await saveSelection({ ... }); // this already exists
setStatus("saved");
if (result.share_token) setShareToken(result.share_token);
```

Wait — `saveSelection` currently returns `{ ok, message, id }` but now also returns `share_token`. Update the return type in `api.ts`:

In `frontend/src/lib/api.ts`, change `saveSelection` return type:
```typescript
export async function saveSelection(payload: SaveSelectionPayload) {
  const { data } = await http.post("/selections", payload);
  return data as { ok: boolean; message: string; id?: number; share_token?: string };
}
```

Then in `ResultClient.tsx`, capture it:
```tsx
const result = await saveSelection({
  session_id:      getSessionId(),
  squad_players:   selectedPlayers,
  starting_eleven: startingEleven,
  formation,
});
setStatus("saved");
if (result.share_token) setShareToken(result.share_token);
sound.victory();
setShowGoal(true);
getStats().then(setStats).catch(() => null);
```

**Add "Retar a un amigo" button** in the action buttons section, after `ShareImageButton` and before `<Link href="/once">`:

```tsx
{shareToken && (
  <motion.button
    onClick={async () => {
      const url = `${window.location.origin}/duelo/${shareToken}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        window.prompt("Copia este enlace:", url);
      }
    }}
    className="group flex items-center gap-2.5 border border-[var(--blue)]/60 text-[var(--blue)] hover:border-[var(--blue)] font-semibold px-6 py-3.5 rounded-full text-sm transition-all duration-300"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
  >
    {copied ? "¡Enlace copiado!" : "Retar a un amigo"}
  </motion.button>
)}
```

Also add `import { LinkSimple } from "@phosphor-icons/react";` (or use the text-only version above without icon since the icon is optional).

- [ ] **Step 6: Verify duel flow end-to-end**

1. Go to `/seleccion`, pick 23 players.
2. Go to `/once`, place 11 on the field.
3. Go to `/resultado`, click "Guardar mi selección".
4. Once saved, the "Retar a un amigo" button appears. Click it — URL is copied.
5. Open the copied URL (e.g. `http://localhost:3000/duelo/abc-123-...`) in an incognito window.
6. The page should show your shared formation + ask the visitor to build their own.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/types/index.ts \
        frontend/src/lib/api.ts \
        frontend/src/app/duelo/ \
        frontend/src/components/layout/DuelClient.tsx \
        frontend/src/components/layout/ResultClient.tsx
git commit -m "feat: duel mode — shareable link + side-by-side comparison page"
```

---

## Self-Review

### Spec coverage

| Feature | Tasks |
|---------|-------|
| Player detail modal | Task 1 |
| Share as image | Task 2 |
| Formation popularity stats | Tasks 3–4 |
| DT comparison | Tasks 5–6 |
| Duel mode (shareable link + comparison) | Tasks 7–9 |

All 5 features covered. ✓

### Placeholder scan

No "TBD", "TODO", "similar to Task N", or incomplete steps found. All code steps show complete implementations. ✓

### Type consistency

- `SharedSelectionResponse.players` is `Record<number, SharedPlayer>` — used correctly in `DuelClient` as `shared.players[playerId]`.
- `StatsResponse.formation_distribution` added in Task 4, consumed in Task 4 (ResultClient).
- `StatsResponse.dt_squad` added in Task 4 type, backend returns it in Task 3, consumed in Task 6.
- `saveSelection` return type updated in Task 9 Step 5 where `share_token` is first needed.
- `getSharedSelection` added in Task 9 Step 2 but used in the server component `page.tsx` via raw `fetch` (not via this function) — the function is available for future client-side use but not required by this plan. ✓

### Known limitation

`DuelClient` uses `shared.players[playerId] as any` when passing to `FieldSpot` because `FieldSpot` expects a `Player` type and `SharedPlayer` is structurally identical but TypeScript needs the cast. A future cleanup could make `FieldSpot` accept `Player | SharedPlayer` via a union or a shared interface.
