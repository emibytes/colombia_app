# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Prerequisite:** Plan `2026-05-21-auth-system.md` must be completed first. This plan assumes `User.isAdmin()`, `AdminMiddleware`, `auth:sanctum`, and the `admin` middleware alias are all in place.

**Goal:** Panel administrativo en `/admin` (Next.js) con CRUD completo de jugadores y clubes, protegido por rol admin, conectado a un grupo de rutas `/api/admin/*` en Laravel.

**Architecture:** Laravel Resource Controllers bajo `Api\Admin\` namespace, protegidos con `['auth:sanctum', 'admin']`. Frontend en `app/admin/` con layout protegido y tablas con modales inline para crear/editar. Separación total del flujo de usuario anónimo.

**Tech Stack:** Laravel 11, PHPUnit (SQLite), Next.js 16 App Router, Tailwind CSS, axios

---

## Mapa de archivos

### Backend
| Acción | Archivo |
|--------|---------|
| Crear | `backend/app/Http/Requests/Admin/PlayerRequest.php` |
| Crear | `backend/app/Http/Requests/Admin/ClubRequest.php` |
| Crear | `backend/app/Http/Controllers/Api/Admin/PlayerController.php` |
| Crear | `backend/app/Http/Controllers/Api/Admin/ClubController.php` |
| Modificar | `backend/routes/api.php` |
| Crear | `backend/tests/Feature/Admin/PlayerAdminTest.php` |
| Crear | `backend/tests/Feature/Admin/ClubAdminTest.php` |

### Frontend
| Acción | Archivo |
|--------|---------|
| Crear | `frontend/src/lib/adminApi.ts` |
| Crear | `frontend/src/app/admin/layout.tsx` |
| Crear | `frontend/src/app/admin/page.tsx` |
| Crear | `frontend/src/app/admin/players/page.tsx` |
| Crear | `frontend/src/app/admin/clubs/page.tsx` |

---

## Task 1: Admin\PlayerController (CRUD) + tests

**Files:**
- Create: `backend/app/Http/Requests/Admin/PlayerRequest.php`
- Create: `backend/app/Http/Controllers/Api/Admin/PlayerController.php`
- Create: `backend/tests/Feature/Admin/PlayerAdminTest.php`

- [ ] **Step 1.1 — Escribir el test**

```php
<?php
// backend/tests/Feature/Admin/PlayerAdminTest.php

namespace Tests\Feature\Admin;

use App\Models\Club;
use App\Models\Federation;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayerAdminTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        return User::factory()->admin()->create()->createToken('spa')->plainTextToken;
    }

    private function userToken(): string
    {
        return User::factory()->create()->createToken('spa')->plainTextToken;
    }

    // ── Access control ─────────────────────────────────────────────────────

    public function test_unauthenticated_cannot_access_admin_players(): void
    {
        $this->getJson('/api/admin/players')->assertStatus(401);
    }

    public function test_regular_user_cannot_access_admin_players(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->userToken())
             ->getJson('/api/admin/players')
             ->assertStatus(403);
    }

    // ── index ──────────────────────────────────────────────────────────────

    public function test_admin_can_list_players(): void
    {
        Player::factory()->count(5)->create();

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->getJson('/api/admin/players')
             ->assertOk()
             ->assertJsonCount(5, 'data')
             ->assertJsonStructure(['data' => [['id', 'full_name', 'position', 'active']]]);
    }

    public function test_admin_can_filter_players_by_position(): void
    {
        Player::factory()->count(3)->goalkeeper()->create();
        Player::factory()->count(2)->defender()->create();

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->getJson('/api/admin/players?position=goalkeeper')
             ->assertOk()
             ->assertJsonCount(3, 'data');
    }

    // ── store ──────────────────────────────────────────────────────────────

    public function test_admin_can_create_player(): void
    {
        $fed  = Federation::factory()->create();
        $club = Club::factory()->create();

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->postJson('/api/admin/players', [
                 'federation_id'  => $fed->id,
                 'club_id'        => $club->id,
                 'first_name'     => 'Luis',
                 'last_name'      => 'Díaz',
                 'full_name'      => 'Luis Díaz',
                 'slug'           => 'luis-diaz-99',
                 'position'       => 'forward',
                 'nationality'    => 'Colombia',
                 'date_of_birth'  => '1997-01-13',
                 'strong_foot'    => 'left',
                 'active'         => true,
             ])
             ->assertStatus(201)
             ->assertJsonPath('data.slug', 'luis-diaz-99');

        $this->assertDatabaseHas('players', ['slug' => 'luis-diaz-99']);
    }

    public function test_store_requires_mandatory_fields(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->postJson('/api/admin/players', [])
             ->assertStatus(422)
             ->assertJsonValidationErrors(['federation_id', 'first_name', 'last_name', 'full_name', 'slug', 'position', 'nationality', 'date_of_birth', 'strong_foot']);
    }

    public function test_store_rejects_duplicate_slug(): void
    {
        Player::factory()->create(['slug' => 'existing-slug-1']);

        $fed = Federation::factory()->create();
        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->postJson('/api/admin/players', [
                 'federation_id' => $fed->id,
                 'first_name'    => 'Test',
                 'last_name'     => 'Player',
                 'full_name'     => 'Test Player',
                 'slug'          => 'existing-slug-1',
                 'position'      => 'defender',
                 'nationality'   => 'Colombia',
                 'date_of_birth' => '1990-01-01',
                 'strong_foot'   => 'right',
                 'active'        => true,
             ])
             ->assertStatus(422)
             ->assertJsonValidationErrors(['slug']);
    }

    // ── update ─────────────────────────────────────────────────────────────

    public function test_admin_can_update_player(): void
    {
        $player = Player::factory()->create(['jersey_number' => null]);

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->putJson("/api/admin/players/{$player->id}", [
                 'federation_id'  => $player->federation_id,
                 'first_name'     => $player->first_name,
                 'last_name'      => $player->last_name,
                 'full_name'      => $player->full_name,
                 'slug'           => $player->slug,
                 'position'       => $player->position,
                 'nationality'    => $player->nationality,
                 'date_of_birth'  => $player->date_of_birth->format('Y-m-d'),
                 'strong_foot'    => $player->strong_foot,
                 'active'         => $player->active,
                 'jersey_number'  => 7,
             ])
             ->assertOk()
             ->assertJsonPath('data.jersey_number', 7);

        $this->assertEquals(7, $player->fresh()->jersey_number);
    }

    public function test_update_returns_404_for_unknown_player(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->putJson('/api/admin/players/9999', ['first_name' => 'X'])
             ->assertNotFound();
    }

    // ── destroy ────────────────────────────────────────────────────────────

    public function test_admin_can_delete_player(): void
    {
        $player = Player::factory()->create();

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->deleteJson("/api/admin/players/{$player->id}")
             ->assertNoContent();

        $this->assertDatabaseMissing('players', ['id' => $player->id]);
    }

    public function test_delete_returns_404_for_unknown_player(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->deleteJson('/api/admin/players/9999')
             ->assertNotFound();
    }
}
```

- [ ] **Step 1.2 — Correr test para confirmar que falla**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/Admin/PlayerAdminTest.php
```

