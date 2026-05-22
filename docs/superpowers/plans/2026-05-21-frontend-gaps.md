# Frontend Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar 6 gaps identificados en auditoría del frontend: datos reales de jugadores desde API, endpoint accept-consent, vincular selección al usuario autenticado, redirigir si ya está logueado, botón logout en Navbar, y formularios de creación en el panel admin.

**Architecture:** Backend Laravel 11 (PHP, port 8000) + Frontend Next.js 16 (TypeScript, port 3000). Tests PHP con PHPUnit + SQLite en memoria. State management con Zustand 5. API calls con Axios en `src/lib/api.ts`. Las tareas 1-2 son backend; 3-6 son frontend. Cada tarea es independiente y commiteable por separado.

**Tech Stack:** Laravel 11, Laravel Sanctum, Next.js 16 (App Router), Zustand 5, Axios, TypeScript, Tailwind CSS 4, PHPUnit

---

## File Map

**Backend — modificados:**
- `backend/app/Http/Controllers/Api/AuthController.php` — agrega `acceptConsent()`
- `backend/app/Http/Controllers/Api/SelectionController.php` — agrega `user_id` si hay token
- `backend/routes/api.php` — agrega ruta `POST /api/auth/accept-consent`
- `backend/tests/Feature/AuthTest.php` — agrega 2 tests de consent
- `backend/tests/Feature/SelectionApiTest.php` — nuevo, test selección autenticada

**Frontend — modificados:**
- `frontend/src/lib/api.ts` — agrega `getColombiaPlayers()`
- `frontend/src/stores/selectionStore.ts` — agrega `players`, `playersMap`, `setPlayers`
- `frontend/src/components/player/SelectionClient.tsx` — reemplaza PLAYERS estático por store
- `frontend/src/components/field/LineupClient.tsx` — reemplaza PLAYERS_MAP por store
- `frontend/src/components/layout/ResultClient.tsx` — reemplaza PLAYERS_MAP por store
- `frontend/src/app/(auth)/login/page.tsx` — agrega redirect si ya logueado
- `frontend/src/app/(auth)/register/page.tsx` — agrega redirect si ya logueado
- `frontend/src/components/layout/Navbar.tsx` — agrega user info + logout
- `frontend/src/lib/adminApi.ts` — agrega `createPlayer`, `createClub`, `getFederations`
- `frontend/src/app/admin/players/page.tsx` — agrega modal de creación
- `frontend/src/app/admin/clubs/page.tsx` — agrega modal de creación

---

### Task 1: Backend — endpoint POST /auth/accept-consent

**Files:**
- Modify: `backend/app/Http/Controllers/Api/AuthController.php`
- Modify: `backend/routes/api.php`
- Modify: `backend/tests/Feature/AuthTest.php`

- [ ] **Step 1.1: Escribir los tests que fallarán**

Agrega al final de `backend/tests/Feature/AuthTest.php` (antes del `}`):

```php
    public function test_accept_consent_stores_timestamp(): void
    {
        $user  = User::factory()->withoutConsent()->create();
        $token = $user->createToken('api')->plainTextToken;

        $this->assertNull($user->data_treatment_accepted_at);

        $this->withToken($token)
             ->postJson('/api/auth/accept-consent')
             ->assertOk()
             ->assertJson(['message' => 'Consentimiento registrado.']);

        $this->assertNotNull($user->fresh()->data_treatment_accepted_at);
    }

    public function test_accept_consent_requires_authentication(): void
    {
        $this->postJson('/api/auth/accept-consent')->assertUnauthorized();
    }
```

- [ ] **Step 1.2: Verificar que los tests fallan**

```bash
cd /d/xampp/htdocs/colombia_app/backend
/d/xampp/php/php.exe artisan test --filter="test_accept_consent"
```

Resultado esperado: FAIL (ruta no existe → 404).

- [ ] **Step 1.3: Implementar `acceptConsent()` en AuthController**

En `backend/app/Http/Controllers/Api/AuthController.php`, agrega este método antes del método privado `userData()`:

```php
    public function acceptConsent(Request $request): JsonResponse
    {
        $request->user()->update(['data_treatment_accepted_at' => now()]);

        return response()->json(['message' => 'Consentimiento registrado.']);
    }
```

- [ ] **Step 1.4: Agregar la ruta**

En `backend/routes/api.php`, dentro del bloque `Route::middleware('auth:sanctum')->group(...)` (líneas ~15-18), agrega la nueva ruta:

```php
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout',          [AuthController::class, 'logout']);
        Route::get('me',               [AuthController::class, 'me']);
        Route::post('accept-consent',  [AuthController::class, 'acceptConsent']);
    });
```

- [ ] **Step 1.5: Verificar que los tests pasan**

```bash
/d/xampp/php/php.exe artisan test --filter="test_accept_consent"
```

Resultado esperado: 2 tests PASS.

- [ ] **Step 1.6: Correr suite completa para detectar regresiones**

```bash
/d/xampp/php/php.exe artisan test
```

Resultado esperado: todos los tests pasan (mínimo 56).

- [ ] **Step 1.7: Commit**

```bash
cd /d/xampp/htdocs/colombia_app
git add backend/app/Http/Controllers/Api/AuthController.php backend/routes/api.php backend/tests/Feature/AuthTest.php
git commit -m "feat: add POST /auth/accept-consent endpoint"
```

---

### Task 2: Backend — vincular selección al usuario autenticado

**Files:**
- Modify: `backend/app/Http/Controllers/Api/SelectionController.php`
- Create: `backend/tests/Feature/SelectionApiTest.php`

Contexto: La ruta `POST /api/selections` es pública (no requiere auth). Si el request lleva un Bearer token válido, `auth('sanctum')->id()` lo procesa y devuelve el user id. Si no hay token, devuelve `null` y el guardado sigue siendo anónimo. El campo `user_id` ya existe en la tabla (migración `2026_05_21_200002`).

- [ ] **Step 2.1: Crear el test**

Crea `backend/tests/Feature/SelectionApiTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\Federation;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SelectionApiTest extends TestCase
{
    use RefreshDatabase;

    private function makePayload(array $playerIds): array
    {
        return [
            'session_id'    => 'test-session-' . uniqid(),
            'squad_players' => $playerIds,
            'formation'     => '4-3-3',
        ];
    }

    private function createPlayers(int $count): \Illuminate\Support\Collection
    {
        $fed = Federation::factory()->create(['country_code' => 'COL']);
        return Player::factory($count)->create(['federation_id' => $fed->id]);
    }

    public function test_anonymous_save_sets_no_user_id(): void
    {
        $players = $this->createPlayers(23);

        $this->postJson('/api/selections', $this->makePayload($players->pluck('id')->toArray()))
             ->assertStatus(201);

        $this->assertDatabaseHas('selections', ['user_id' => null]);
    }

    public function test_authenticated_save_links_user_id(): void
    {
        $user    = User::factory()->create();
        $token   = $user->createToken('api')->plainTextToken;
        $players = $this->createPlayers(23);
        $sessionId = 'auth-session-' . uniqid();

        $this->withToken($token)
             ->postJson('/api/selections', array_merge(
                 $this->makePayload($players->pluck('id')->toArray()),
                 ['session_id' => $sessionId]
             ))
             ->assertStatus(201);

        $this->assertDatabaseHas('selections', [
            'session_id' => $sessionId,
            'user_id'    => $user->id,
        ]);
    }
}
```

- [ ] **Step 2.2: Verificar que fallan**

```bash
/d/xampp/php/php.exe artisan test --filter="SelectionApiTest"
```

Resultado esperado: `test_authenticated_save_links_user_id` FAIL (user_id es null).

- [ ] **Step 2.3: Modificar `SelectionController::store()`**

Reemplaza el método `store()` en `backend/app/Http/Controllers/Api/SelectionController.php`:

```php
    public function store(StoreSelectionRequest $request): JsonResponse
    {
        $data   = $request->validated();
        $userId = auth('sanctum')->id();

        $updateData = [
            'squad_players'   => $data['squad_players'],
            'starting_eleven' => $data['starting_eleven'] ?? null,
            'formation'       => $data['formation'],
        ];

        if ($userId) {
            $updateData['user_id'] = $userId;
        }

        $selection = Selection::updateOrCreate(
            ['session_id' => $data['session_id']],
            $updateData
        );

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
            'ok'      => true,
            'message' => '¡Selección guardada con éxito!',
            'id'      => $selection->id,
        ], 201);
    }
```

- [ ] **Step 2.4: Verificar que los tests pasan**

```bash
/d/xampp/php/php.exe artisan test --filter="SelectionApiTest"
```

Resultado esperado: 2 tests PASS.

- [ ] **Step 2.5: Suite completa**

```bash
/d/xampp/php/php.exe artisan test
```

Resultado esperado: todos los tests pasan (mínimo 58).

- [ ] **Step 2.6: Commit**

```bash
cd /d/xampp/htdocs/colombia_app
git add backend/app/Http/Controllers/Api/SelectionController.php backend/tests/Feature/SelectionApiTest.php
git commit -m "feat: link selection to authenticated user when token present"
```

---

### Task 3: Frontend — jugadores desde API real (reemplaza static players.ts)

**Files:**
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/stores/selectionStore.ts`
- Modify: `frontend/src/components/player/SelectionClient.tsx`
- Modify: `frontend/src/components/field/LineupClient.tsx`
- Modify: `frontend/src/components/layout/ResultClient.tsx`

Contexto: `GET /api/federations/COL/players?prelista=1` devuelve `{ data: [...] }` con campos `id`, `full_name`, `position` (en inglés: goalkeeper/defender/midfielder/forward), `age`, `nationality`, `club: { name }`. El frontend usa el tipo `Player` de `src/types/index.ts` con campos `id`, `name`, `position` (label español), `group` (GK/DEF/MID/FWD), `age`, `club`, `country`. Estrategia: `selectionStore` mantiene `players` y `playersMap`, inicializados con los datos estáticos (fallback inmediato) y actualizados desde la API. Los componentes leen del store en vez de importar el archivo estático.

- [ ] **Step 3.1: Agregar `getColombiaPlayers()` a `api.ts`**

Agrega al final de `frontend/src/lib/api.ts` (después de `getStats()`):

```typescript
import { Player } from "@/types";