Salida esperada: FAIL — rutas no existen.

- [ ] **Step 1.3 — Crear PlayerRequest**

```php
<?php
// backend/app/Http/Requests/Admin/PlayerRequest.php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PlayerRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $playerId = $this->route('player')?->id ?? 'NULL';

        return [
            'federation_id'       => ['required', 'exists:federations,id'],
            'club_id'             => ['nullable', 'exists:clubs,id'],
            'first_name'          => ['required', 'string', 'max:100'],
            'last_name'           => ['required', 'string', 'max:100'],
            'full_name'           => ['required', 'string', 'max:200'],
            'slug'                => ['required', 'string', 'max:220', "unique:players,slug,{$playerId}"],
            'photo_url'           => ['nullable', 'string', 'max:500'],
            'position'            => ['required', 'in:goalkeeper,defender,midfielder,forward'],
            'jersey_number'       => ['nullable', 'integer', 'min:1', 'max:99'],
            'date_of_birth'       => ['required', 'date'],
            'place_of_birth'      => ['nullable', 'string', 'max:200'],
            'nationality'         => ['required', 'string', 'max:100'],
            'height_cm'           => ['nullable', 'integer', 'min:140', 'max:220'],
            'weight_kg'           => ['nullable', 'integer', 'min:40', 'max:150'],
            'international_caps'  => ['nullable', 'integer', 'min:0'],
            'international_goals' => ['nullable', 'integer', 'min:0'],
            'strong_foot'         => ['required', 'in:left,right'],
            'active'              => ['required', 'boolean'],
            'in_wc_prelista_2026' => ['boolean'],
        ];
    }
}
```

- [ ] **Step 1.4 — Crear Admin\PlayerController**

```php
<?php
// backend/app/Http/Controllers/Api/Admin/PlayerController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PlayerRequest;
use App\Http\Resources\PlayerResource;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PlayerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $players = Player::with(['club', 'federation'])
            ->when($request->position, fn ($q, $v) => $q->where('position', $v))
            ->when($request->search, fn ($q, $v) =>
                $q->where('full_name', 'like', "%{$v}%")
            )
            ->when($request->boolean('prelista'), fn ($q) => $q->where('in_wc_prelista_2026', true))
            ->orderByRaw("
                CASE position
                    WHEN 'goalkeeper' THEN 1
                    WHEN 'defender'   THEN 2
                    WHEN 'midfielder' THEN 3
                    WHEN 'forward'    THEN 4
                END
            ")
            ->orderBy('last_name')
            ->get();

        return response()->json(['data' => PlayerResource::collection($players)]);
    }

    public function store(PlayerRequest $request): JsonResponse
    {
        $player = Player::create($request->validated());

        return response()->json(
            ['data' => new PlayerResource($player->load(['club', 'federation']))],
            201
        );
    }

    public function update(PlayerRequest $request, Player $player): JsonResponse
    {
        $player->update($request->validated());

        return response()->json(['data' => new PlayerResource($player->load(['club', 'federation']))]);
    }

    public function destroy(Player $player): Response
    {
        $player->delete();

        return response()->noContent();
    }
}
```