const POSITION_GROUP: Record<string, Player["group"]> = {
  goalkeeper: "GK",
  defender:   "DEF",
  midfielder: "MID",
  forward:    "FWD",
};

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: "Portero",
  defender:   "Defensa",
  midfielder: "Mediocampista",
  forward:    "Delantero",
};

interface ApiPlayerRaw {
  id:                  number;
  full_name:           string;
  position:            string;
  age:                 number | null;
  nationality:         string | null;
  in_wc_prelista_2026: boolean;
  club:                { name: string } | null;
}

export async function getColombiaPlayers(): Promise<Player[]> {
  const { data } = await http.get<{ data: ApiPlayerRaw[] }>(
    "/federations/COL/players",
    { params: { prelista: 1 } }
  );
  return data.data.map((p) => ({
    id:       p.id,
    name:     p.full_name,
    position: POSITION_LABEL[p.position] ?? p.position,
    group:    POSITION_GROUP[p.position] ?? "MID",
    age:      p.age ?? 0,
    club:     p.club?.name ?? "",
    country:  p.nationality ?? "",
  }));
}
```

**Nota:** El import `import { Player } from "@/types"` ya existe en el archivo porque `SaveSelectionPayload` y `StatsResponse` vienen de ahí. Si TypeScript se queja de import duplicado, combina los imports.

- [ ] **Step 3.2: Agregar estado de jugadores a `selectionStore.ts`**

Reemplaza el contenido completo de `frontend/src/stores/selectionStore.ts`:

```typescript
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FormationName, PlacedPlayersMap, Player } from "@/types";
import { PLAYERS } from "@/lib/players";

interface SelectionState {
  // Dynamic player catalog (starts with static fallback, updated from API)
  players:    Player[];
  playersMap: Record<number, Player>;
  setPlayers: (players: Player[]) => void;

  // Squad of 23
  selectedPlayers: number[];
  addPlayer:       (id: number) => void;
  removePlayer:    (id: number) => void;
  togglePlayer:    (id: number) => boolean;

  // Starting 11
  placedMap:    PlacedPlayersMap;
  formation:    FormationName;
  setFormation: (f: FormationName) => void;
  placeOnSlot:  (slot: string, playerId: number) => void;
  removeFromSlot: (slot: string) => void;
  resetLineup:  () => void;

  // Full reset
  resetAll: () => void;
}

const SQUAD_SIZE = 23;

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set, get) => ({
      // ── Player catalog ────────────────────────────────
      players:    PLAYERS,
      playersMap: Object.fromEntries(PLAYERS.map((p) => [p.id, p])),

      setPlayers: (players) =>
        set({
          players,
          playersMap: Object.fromEntries(players.map((p) => [p.id, p])),
        }),

      // ── Squad of 23 ──────────────────────────────────
      selectedPlayers: [],

      addPlayer: (id) =>
        set((s) => ({
          selectedPlayers:
            s.selectedPlayers.length < SQUAD_SIZE
              ? [...s.selectedPlayers, id]
              : s.selectedPlayers,
        })),

      removePlayer: (id) =>
        set((s) => ({
          selectedPlayers: s.selectedPlayers.filter((x) => x !== id),
          placedMap: Object.fromEntries(
            Object.entries(s.placedMap).filter(([, v]) => v !== id)
          ),
        })),

      togglePlayer: (id) => {
        const { selectedPlayers, addPlayer, removePlayer } = get();
        if (selectedPlayers.includes(id)) {
          removePlayer(id);
          return false;
        }
        if (selectedPlayers.length >= SQUAD_SIZE) return false;
        addPlayer(id);
        return true;
      },

      // ── Starting 11 ──────────────────────────────────
      placedMap: {},
      formation: "4-3-3",

      setFormation: (f) => set({ formation: f, placedMap: {} }),

      placeOnSlot: (slot, playerId) =>
        set((s) => {
          const cleaned = Object.fromEntries(
            Object.entries(s.placedMap).filter(([, v]) => v !== playerId)
          );
          return { placedMap: { ...cleaned, [slot]: playerId } };
        }),

      removeFromSlot: (slot) =>
        set((s) => {
          const next = { ...s.placedMap };
          delete next[slot];
          return { placedMap: next };
        }),

      resetLineup: () => set({ placedMap: {}, formation: "4-3-3" }),

      // ── Full reset ────────────────────────────────────
      resetAll: () =>
        set({ selectedPlayers: [], placedMap: {}, formation: "4-3-3" }),
    }),
    {
      name: "colombia-mundialista-2026",
      partialize: (s) => ({
        selectedPlayers: s.selectedPlayers,
        placedMap:       s.placedMap,
        formation:       s.formation,
        // players y playersMap NO se persisten — vienen de la API en cada sesión
      }),
    }
  )
);
```

- [ ] **Step 3.3: Modificar `SelectionClient.tsx` para usar el store**

Reemplaza el contenido completo de `frontend/src/components/player/SelectionClient.tsx`:

```typescript
"use client";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, SpeakerSlash, SpeakerHigh } from "@phosphor-icons/react";
import { GROUP_LABELS } from "@/lib/players";
import { PlayerGroup } from "@/types";
import { useSelectionStore } from "@/stores/selectionStore";
import { useSound } from "@/hooks/useSound";
import { getColombiaPlayers } from "@/lib/api";
import PlayerCard from "./PlayerCard";
import GoalOverlay from "@/components/ui/GoalOverlay";