- [ ] **Step 1.5 — Añadir rutas admin en api.php**

Añadir al final de `backend/routes/api.php`:

```php
use App\Http\Controllers\Api\Admin\PlayerController as AdminPlayerController;
use App\Http\Controllers\Api\Admin\ClubController as AdminClubController;

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::apiResource('players', AdminPlayerController::class)->except(['show']);
    Route::apiResource('clubs',   AdminClubController::class)->except(['show']);
});
```

> `apiResource` registra: GET index, POST store, PUT/PATCH update, DELETE destroy. Se omite `show` porque los recursos públicos ya tienen sus propias rutas.

- [ ] **Step 1.6 — Correr tests**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/Admin/PlayerAdminTest.php
```

Salida esperada: todos PASS.

- [ ] **Step 1.7 — Commit**

```bash
git add backend/app/Http/Requests/Admin/PlayerRequest.php backend/app/Http/Controllers/Api/Admin/PlayerController.php backend/routes/api.php backend/tests/Feature/Admin/PlayerAdminTest.php
git commit -m "feat: Admin\PlayerController CRUD with auth:sanctum + admin middleware"
```

---

## Task 2: Admin\ClubController (CRUD) + tests

**Files:**
- Create: `backend/app/Http/Requests/Admin/ClubRequest.php`
- Create: `backend/app/Http/Controllers/Api/Admin/ClubController.php`
- Create: `backend/tests/Feature/Admin/ClubAdminTest.php`

- [ ] **Step 2.1 — Escribir el test**

```php
<?php
// backend/tests/Feature/Admin/ClubAdminTest.php

namespace Tests\Feature\Admin;

use App\Models\Club;
use App\Models\Federation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClubAdminTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        return User::factory()->admin()->create()->createToken('spa')->plainTextToken;
    }

    public function test_unauthenticated_cannot_access_admin_clubs(): void
    {
        $this->getJson('/api/admin/clubs')->assertStatus(401);
    }

    public function test_regular_user_cannot_access_admin_clubs(): void
    {
        $token = User::factory()->create()->createToken('spa')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
             ->getJson('/api/admin/clubs')
             ->assertStatus(403);
    }

    public function test_admin_can_list_clubs(): void
    {
        Club::factory()->count(4)->create();

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->getJson('/api/admin/clubs')
             ->assertOk()
             ->assertJsonCount(4, 'data');
    }

    public function test_admin_can_create_club(): void
    {
        $fed = Federation::factory()->create();

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->postJson('/api/admin/clubs', [
                 'federation_id'    => $fed->id,
                 'name'             => 'Atlético Nacional',
                 'short_name'       => 'Nacional',
                 'country'          => 'Colombia',
                 'country_code'     => 'COL',
                 'city'             => 'Medellín',
                 'stadium_name'     => 'Estadio Atanasio Girardot',
                 'stadium_capacity' => 45943,
                 'founded_year'     => 1947,
                 'league_name'      => 'Liga BetPlay',
             ])
             ->assertStatus(201)
             ->assertJsonPath('data.name', 'Atlético Nacional');

        $this->assertDatabaseHas('clubs', ['name' => 'Atlético Nacional']);
    }

    public function test_store_requires_mandatory_fields(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->postJson('/api/admin/clubs', [])
             ->assertStatus(422)
             ->assertJsonValidationErrors(['name', 'country', 'country_code', 'city']);
    }

    public function test_admin_can_update_club(): void
    {
        $club = Club::factory()->create(['stadium_capacity' => 30000]);

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->putJson("/api/admin/clubs/{$club->id}", [
                 'name'             => $club->name,
                 'country'          => $club->country,
                 'country_code'     => $club->country_code,
                 'city'             => $club->city,
                 'stadium_capacity' => 50000,
             ])
             ->assertOk()
             ->assertJsonPath('data.stadium_capacity', 50000);

        $this->assertEquals(50000, $club->fresh()->stadium_capacity);
    }

    public function test_admin_can_delete_club(): void
    {
        $club = Club::factory()->create();

        $this->withHeader('Authorization', 'Bearer ' . $this->adminToken())
             ->deleteJson("/api/admin/clubs/{$club->id}")
             ->assertNoContent();

        $this->assertDatabaseMissing('clubs', ['id' => $club->id]);
    }
}
```

- [ ] **Step 2.2 — Correr test para confirmar que falla**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/Admin/ClubAdminTest.php
```

Salida esperada: FAIL — ClubController no existe.

- [ ] **Step 2.3 — Crear ClubRequest**

```php
<?php
// backend/app/Http/Requests/Admin/ClubRequest.php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ClubRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'federation_id'    => ['nullable', 'exists:federations,id'],
            'name'             => ['required', 'string', 'max:200'],
            'short_name'       => ['nullable', 'string', 'max:50'],
            'country'          => ['required', 'string', 'max:100'],
            'country_code'     => ['required', 'string', 'size:3'],
            'city'             => ['required', 'string', 'max:100'],
            'stadium_name'     => ['nullable', 'string', 'max:200'],
            'stadium_capacity' => ['nullable', 'integer', 'min:0'],
            'founded_year'     => ['nullable', 'integer', 'min:1800', 'max:2025'],
            'league_name'      => ['nullable', 'string', 'max:200'],
            'logo_url'         => ['nullable', 'string', 'max:500'],
            'website'          => ['nullable', 'url', 'max:500'],
            'latitude'         => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'        => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }
}
```

- [ ] **Step 2.4 — Crear Admin\ClubController**

```php
<?php
// backend/app/Http/Controllers/Api/Admin/ClubController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ClubRequest;
use App\Http\Resources\ClubResource;
use App\Models\Club;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ClubController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $clubs = Club::with('federation')
            ->when($request->country_code, fn ($q, $v) => $q->where('country_code', strtoupper($v)))
            ->when($request->search, fn ($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->orderBy('name')
            ->get();

        return response()->json(['data' => ClubResource::collection($clubs)]);
    }

    public function store(ClubRequest $request): JsonResponse
    {
        $club = Club::create($request->validated());

        return response()->json(
            ['data' => new ClubResource($club->load('federation'))],
            201
        );
    }

    public function update(ClubRequest $request, Club $club): JsonResponse
    {
        $club->update($request->validated());

        return response()->json(['data' => new ClubResource($club->load('federation'))]);
    }

    public function destroy(Club $club): Response
    {
        $club->delete();

        return response()->noContent();
    }
}
```

- [ ] **Step 2.5 — Correr tests**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/Admin/ClubAdminTest.php
```

Salida esperada: todos PASS.

- [ ] **Step 2.6 — Correr suite completa backend**

```bash
/d/xampp/php/php.exe artisan test
```

Salida esperada: todos PASS.

- [ ] **Step 2.7 — Commit**

```bash
git add backend/app/Http/Requests/Admin/ClubRequest.php backend/app/Http/Controllers/Api/Admin/ClubController.php backend/tests/Feature/Admin/ClubAdminTest.php
git commit -m "feat: Admin\ClubController CRUD protected by admin middleware"
```

---

## Task 3: Frontend — adminApi.ts

**Files:**
- Create: `frontend/src/lib/adminApi.ts`

- [ ] **Step 3.1 — Crear adminApi.ts**

```typescript
// frontend/src/lib/adminApi.ts

import { http } from "@/lib/api";
import { AuthUser } from "@/types/auth";

// ── Types ─────────────────────────────────────────────────────────────────

export interface AdminPlayer {
  id:                  number;
  federation_id:       number;
  club_id:             number | null;
  first_name:          string;
  last_name:           string;
  full_name:           string;
  slug:                string;
  photo_url:           string | null;
  position:            "goalkeeper" | "defender" | "midfielder" | "forward";
  jersey_number:       number | null;
  date_of_birth:       string;
  place_of_birth:      string | null;
  nationality:         string;
  height_cm:           number | null;
  weight_kg:           number | null;
  international_caps:  number | null;
  international_goals: number | null;
  strong_foot:         "left" | "right";
  active:              boolean;
  in_wc_prelista_2026: boolean;
  club:                { id: number; name: string; country: string } | null;
  federation:          { id: number; short_name: string; country: string } | null;
}

export interface AdminClub {
  id:                number;
  federation_id:     number | null;
  name:              string;
  short_name:        string | null;
  country:           string;
  country_code:      string;
  city:              string;
  stadium_name:      string | null;
  stadium_capacity:  number | null;
  founded_year:      number | null;
  league_name:       string | null;
  logo_url:          string | null;
  website:           string | null;
  coordinates:       { lat: number | null; lng: number | null };
  federation:        { id: number; short_name: string; country: string; logo_url: string | null } | null;
}

// ── Players ────────────────────────────────────────────────────────────────

export async function adminGetPlayers(params?: { position?: string; search?: string; prelista?: boolean }): Promise<AdminPlayer[]> {
  const { data } = await http.get("/admin/players", { params });
  return data.data;
}

export async function adminCreatePlayer(payload: Omit<AdminPlayer, "id" | "club" | "federation">): Promise<AdminPlayer> {
  const { data } = await http.post("/admin/players", payload);
  return data.data;
}

export async function adminUpdatePlayer(id: number, payload: Partial<Omit<AdminPlayer, "id" | "club" | "federation">>): Promise<AdminPlayer> {
  const { data } = await http.put(`/admin/players/${id}`, payload);
  return data.data;
}

export async function adminDeletePlayer(id: number): Promise<void> {
  await http.delete(`/admin/players/${id}`);
}

// ── Clubs ──────────────────────────────────────────────────────────────────

export async function adminGetClubs(params?: { country_code?: string; search?: string }): Promise<AdminClub[]> {
  const { data } = await http.get("/admin/clubs", { params });
  return data.data;
}

export async function adminCreateClub(payload: Omit<AdminClub, "id" | "coordinates" | "federation">): Promise<AdminClub> {
  const { data } = await http.post("/admin/clubs", payload);
  return data.data;
}

export async function adminUpdateClub(id: number, payload: Partial<Omit<AdminClub, "id" | "coordinates" | "federation">>): Promise<AdminClub> {
  const { data } = await http.put(`/admin/clubs/${id}`, payload);
  return data.data;
}