const SQUAD_SIZE = 23;
const FILTERS = ["ALL", "GK", "DEF", "MID", "FWD"] as const;
type Filter = (typeof FILTERS)[number];

export default function SelectionClient() {
  const { players, setPlayers, selectedPlayers, togglePlayer } = useSelectionStore();
  const sound = useSound();
  const [filter, setFilter]     = useState<Filter>("ALL");
  const [showGoal, setShowGoal] = useState(false);

  useEffect(() => {
    getColombiaPlayers().then(setPlayers).catch(() => null);
  }, [setPlayers]);

  const count    = selectedPlayers.length;
  const pct      = Math.round((count / SQUAD_SIZE) * 100);
  const complete = count === SQUAD_SIZE;

  const filtered = players.filter(
    (p) => filter === "ALL" || p.group === filter
  );

  const handleToggle = useCallback(
    (id: number) => {
      const isSelected = selectedPlayers.includes(id);

      if (isSelected) {
        togglePlayer(id);
        sound.deselect();
        return;
      }

      if (count >= SQUAD_SIZE) {
        sound.limit();
        return;
      }

      const added = togglePlayer(id);
      if (added) {
        if (count + 1 === SQUAD_SIZE) {
          sound.goal();
          setShowGoal(true);
        } else {
          sound.select();
        }
      }
    },
    [selectedPlayers, count, togglePlayer, sound]
  );

  return (
    <div className="min-h-dvh pb-28">
      {/* ── Sticky counter bar ─────────────────────────── */}
      <div className="sticky top-[4.5rem] z-40 bg-[rgba(5,8,15,0.92)] backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="font-display text-2xl tracking-wide shrink-0">
            <span className="text-[var(--yellow)] text-3xl">{count}</span>
            <span className="text-[var(--muted)]"> / {SQUAD_SIZE}</span>
          </div>
          <div className="flex-1 min-w-[120px] h-1 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--yellow)] to-[var(--red)] rounded-full"
              style={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all duration-250 ${
                  filter === f
                    ? "bg-[var(--yellow)] text-black border-[var(--yellow)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border2)] hover:text-white"
                }`}
              >
                {GROUP_LABELS[f as PlayerGroup | "ALL"]}
              </button>
            ))}
          </div>
          <button
            onClick={sound.toggle}
            className="p-2 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--border2)] transition-all duration-250"
          >
            {sound.muted ? <SpeakerSlash size={16} /> : <SpeakerHigh size={16} />}
          </button>
        </div>
      </div>

      {/* ── Player grid ────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 pt-6">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <span className="inline-flex items-center gap-2 bg-[rgba(252,209,22,0.08)] border border-[var(--border2)] rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--yellow)]">
            Prelista oficial · {players.length} jugadores
          </span>
          <h1 className="font-display text-4xl md:text-5xl mt-2 tracking-wide">
            ELIGE TUS <span className="text-[var(--yellow)]">23</span>
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            Haz clic en cada jugador para seleccionarlo o deseleccionarlo.
          </p>
        </motion.div>

        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
          >
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              >
                <PlayerCard
                  player={p}
                  selected={selectedPlayers.includes(p.id)}
                  disabled={count >= SQUAD_SIZE && !selectedPlayers.includes(p.id)}
                  onToggle={handleToggle}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Sticky bottom save bar ──────────────────────── */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(5,8,15,0.95)] backdrop-blur-xl border-t border-[var(--border)] px-4 py-3"
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
              <p className="text-sm text-[var(--muted)]">
                <strong className="text-[var(--yellow)]">{count}</strong> de {SQUAD_SIZE} seleccionados
              </p>
              {complete && (
                <Link href="/once">
                  <motion.button
                    className="group flex items-center gap-2.5 bg-[var(--yellow)] text-black font-bold px-6 py-2.5 rounded-full text-sm"
                    whileHover={{ scale: 1.03, boxShadow: "0 0 32px rgba(252,209,22,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    Elegir mi 11 ideal
                    <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowRight size={14} weight="bold" />
                    </span>
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GoalOverlay show={showGoal} text="¡23 ELEGIDOS!" onDone={() => setShowGoal(false)} />
    </div>
  );
}
```

- [ ] **Step 3.4: Modificar `LineupClient.tsx` para usar store**

En `frontend/src/components/field/LineupClient.tsx`:

Reemplaza la línea:
```typescript
import { PLAYERS_MAP } from "@/lib/players";
```
Por: *(eliminar esa línea — playersMap vendrá del store)*

En el cuerpo del componente `LineupClient`, dentro del destructuring del store, agrega `playersMap`:
```typescript
  const {
    selectedPlayers, placedMap, formation, playersMap,
    setFormation, placeOnSlot, removeFromSlot,
  } = useSelectionStore();
```

Todas las referencias a `PLAYERS_MAP` ya quedan cubiertas porque `playersMap` tiene la misma firma `Record<number, Player>`.

- [ ] **Step 3.5: Modificar `ResultClient.tsx` para usar store**

En `frontend/src/components/layout/ResultClient.tsx`:

Reemplaza la línea:
```typescript
import { PLAYERS_MAP } from "@/lib/players";
```
Por: *(eliminar)*

En el destructuring del store, agrega `playersMap`:
```typescript
  const { selectedPlayers, placedMap, formation, playersMap, resetAll } = useSelectionStore();
```

Todas las referencias a `PLAYERS_MAP` quedan cubiertas.

- [ ] **Step 3.6: Verificar TypeScript sin errores**

```bash
cd /d/xampp/htdocs/colombia_app/frontend
npx tsc --noEmit
```

Resultado esperado: sin errores.

- [ ] **Step 3.7: Commit**

```bash
cd /d/xampp/htdocs/colombia_app
git add frontend/src/lib/api.ts frontend/src/stores/selectionStore.ts frontend/src/components/player/SelectionClient.tsx frontend/src/components/field/LineupClient.tsx frontend/src/components/layout/ResultClient.tsx
git commit -m "feat: load Colombia prelista players from API instead of static file"
```

---

### Task 4: Frontend — redirigir a / si ya está logueado al ir a /login o /register

**Files:**
- Modify: `frontend/src/app/(auth)/login/page.tsx`
- Modify: `frontend/src/app/(auth)/register/page.tsx`

- [ ] **Step 4.1: Agregar redirect en `login/page.tsx`**

En `frontend/src/app/(auth)/login/page.tsx`, agrega el import del authStore (ya existe) y agrega este `useEffect` al principio del componente, justo después de las declaraciones de estado existentes:

```typescript
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) router.replace("/");
  }, [token, router]);
```

El import de `useAuthStore` ya existe. El import de `useEffect` ya existe. Solo agrega las dos líneas dentro del componente.

- [ ] **Step 4.2: Agregar redirect en `register/page.tsx`**

En `frontend/src/app/(auth)/register/page.tsx`, de la misma forma, agrega después de `const router = useRouter()`:

```typescript
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) router.replace("/");
  }, [token, router]);
```

El import de `useAuthStore` ya existe. El import de `useEffect` ya existe.

- [ ] **Step 4.3: Verificar TypeScript**

```bash
cd /d/xampp/htdocs/colombia_app/frontend
npx tsc --noEmit
```

- [ ] **Step 4.4: Commit**

```bash
cd /d/xampp/htdocs/colombia_app
git add "frontend/src/app/(auth)/login/page.tsx" "frontend/src/app/(auth)/register/page.tsx"
git commit -m "feat: redirect to home if user is already authenticated"
```

---

### Task 5: Frontend — botón logout + user info en Navbar principal

**Files:**
- Modify: `frontend/src/components/layout/Navbar.tsx`

Contexto: El Navbar actual es client component (`"use client"`). Tiene un pill flotante con logo, steps de navegación y puntos móviles. Añadimos: si hay usuario logueado, mostrar sus iniciales/nombre y un botón de cerrar sesión al lado derecho del pill. Si no hay usuario, mostrar un enlace a `/login`.

- [ ] **Step 5.1: Reemplazar `Navbar.tsx`**

Reemplaza el contenido completo de `frontend/src/components/layout/Navbar.tsx`:

```typescript
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { logout } from "@/lib/api";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "/",          label: "Inicio"   },
  { href: "/seleccion", label: "Mis 23"   },
  { href: "/once",      label: "11 Ideal" },
  { href: "/resultado", label: "Resultado"},
];

export default function Navbar() {
  const pathname         = usePathname();
  const router           = useRouter();
  const { user, clear }  = useAuthStore();

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    clear();
    router.push("/");
  }

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl">
      <div className="bg-[rgba(5,8,15,0.8)] backdrop-blur-2xl border border-[var(--border)] rounded-full px-3 py-2 flex items-center justify-between gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl tracking-widest text-[var(--yellow)] hover:opacity-80 transition-opacity duration-300 pl-1 flex items-center gap-1.5 shrink-0"
        >
          🇨🇴 <span className="text-white/80">COL</span>2026
        </Link>

        {/* Steps — desktop */}
        <nav className="hidden sm:flex items-center gap-1">
          {STEPS.map((s) => {
            const active = pathname === s.href;
            return (
              <Link
                key={s.href}
                href={s.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300",
                  active
                    ? "bg-[rgba(252,209,22,0.12)] text-[var(--yellow)]"
                    : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                    active ? "bg-[var(--yellow)]" : "bg-[var(--muted)]"
                  )}
                />
                {s.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile dots */}
        <div className="sm:hidden flex gap-1.5">
          {STEPS.map((s) => (
            <Link key={s.href} href={s.href}>
              <span
                className={cn(
                  "block w-1.5 h-1.5 rounded-full transition-colors duration-300",
                  pathname === s.href ? "bg-[var(--yellow)]" : "bg-[var(--muted)]"
                )}
              />
            </Link>
          ))}
        </div>

        {/* Auth — desktop */}
        <div className="hidden sm:flex items-center gap-1 pr-1 shrink-0">
          {user ? (
            <>
              <span className="text-[11px] text-[var(--muted)] max-w-[7rem] truncate">
                {user.name.split(" ")[0]}
              </span>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="px-2 py-1 rounded-full text-[11px] font-bold text-[var(--yellow)] hover:bg-[rgba(252,209,22,0.08)] transition-all"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-2 py-1 rounded-full text-[11px] text-[var(--muted)] hover:text-white hover:bg-white/5 transition-all"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--border2)] transition-all"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5.2: Verificar TypeScript**

```bash
cd /d/xampp/htdocs/colombia_app/frontend
npx tsc --noEmit
```

- [ ] **Step 5.3: Commit**

```bash
cd /d/xampp/htdocs/colombia_app
git add frontend/src/components/layout/Navbar.tsx
git commit -m "feat: show user info and logout button in Navbar"
```

---

### Task 6: Frontend — formularios de creación en panel admin

**Files:**
- Modify: `frontend/src/lib/adminApi.ts`
- Modify: `frontend/src/app/admin/players/page.tsx`
- Modify: `frontend/src/app/admin/clubs/page.tsx`

- [ ] **Step 6.1: Extender `adminApi.ts`**

Reemplaza el contenido completo de `frontend/src/lib/adminApi.ts`:

```typescript
import { http } from "@/lib/api";

export interface AdminPlayer {
  id:                  number;
  full_name:           string;
  first_name:          string;
  last_name:           string;
  position:            string;
  jersey_number:       number | null;
  in_wc_prelista_2026: boolean;
  active:              boolean;
  federation_id:       number;
  club_id:             number | null;
}

export interface AdminClub {
  id:           number;
  name:         string;
  short_name:   string | null;
  country:      string | null;
  country_code: string | null;
  city:         string | null;
  league_name:  string | null;
}

export interface AdminFederation {
  id:           number;
  country:      string;
  country_code: string;
  short_name:   string;
}

export const adminApi = {
  // Players
  getPlayers: () =>
    http.get<AdminPlayer[]>("/admin/players").then((r) => r.data),
  createPlayer: (data: {
    federation_id: number;
    first_name:    string;
    last_name:     string;
    position:      string;
    jersey_number?: number | null;
    active?:       boolean;
    in_wc_prelista_2026?: boolean;
  }) =>
    http.post<AdminPlayer>("/admin/players", data).then((r) => r.data),
  updatePlayer: (id: number, data: Partial<AdminPlayer>) =>
    http.put<AdminPlayer>(`/admin/players/${id}`, data).then((r) => r.data),
  deletePlayer: (id: number) => http.delete(`/admin/players/${id}`),

  // Clubs
  getClubs: () =>
    http.get<AdminClub[]>("/admin/clubs").then((r) => r.data),
  createClub: (data: {
    name:         string;
    short_name?:  string | null;
    country?:     string | null;
    country_code?: string | null;
    city?:        string | null;
    league_name?: string | null;
  }) =>
    http.post<AdminClub>("/admin/clubs", data).then((r) => r.data),
  updateClub: (id: number, data: Partial<AdminClub>) =>
    http.put<AdminClub>(`/admin/clubs/${id}`, data).then((r) => r.data),
  deleteClub: (id: number) => http.delete(`/admin/clubs/${id}`),

  // Federations (para el select al crear jugadores)
  getFederations: () =>
    http
      .get<{ data: AdminFederation[] }>("/federations")
      .then((r) => r.data.data),
};
```

- [ ] **Step 6.2: Reemplazar `admin/players/page.tsx` con modal de creación**

Reemplaza el contenido completo de `frontend/src/app/admin/players/page.tsx`:

```typescript
"use client";
import { useEffect, useState } from "react";
import { adminApi, AdminPlayer, AdminFederation } from "@/lib/adminApi";

const POSITIONS = [
  { value: "goalkeeper",  label: "Portero"         },
  { value: "defender",    label: "Defensa"          },
  { value: "midfielder",  label: "Mediocampista"    },
  { value: "forward",     label: "Delantero"        },
];

export default function AdminPlayersPage() {
  const [players, setPlayers]       = useState<AdminPlayer[]>([]);
  const [federations, setFederations] = useState<AdminFederation[]>([]);
  const [loading, setLoading]       = useState(true);
  const [editing, setEditing]       = useState<AdminPlayer | null>(null);
  const [creating, setCreating]     = useState(false);
  const [saving, setSaving]         = useState(false);

  const [newForm, setNewForm] = useState({
    federation_id: 0,
    first_name:    "",
    last_name:     "",
    position:      "midfielder",
    jersey_number: "" as string | number,
  });

  useEffect(() => {
    Promise.all([
      adminApi.getPlayers(),
      adminApi.getFederations(),
    ]).then(([p, f]) => {
      setPlayers(p);
      setFederations(f);
      if (f.length > 0) setNewForm((prev) => ({ ...prev, federation_id: f[0].id }));
    }).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar jugador?")) return;
    await adminApi.deletePlayer(id);
    setPlayers((p) => p.filter((x) => x.id !== id));
  }

  async function handleUpdate() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await adminApi.updatePlayer(editing.id, {
        jersey_number:       editing.jersey_number,
        active:              editing.active,
        in_wc_prelista_2026: editing.in_wc_prelista_2026,
      });
      setPlayers((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    if (!newForm.first_name.trim() || !newForm.last_name.trim()) return;
    setSaving(true);
    try {
      const created = await adminApi.createPlayer({
        federation_id: newForm.federation_id,
        first_name:    newForm.first_name.trim(),
        last_name:     newForm.last_name.trim(),
        position:      newForm.position,
        jersey_number: newForm.jersey_number ? Number(newForm.jersey_number) : null,
        active:        true,
        in_wc_prelista_2026: true,
      });
      setPlayers((p) => [...p, created]);
      setCreating(false);
      setNewForm((f) => ({ ...f, first_name: "", last_name: "", jersey_number: "" }));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-500">Cargando jugadores…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-[#001e62]">Jugadores</h1>
        <button
          onClick={() => setCreating(true)}
          className="bg-[#001e62] text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-900 transition"
        >
          + Nuevo jugador
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-[#001e62] text-white">
            <tr>
              {["#", "Nombre", "Posición", "Camiseta", "Prelista", "Activo", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={p.id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                <td className="px-4 py-2 font-medium">{p.full_name}</td>
                <td className="px-4 py-2 text-gray-600 capitalize">{p.position}</td>
                <td className="px-4 py-2">{p.jersey_number ?? "—"}</td>
                <td className="px-4 py-2">{p.in_wc_prelista_2026 ? "✓" : "—"}</td>
                <td className="px-4 py-2">{p.active ? "✓" : "—"}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => setEditing(p)} className="text-[#001e62] hover:underline text-xs">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal editar */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#001e62]">
              Editar: {editing.full_name}
            </h2>
            <div>
              <label className="block text-sm font-medium mb-1">Número de camiseta</label>
              <input
                type="number" min={1} max={99}
                value={editing.jersey_number ?? ""}
                onChange={(e) => setEditing({ ...editing, jersey_number: e.target.value ? Number(e.target.value) : null })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.in_wc_prelista_2026}
                onChange={(e) => setEditing({ ...editing, in_wc_prelista_2026: e.target.checked })}
                className="accent-[#001e62]" />
              En prelista 2026
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                className="accent-[#001e62]" />
              Activo
            </label>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="text-sm text-gray-500 hover:underline">Cancelar</button>
              <button onClick={handleUpdate} disabled={saving}
                className="bg-[#ffd100] text-[#001e62] font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 disabled:opacity-50">
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear */}
      {creating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#001e62]">Nuevo jugador</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Federación</label>
              <select
                value={newForm.federation_id}
                onChange={(e) => setNewForm({ ...newForm, federation_id: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {federations.map((f) => (
                  <option key={f.id} value={f.id}>{f.country} ({f.country_code})</option>
                ))}
              </select>
            </div>
            {[
              { label: "Nombre",   key: "first_name" },
              { label: "Apellido", key: "last_name"  },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input type="text"
                  value={newForm[key as "first_name" | "last_name"]}
                  onChange={(e) => setNewForm({ ...newForm, [key]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1">Posición</label>
              <select value={newForm.position}
                onChange={(e) => setNewForm({ ...newForm, position: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Camiseta (opcional)</label>
              <input type="number" min={1} max={99}
                value={newForm.jersey_number}
                onChange={(e) => setNewForm({ ...newForm, jersey_number: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCreating(false)} className="text-sm text-gray-500 hover:underline">Cancelar</button>
              <button onClick={handleCreate} disabled={saving || !newForm.first_name.trim() || !newForm.last_name.trim()}
                className="bg-[#ffd100] text-[#001e62] font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 disabled:opacity-50">
                {saving ? "Creando…" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6.3: Reemplazar `admin/clubs/page.tsx` con modal de creación**

Reemplaza el contenido completo de `frontend/src/app/admin/clubs/page.tsx`:

```typescript
"use client";
import { useEffect, useState } from "react";
import { adminApi, AdminClub } from "@/lib/adminApi";

export default function AdminClubsPage() {
  const [clubs, setClubs]     = useState<AdminClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminClub | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving]   = useState(false);

  const [newForm, setNewForm] = useState({
    name: "", short_name: "", country: "", country_code: "", city: "", league_name: "",
  });

  useEffect(() => {
    adminApi.getClubs().then(setClubs).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar club?")) return;
    await adminApi.deleteClub(id);
    setClubs((c) => c.filter((x) => x.id !== id));
  }

  async function handleUpdate() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateClub(editing.id, {
        name: editing.name, short_name: editing.short_name,
        city: editing.city, league_name: editing.league_name,
      });
      setClubs((c) => c.map((x) => (x.id === updated.id ? updated : x)));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    if (!newForm.name.trim()) return;
    setSaving(true);
    try {
      const created = await adminApi.createClub({
        name:         newForm.name.trim(),
        short_name:   newForm.short_name || null,
        country:      newForm.country    || null,
        country_code: newForm.country_code || null,
        city:         newForm.city       || null,
        league_name:  newForm.league_name || null,
      });
      setClubs((c) => [...c, created]);
      setCreating(false);
      setNewForm({ name: "", short_name: "", country: "", country_code: "", city: "", league_name: "" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-500">Cargando clubes…</p>;

  const editFields = [
    { label: "Nombre",      key: "name"        },
    { label: "Abreviatura", key: "short_name"  },
    { label: "Ciudad",      key: "city"        },
    { label: "Liga",        key: "league_name" },
  ] as const;

  const createFields = [
    { label: "Nombre *",      key: "name"         },
    { label: "Abreviatura",   key: "short_name"   },
    { label: "País",          key: "country"      },
    { label: "Código país",   key: "country_code" },
    { label: "Ciudad",        key: "city"         },
    { label: "Liga",          key: "league_name"  },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-[#001e62]">Clubes</h1>
        <button
          onClick={() => setCreating(true)}
          className="bg-[#001e62] text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-900 transition"
        >
          + Nuevo club
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-[#001e62] text-white">
            <tr>
              {["Nombre", "Abrev.", "País", "Ciudad", "Liga", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clubs.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2 text-gray-600">{c.short_name ?? "—"}</td>
                <td className="px-4 py-2">{c.country ?? "—"}</td>
                <td className="px-4 py-2">{c.city ?? "—"}</td>
                <td className="px-4 py-2">{c.league_name ?? "—"}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => setEditing(c)} className="text-[#001e62] hover:underline text-xs">Editar</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal editar */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#001e62]">Editar club</h2>
            {editFields.map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input type="text"
                  value={(editing[key] as string) ?? ""}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value || null })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="text-sm text-gray-500 hover:underline">Cancelar</button>
              <button onClick={handleUpdate} disabled={saving}
                className="bg-[#ffd100] text-[#001e62] font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 disabled:opacity-50">
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear */}
      {creating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#001e62]">Nuevo club</h2>
            {createFields.map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input type="text"
                  value={newForm[key]}
                  onChange={(e) => setNewForm({ ...newForm, [key]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCreating(false)} className="text-sm text-gray-500 hover:underline">Cancelar</button>
              <button onClick={handleCreate} disabled={saving || !newForm.name.trim()}
                className="bg-[#ffd100] text-[#001e62] font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 disabled:opacity-50">
                {saving ? "Creando…" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6.4: Verificar TypeScript**

```bash
cd /d/xampp/htdocs/colombia_app/frontend
npx tsc --noEmit
```

Resultado esperado: sin errores.

- [ ] **Step 6.5: Commit**

```bash
cd /d/xampp/htdocs/colombia_app
git add frontend/src/lib/adminApi.ts frontend/src/app/admin/players/page.tsx frontend/src/app/admin/clubs/page.tsx
git commit -m "feat: add create player/club forms in admin panel"
```

---

## Self-Review

**1. Spec coverage:**
- ✓ Task 1: endpoint `POST /auth/accept-consent`
- ✓ Task 2: `user_id` en selección autenticada
- ✓ Task 3: jugadores desde `GET /federations/COL/players?prelista=1`
- ✓ Task 4: redirect `/login` y `/register` si ya logueado
- ✓ Task 5: logout + user info en Navbar
- ✓ Task 6: create player + create club en admin

**2. Placeholder scan:** Sin TBD, sin TODOs, todo el código está escrito.

**3. Type consistency:**
- `AdminFederation` definido en Task 6.1, usado en 6.2 — ✓
- `playersMap: Record<number, Player>` en store — misma firma que `PLAYERS_MAP` anterior — ✓
- `getColombiaPlayers()` retorna `Player[]` — misma interfaz usada en store y componentes — ✓
- `acceptConsent()` referenciada en route y en callback page ya existente — ✓