export async function adminDeleteClub(id: number): Promise<void> {
  await http.delete(`/admin/clubs/${id}`);
}
```

- [ ] **Step 3.2 — Commit**

```bash
git add frontend/src/lib/adminApi.ts
git commit -m "feat: adminApi.ts — typed API client for admin players and clubs"
```

---

## Task 4: Frontend — Admin layout

**Files:**
- Create: `frontend/src/app/admin/layout.tsx`

- [ ] **Step 4.1 — Crear admin/layout.tsx**

```tsx
// frontend/src/app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { authLogout } from "@/lib/api";

const NAV = [
  { href: "/admin",         label: "Dashboard" },
  { href: "/admin/players", label: "Jugadores" },
  { href: "/admin/clubs",   label: "Clubes" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, clearAuth } = useAuthStore();

  // Client-side guard (middleware handles server-side redirect)
  useEffect(() => {
    if (user !== null && !isAdmin()) router.replace("/login");
  }, [user]);

  async function handleLogout() {
    await authLogout().catch(() => {});
    clearAuth();
    router.push("/");
  }

  return (
    <div className="min-h-dvh flex bg-neutral-950 text-white">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-neutral-800 flex flex-col">
        <div className="p-5 border-b border-neutral-800">
          <span className="font-[family-name:var(--font-bebas)] text-2xl text-yellow-400 tracking-wide">
            Admin Colombia
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center rounded-lg px-4 py-2.5 text-sm transition ${
                pathname === href
                  ? "bg-yellow-400 text-neutral-950 font-semibold"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 truncate mb-3">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-neutral-700 py-2 text-xs text-neutral-400 hover:bg-neutral-800 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 4.2 — Commit**

```bash
git add frontend/src/app/admin/layout.tsx
git commit -m "feat: admin layout with sidebar nav and logout"
```

---

## Task 5: Frontend — Admin dashboard

**Files:**
- Create: `frontend/src/app/admin/page.tsx`

- [ ] **Step 5.1 — Crear admin/page.tsx**

```tsx
// frontend/src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getStats } from "@/lib/api";
import { adminGetPlayers, adminGetClubs } from "@/lib/adminApi";

interface Stats {
  totalSelections: number;
  totalPlayers:    number;
  totalClubs:      number;
  prelista:        number;
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStats(),
      adminGetPlayers(),
      adminGetPlayers({ prelista: true }),
      adminGetClubs(),
    ]).then(([sel, players, prelista, clubs]) => {
      setStats({
        totalSelections: sel.total_selections,
        totalPlayers:    players.length,
        totalClubs:      clubs.length,
        prelista:        prelista.length,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-neutral-500 text-sm">Cargando estadísticas…</p>;
  }

  const cards = [
    { label: "Selecciones totales",   value: stats?.totalSelections ?? 0, color: "text-yellow-400" },
    { label: "Jugadores en el sistema", value: stats?.totalPlayers ?? 0,  color: "text-blue-400"   },
    { label: "En prelista 2026",       value: stats?.prelista ?? 0,        color: "text-green-400"  },
    { label: "Clubes registrados",     value: stats?.totalClubs ?? 0,      color: "text-purple-400" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-white tracking-wide">
        Dashboard
      </h1>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-neutral-900 border border-neutral-800 p-6">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">{label}</p>
            <p className={`font-[family-name:var(--font-bebas)] text-4xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5.2 — Commit**

```bash
git add frontend/src/app/admin/page.tsx
git commit -m "feat: admin dashboard with stats cards"
```

---

## Task 6: Frontend — Admin players management

**Files:**
- Create: `frontend/src/app/admin/players/page.tsx`

- [ ] **Step 6.1 — Crear admin/players/page.tsx**

```tsx
// frontend/src/app/admin/players/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  adminGetPlayers, adminDeletePlayer, adminCreatePlayer, adminUpdatePlayer,
  type AdminPlayer,
} from "@/lib/adminApi";
import { http } from "@/lib/api";

type Federation = { id: number; name: string; short_name: string };
type Club       = { id: number; name: string };

const POSITIONS = ["goalkeeper", "defender", "midfielder", "forward"] as const;
const FEET      = ["left", "right"] as const;

const emptyForm = (): Omit<AdminPlayer, "id" | "club" | "federation"> => ({
  federation_id:       0,
  club_id:             null,
  first_name:          "",
  last_name:           "",
  full_name:           "",
  slug:                "",
  photo_url:           null,
  position:            "forward",
  jersey_number:       null,
  date_of_birth:       "",
  place_of_birth:      null,
  nationality:         "Colombia",
  height_cm:           null,
  weight_kg:           null,
  international_caps:  null,
  international_goals: null,
  strong_foot:         "right",
  active:              true,
  in_wc_prelista_2026: false,
});

export default function AdminPlayersPage() {
  const [players, setPlayers]           = useState<AdminPlayer[]>([]);
  const [feds, setFeds]                 = useState<Federation[]>([]);
  const [clubs, setClubs]               = useState<Club[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editing, setEditing]           = useState<AdminPlayer | null>(null);
  const [form, setForm]                 = useState(emptyForm());
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState("");

  useEffect(() => {
    Promise.all([
      adminGetPlayers(),
      http.get("/federations").then((r) => r.data.data as Federation[]),
      http.get("/clubs").then((r) => r.data.data as Club[]),
    ]).then(([p, f, c]) => { setPlayers(p); setFeds(f); setClubs(c); })
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setFormError("");
    setShowModal(true);
  }

  function openEdit(player: AdminPlayer) {
    setEditing(player);
    setForm({
      federation_id:       player.federation_id,
      club_id:             player.club_id,
      first_name:          player.first_name,
      last_name:           player.last_name,
      full_name:           player.full_name,
      slug:                player.slug,
      photo_url:           player.photo_url,
      position:            player.position,
      jersey_number:       player.jersey_number,
      date_of_birth:       player.date_of_birth,
      place_of_birth:      player.place_of_birth,
      nationality:         player.nationality,
      height_cm:           player.height_cm,
      weight_kg:           player.weight_kg,
      international_caps:  player.international_caps,
      international_goals: player.international_goals,
      strong_foot:         player.strong_foot,
      active:              player.active,
      in_wc_prelista_2026: player.in_wc_prelista_2026,
    });
    setFormError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.federation_id || !form.first_name || !form.slug || !form.date_of_birth) {
      setFormError("Completa todos los campos obligatorios (*).");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await adminUpdatePlayer(editing.id, form);
        setPlayers((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await adminCreatePlayer(form);
        setPlayers((ps) => [...ps, created]);
      }
      setShowModal(false);
    } catch {
      setFormError("Error al guardar. Verifica los datos.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`¿Eliminar a ${name}?`)) return;
    await adminDeletePlayer(id);
    setPlayers((ps) => ps.filter((p) => p.id !== id));
  }

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const inputClass = "w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400";
  const labelClass = "block text-xs text-neutral-400 mb-1";

  if (loading) return <p className="text-neutral-500 text-sm">Cargando jugadores…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-white tracking-wide">
          Jugadores <span className="text-yellow-400">({players.length})</span>
        </h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-yellow-300 transition"
        >
          + Nuevo jugador
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Posición</th>
              <th className="px-4 py-3 text-left">Club</th>
              <th className="px-4 py-3 text-left">Prelista</th>
              <th className="px-4 py-3 text-left">Activo</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {players.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-900 transition">
                <td className="px-4 py-3 text-neutral-500">{p.jersey_number ?? "—"}</td>
                <td className="px-4 py-3 font-medium">{p.full_name}</td>
                <td className="px-4 py-3 capitalize text-neutral-400">{p.position}</td>
                <td className="px-4 py-3 text-neutral-400">{p.club?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block w-2 h-2 rounded-full ${p.in_wc_prelista_2026 ? "bg-green-400" : "bg-neutral-700"}`} />
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block w-2 h-2 rounded-full ${p.active ? "bg-blue-400" : "bg-neutral-700"}`} />
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(p)} className="text-xs text-yellow-400 hover:underline">Editar</button>
                  <button onClick={() => handleDelete(p.id, p.full_name)} className="text-xs text-red-400 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl border border-neutral-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-yellow-400">
              {editing ? "Editar jugador" : "Nuevo jugador"}
            </h2>

            {formError && <p className="text-sm text-red-400">{formError}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Federación *</label>
                <select value={form.federation_id} onChange={(e) => setField("federation_id", Number(e.target.value))} className={inputClass}>
                  <option value={0}>Seleccionar…</option>
                  {feds.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Club</label>
                <select value={form.club_id ?? ""} onChange={(e) => setField("club_id", e.target.value ? Number(e.target.value) : null)} className={inputClass}>
                  <option value="">Sin club</option>
                  {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Nombre *</label>
                <input type="text" value={form.first_name} onChange={(e) => setField("first_name", e.target.value)} className={inputClass} placeholder="Luis" />
              </div>
              <div>
                <label className={labelClass}>Apellido *</label>
                <input type="text" value={form.last_name} onChange={(e) => setField("last_name", e.target.value)} className={inputClass} placeholder="Díaz" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Nombre completo *</label>
                <input type="text" value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} className={inputClass} placeholder="Luis Díaz" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Slug * (URL)</label>
                <input type="text" value={form.slug} onChange={(e) => setField("slug", e.target.value)} className={inputClass} placeholder="luis-diaz-12345" />
              </div>
              <div>
                <label className={labelClass}>Posición *</label>
                <select value={form.position} onChange={(e) => setField("position", e.target.value as AdminPlayer["position"])} className={inputClass}>
                  {POSITIONS.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Pie hábil *</label>
                <select value={form.strong_foot} onChange={(e) => setField("strong_foot", e.target.value as "left" | "right")} className={inputClass}>
                  {FEET.map((f) => <option key={f} value={f}>{f === "left" ? "Izquierdo" : "Derecho"}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fecha de nacimiento *</label>
                <input type="date" value={form.date_of_birth} onChange={(e) => setField("date_of_birth", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Número camiseta</label>
                <input type="number" value={form.jersey_number ?? ""} onChange={(e) => setField("jersey_number", e.target.value ? Number(e.target.value) : null)} className={inputClass} min={1} max={99} />
              </div>
              <div>
                <label className={labelClass}>Altura (cm)</label>
                <input type="number" value={form.height_cm ?? ""} onChange={(e) => setField("height_cm", e.target.value ? Number(e.target.value) : null)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Peso (kg)</label>
                <input type="number" value={form.weight_kg ?? ""} onChange={(e) => setField("weight_kg", e.target.value ? Number(e.target.value) : null)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Partidos internacionales</label>
                <input type="number" value={form.international_caps ?? ""} onChange={(e) => setField("international_caps", e.target.value ? Number(e.target.value) : null)} className={inputClass} min={0} />
              </div>
              <div>
                <label className={labelClass}>Goles internacionales</label>
                <input type="number" value={form.international_goals ?? ""} onChange={(e) => setField("international_goals", e.target.value ? Number(e.target.value) : null)} className={inputClass} min={0} />
              </div>
              <div>
                <label className={labelClass}>URL foto</label>
                <input type="text" value={form.photo_url ?? ""} onChange={(e) => setField("photo_url", e.target.value || null)} className={inputClass} placeholder="https://…" />
              </div>
              <div>
                <label className={labelClass}>Lugar de nacimiento</label>
                <input type="text" value={form.place_of_birth ?? ""} onChange={(e) => setField("place_of_birth", e.target.value || null)} className={inputClass} />
              </div>
              <div className="col-span-2 flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setField("active", e.target.checked)} className="accent-yellow-400" />
                  Activo
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
                  <input type="checkbox" checked={form.in_wc_prelista_2026} onChange={(e) => setField("in_wc_prelista_2026", e.target.checked)} className="accent-green-400" />
                  En prelista WC 2026
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-neutral-700 py-2.5 text-sm text-neutral-400 hover:bg-neutral-800 transition">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 rounded-lg bg-yellow-400 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-yellow-300 transition disabled:opacity-50">
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6.2 — Commit**

```bash
git add frontend/src/app/admin/players/
git commit -m "feat: admin players management page with CRUD modal"
```

---

## Task 7: Frontend — Admin clubs management

**Files:**
- Create: `frontend/src/app/admin/clubs/page.tsx`

- [ ] **Step 7.1 — Crear admin/clubs/page.tsx**

```tsx
// frontend/src/app/admin/clubs/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  adminGetClubs, adminDeleteClub, adminCreateClub, adminUpdateClub,
  type AdminClub,
} from "@/lib/adminApi";
import { http } from "@/lib/api";

type Federation = { id: number; name: string };

const emptyForm = (): Omit<AdminClub, "id" | "coordinates" | "federation"> => ({
  federation_id:    null,
  name:             "",
  short_name:       null,
  country:          "",
  country_code:     "",
  city:             "",
  stadium_name:     null,
  stadium_capacity: null,
  founded_year:     null,
  league_name:      null,
  logo_url:         null,
  website:          null,
});

export default function AdminClubsPage() {
  const [clubs, setClubs]       = useState<AdminClub[]>([]);
  const [feds, setFeds]         = useState<Federation[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<AdminClub | null>(null);
  const [form, setForm]         = useState(emptyForm());
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    Promise.all([
      adminGetClubs(),
      http.get("/federations").then((r) => r.data.data as Federation[]),
    ]).then(([c, f]) => { setClubs(c); setFeds(f); })
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setFormError("");
    setShowModal(true);
  }

  function openEdit(club: AdminClub) {
    setEditing(club);
    setForm({
      federation_id:    club.federation_id,
      name:             club.name,
      short_name:       club.short_name,
      country:          club.country,
      country_code:     club.country_code,
      city:             club.city,
      stadium_name:     club.stadium_name,
      stadium_capacity: club.stadium_capacity,
      founded_year:     club.founded_year,
      league_name:      club.league_name,
      logo_url:         club.logo_url,
      website:          club.website,
    });
    setFormError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.country || !form.country_code || !form.city) {
      setFormError("Nombre, país, código (3 letras) y ciudad son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await adminUpdateClub(editing.id, form);
        setClubs((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await adminCreateClub(form);
        setClubs((cs) => [...cs, created]);
      }
      setShowModal(false);
    } catch {
      setFormError("Error al guardar. Verifica los datos.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`¿Eliminar ${name}?`)) return;
    await adminDeleteClub(id);
    setClubs((cs) => cs.filter((c) => c.id !== id));
  }

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const inputClass = "w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400";
  const labelClass = "block text-xs text-neutral-400 mb-1";

  if (loading) return <p className="text-neutral-500 text-sm">Cargando clubes…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-white tracking-wide">
          Clubes <span className="text-yellow-400">({clubs.length})</span>
        </h1>
        <button onClick={openCreate} className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-yellow-300 transition">
          + Nuevo club
        </button>
      </div>

      <div className="rounded-xl border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Club</th>
              <th className="px-4 py-3 text-left">País</th>
              <th className="px-4 py-3 text-left">Liga</th>
              <th className="px-4 py-3 text-left">Federación</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {clubs.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-900 transition">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-neutral-400">{c.country} <span className="text-neutral-600">({c.country_code})</span></td>
                <td className="px-4 py-3 text-neutral-400">{c.league_name ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-400">{c.federation?.short_name ?? "—"}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(c)} className="text-xs text-yellow-400 hover:underline">Editar</button>
                  <button onClick={() => handleDelete(c.id, c.name)} className="text-xs text-red-400 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl border border-neutral-700 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-yellow-400">
              {editing ? "Editar club" : "Nuevo club"}
            </h2>

            {formError && <p className="text-sm text-red-400">{formError}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Nombre *</label>
                <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} placeholder="Atlético Nacional" />
              </div>
              <div>
                <label className={labelClass}>Nombre corto</label>
                <input type="text" value={form.short_name ?? ""} onChange={(e) => setField("short_name", e.target.value || null)} className={inputClass} placeholder="Nacional" />
              </div>
              <div>
                <label className={labelClass}>Federación</label>
                <select value={form.federation_id ?? ""} onChange={(e) => setField("federation_id", e.target.value ? Number(e.target.value) : null)} className={inputClass}>
                  <option value="">Sin federación</option>
                  {feds.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>País *</label>
                <input type="text" value={form.country} onChange={(e) => setField("country", e.target.value)} className={inputClass} placeholder="Colombia" />
              </div>
              <div>
                <label className={labelClass}>Código país * (3 letras)</label>
                <input type="text" value={form.country_code} onChange={(e) => setField("country_code", e.target.value.toUpperCase().slice(0, 3))} className={inputClass} placeholder="COL" maxLength={3} />
              </div>
              <div>
                <label className={labelClass}>Ciudad *</label>
                <input type="text" value={form.city} onChange={(e) => setField("city", e.target.value)} className={inputClass} placeholder="Medellín" />
              </div>
              <div>
                <label className={labelClass}>Liga</label>
                <input type="text" value={form.league_name ?? ""} onChange={(e) => setField("league_name", e.target.value || null)} className={inputClass} placeholder="Liga BetPlay" />
              </div>
              <div>
                <label className={labelClass}>Estadio</label>
                <input type="text" value={form.stadium_name ?? ""} onChange={(e) => setField("stadium_name", e.target.value || null)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Capacidad estadio</label>
                <input type="number" value={form.stadium_capacity ?? ""} onChange={(e) => setField("stadium_capacity", e.target.value ? Number(e.target.value) : null)} className={inputClass} min={0} />
              </div>
              <div>
                <label className={labelClass}>Año fundación</label>
                <input type="number" value={form.founded_year ?? ""} onChange={(e) => setField("founded_year", e.target.value ? Number(e.target.value) : null)} className={inputClass} min={1800} max={2025} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>URL logo</label>
                <input type="text" value={form.logo_url ?? ""} onChange={(e) => setField("logo_url", e.target.value || null)} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Website</label>
                <input type="url" value={form.website ?? ""} onChange={(e) => setField("website", e.target.value || null)} className={inputClass} placeholder="https://…" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-neutral-700 py-2.5 text-sm text-neutral-400 hover:bg-neutral-800 transition">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 rounded-lg bg-yellow-400 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-yellow-300 transition disabled:opacity-50">
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7.2 — Commit**

```bash
git add frontend/src/app/admin/clubs/
git commit -m "feat: admin clubs management page with CRUD modal"
```

---

## Task 8: Verificación final

- [ ] **Step 8.1 — Correr suite backend completa**

```bash
/d/xampp/php/php.exe artisan test
```

Salida esperada: todos PASS (incluyendo Admin\PlayerAdminTest y Admin\ClubAdminTest).

- [ ] **Step 8.2 — Commit final**

```bash
git add -A
git commit -m "feat: complete admin panel — player/club CRUD with role-based access"
```

---

## Resumen de lo que queda disponible al finalizar

| URL | Quién puede acceder |
|-----|---------------------|
| `/login` | Todos |
| `/register` | Todos |
| `/auth/callback` | Todos (OAuth redirect) |
| `/admin` | Solo role=admin |
| `/admin/players` | Solo role=admin |
| `/admin/clubs` | Solo role=admin |
| `POST /api/auth/register` | Público |
| `POST /api/auth/login` | Público |
| `GET /api/auth/me` | auth:sanctum |
| `POST /api/auth/logout` | auth:sanctum |
| `PATCH /api/auth/consent` | auth:sanctum |
| `GET /api/auth/{provider}/redirect` | Público |
| `GET /api/auth/{provider}/callback` | Público |
| `GET\|POST /api/admin/players` | auth:sanctum + admin |
| `PUT\|DELETE /api/admin/players/{id}` | auth:sanctum + admin |
| `GET\|POST /api/admin/clubs` | auth:sanctum + admin |
| `PUT\|DELETE /api/admin/clubs/{id}` | auth:sanctum + admin |

> Para crear el primer usuario admin, usar tinker:
> ```bash
> /d/xampp/php/php.exe artisan tinker --execute="App\Models\User::where('email','tu@email.com')->update(['role'=>'admin']);"
> ```
