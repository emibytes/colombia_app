# Admin CRUD — Federaciones y Confederaciones

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar gestión completa (listar, crear, editar, eliminar) de Confederaciones y Federaciones en el panel admin.

**Architecture:** Se siguen los patrones exactos de `Admin\ClubController` y `Admin\PlayerController` para el backend (apiResource bajo middleware `auth:sanctum + admin`). En el frontend se extiende `adminApi.ts` con los nuevos tipos y métodos, y se crean dos páginas que replican el patrón de `admin/clubs/page.tsx` con la misma dark UI.

**Tech Stack:** Laravel 11, PHP, Sanctum, Eloquent · Next.js 16 App Router, TypeScript, Framer Motion, @phosphor-icons/react

---

## File Map

**Backend — crear:**
- `backend/app/Http/Controllers/Admin/ConfederationController.php`
- `backend/app/Http/Controllers/Admin/FederationController.php`

**Backend — modificar:**
- `backend/routes/api.php` (añadir 2 apiResource al grupo admin)

**Backend — test:**
- `backend/tests/Feature/Admin/ConfederationAdminTest.php`
- `backend/tests/Feature/Admin/FederationAdminTest.php`

**Frontend — modificar:**
- `frontend/src/lib/adminApi.ts` (2 interfaces nuevas + 8 métodos)
- `frontend/src/app/admin/layout.tsx` (2 entradas en NAV)
- `frontend/src/app/admin/page.tsx` (2 cards en dashboard)

**Frontend — crear:**
- `frontend/src/app/admin/confederations/page.tsx`
- `frontend/src/app/admin/federations/page.tsx`

---

## Task 1: Backend — Admin ConfederationController

**Files:**
- Create: `backend/app/Http/Controllers/Admin/ConfederationController.php`
- Modify: `backend/routes/api.php`

- [ ] **Step 1: Crear el controlador**

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Confederation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConfederationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Confederation::withCount('federations')->orderBy('name')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                 => ['required', 'string', 'max:100'],
            'full_name'            => ['nullable', 'string', 'max:200'],
            'region'               => ['nullable', 'string', 'max:100'],
            'president'            => ['nullable', 'string', 'max:150'],
            'headquarters_city'    => ['nullable', 'string', 'max:100'],
            'headquarters_country' => ['nullable', 'string', 'max:100'],
            'founded_year'         => ['nullable', 'integer', 'min:1800', 'max:2100'],
            'member_nations'       => ['nullable', 'integer', 'min:0'],
            'website'              => ['nullable', 'url'],
            'logo_url'             => ['nullable', 'url'],
        ]);

        return response()->json(Confederation::create($data), 201);
    }

    public function show(Confederation $confederation): JsonResponse
    {
        return response()->json($confederation->loadCount('federations'));
    }

    public function update(Request $request, Confederation $confederation): JsonResponse
    {
        $data = $request->validate([
            'name'                 => ['sometimes', 'string', 'max:100'],
            'full_name'            => ['nullable', 'string', 'max:200'],
            'region'               => ['nullable', 'string', 'max:100'],
            'president'            => ['nullable', 'string', 'max:150'],
            'headquarters_city'    => ['nullable', 'string', 'max:100'],
            'headquarters_country' => ['nullable', 'string', 'max:100'],
            'founded_year'         => ['nullable', 'integer', 'min:1800', 'max:2100'],
            'member_nations'       => ['nullable', 'integer', 'min:0'],
            'website'              => ['nullable', 'url'],
            'logo_url'             => ['nullable', 'url'],
        ]);

        $confederation->update($data);

        return response()->json($confederation);
    }

    public function destroy(Confederation $confederation): JsonResponse
    {
        $confederation->delete();

        return response()->json(null, 204);
    }
}
```

- [ ] **Step 2: Registrar la ruta en `backend/routes/api.php`**

Localizar el bloque admin (línea ~43) y añadir después de los clubs:

```php
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::apiResource('players',        \App\Http\Controllers\Admin\PlayerController::class);
    Route::apiResource('clubs',          \App\Http\Controllers\Admin\ClubController::class);
    Route::apiResource('confederations', \App\Http\Controllers\Admin\ConfederationController::class);
    Route::apiResource('federations',    \App\Http\Controllers\Admin\FederationController::class);
});
```

- [ ] **Step 3: Verificar que las rutas existen**

```bash
/d/xampp/php/php.exe artisan route:list --path=admin
```

Resultado esperado: filas para `admin/confederations` con métodos GET/POST/PUT/DELETE.

- [ ] **Step 4: Commit**

```bash
git add backend/app/Http/Controllers/Admin/ConfederationController.php backend/routes/api.php
git commit -m "feat: add admin ConfederationController with apiResource routes"
```

---

## Task 2: Backend — Admin FederationController

**Files:**
- Create: `backend/app/Http/Controllers/Admin/FederationController.php`

- [ ] **Step 1: Crear el controlador**

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Federation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FederationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Federation::with('confederation')
                ->orderBy('name')
                ->get()
                ->map(fn ($f) => [
                    'id'                 => $f->id,
                    'confederation_id'   => $f->confederation_id,
                    'confederation_name' => $f->confederation?->name,
                    'name'               => $f->name,
                    'short_name'         => $f->short_name,
                    'country'            => $f->country,
                    'country_code'       => $f->country_code,
                    'continent'          => $f->continent,
                    'fifa_ranking'       => $f->fifa_ranking,
                    'qualified_wc_2026'  => $f->qualified_wc_2026,
                    'head_coach'         => $f->head_coach,
                    'founded_year'       => $f->founded_year,
                ])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'confederation_id'   => ['nullable', 'exists:confederations,id'],
            'name'               => ['required', 'string', 'max:150'],
            'short_name'         => ['nullable', 'string', 'max:20'],
            'country'            => ['nullable', 'string', 'max:100'],
            'country_code'       => ['nullable', 'string', 'max:3'],
            'continent'          => ['nullable', 'string', 'max:50'],
            'city'               => ['nullable', 'string', 'max:100'],
            'president'          => ['nullable', 'string', 'max:150'],
            'head_coach'         => ['nullable', 'string', 'max:150'],
            'founded_year'       => ['nullable', 'integer', 'min:1800', 'max:2100'],
            'fifa_ranking'       => ['nullable', 'integer', 'min:1', 'max:300'],
            'qualified_wc_2026'  => ['boolean'],
            'national_stadium'   => ['nullable', 'string', 'max:150'],
            'stadium_capacity'   => ['nullable', 'integer', 'min:0'],
            'website'            => ['nullable', 'url'],
            'logo_url'           => ['nullable', 'url'],
            'primary_color'      => ['nullable', 'string', 'max:7'],
            'secondary_color'    => ['nullable', 'string', 'max:7'],
        ]);

        return response()->json(Federation::create($data), 201);
    }

    public function show(Federation $federation): JsonResponse
    {
        return response()->json($federation->load('confederation'));
    }

    public function update(Request $request, Federation $federation): JsonResponse
    {
        $data = $request->validate([
            'confederation_id'   => ['nullable', 'exists:confederations,id'],
            'name'               => ['sometimes', 'string', 'max:150'],
            'short_name'         => ['nullable', 'string', 'max:20'],
            'country'            => ['nullable', 'string', 'max:100'],
            'country_code'       => ['nullable', 'string', 'max:3'],
            'continent'          => ['nullable', 'string', 'max:50'],
            'city'               => ['nullable', 'string', 'max:100'],
            'president'          => ['nullable', 'string', 'max:150'],
            'head_coach'         => ['nullable', 'string', 'max:150'],
            'founded_year'       => ['nullable', 'integer', 'min:1800', 'max:2100'],
            'fifa_ranking'       => ['nullable', 'integer', 'min:1', 'max:300'],
            'qualified_wc_2026'  => ['boolean'],
            'national_stadium'   => ['nullable', 'string', 'max:150'],
            'stadium_capacity'   => ['nullable', 'integer', 'min:0'],
            'website'            => ['nullable', 'url'],
            'logo_url'           => ['nullable', 'url'],
            'primary_color'      => ['nullable', 'string', 'max:7'],
            'secondary_color'    => ['nullable', 'string', 'max:7'],
        ]);

        $federation->update($data);

        return response()->json($federation);
    }

    public function destroy(Federation $federation): JsonResponse
    {
        $federation->delete();

        return response()->json(null, 204);
    }
}
```

- [ ] **Step 2: Verificar rutas de federaciones**

```bash
/d/xampp/php/php.exe artisan route:list --path=admin/federations
```

Resultado esperado: 5 rutas (index, store, show, update, destroy).

- [ ] **Step 3: Commit**

```bash
git add backend/app/Http/Controllers/Admin/FederationController.php
git commit -m "feat: add admin FederationController with full CRUD"
```

---

## Task 3: Backend — Tests

**Files:**
- Create: `backend/tests/Feature/Admin/ConfederationAdminTest.php`
- Create: `backend/tests/Feature/Admin/FederationAdminTest.php`

- [ ] **Step 1: Crear test de confederaciones**

```php
<?php

namespace Tests\Feature\Admin;

use App\Models\Confederation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConfederationAdminTest extends TestCase
{
    use RefreshDatabase;

    private function adminHeaders(): array
    {
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;
        return ['Authorization' => "Bearer {$token}"];
    }

    public function test_admin_can_list_confederations(): void
    {
        Confederation::factory()->count(3)->create();
        $response = $this->getJson('/api/admin/confederations', $this->adminHeaders());
        $response->assertOk()->assertJsonCount(3);
    }

    public function test_admin_can_create_confederation(): void
    {
        $response = $this->postJson('/api/admin/confederations', [
            'name'   => 'CONMEBOL',
            'region' => 'South America',
        ], $this->adminHeaders());

        $response->assertCreated()->assertJsonPath('name', 'CONMEBOL');
        $this->assertDatabaseHas('confederations', ['name' => 'CONMEBOL']);
    }

    public function test_admin_can_update_confederation(): void
    {
        $conf = Confederation::factory()->create(['name' => 'Old']);
        $response = $this->putJson("/api/admin/confederations/{$conf->id}", [
            'name' => 'New',
        ], $this->adminHeaders());

        $response->assertOk()->assertJsonPath('name', 'New');
    }

    public function test_admin_can_delete_confederation(): void
    {
        $conf = Confederation::factory()->create();
        $this->deleteJson("/api/admin/confederations/{$conf->id}", [], $this->adminHeaders())
             ->assertNoContent();

        $this->assertDatabaseMissing('confederations', ['id' => $conf->id]);
    }

    public function test_non_admin_cannot_access_admin_confederations(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $this->getJson('/api/admin/confederations', ['Authorization' => "Bearer {$token}"])
             ->assertForbidden();
    }
}
```

- [ ] **Step 2: Crear test de federaciones**

```php
<?php

namespace Tests\Feature\Admin;

use App\Models\Confederation;
use App\Models\Federation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FederationAdminTest extends TestCase
{
    use RefreshDatabase;

    private function adminHeaders(): array
    {
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;
        return ['Authorization' => "Bearer {$token}"];
    }

    public function test_admin_can_list_federations(): void
    {
        Federation::factory()->count(3)->create();
        $this->getJson('/api/admin/federations', $this->adminHeaders())
             ->assertOk()->assertJsonCount(3);
    }

    public function test_admin_can_create_federation(): void
    {
        $conf = Confederation::factory()->create();
        $response = $this->postJson('/api/admin/federations', [
            'confederation_id'  => $conf->id,
            'name'              => 'Federación Colombiana de Fútbol',
            'country_code'      => 'COL',
            'qualified_wc_2026' => true,
        ], $this->adminHeaders());

        $response->assertCreated()->assertJsonPath('country_code', 'COL');
        $this->assertDatabaseHas('federations', ['country_code' => 'COL']);
    }

    public function test_admin_can_update_federation(): void
    {
        $fed = Federation::factory()->create(['fifa_ranking' => 50]);
        $this->putJson("/api/admin/federations/{$fed->id}", [
            'fifa_ranking' => 12,
        ], $this->adminHeaders())
             ->assertOk()->assertJsonPath('fifa_ranking', 12);
    }

    public function test_admin_can_delete_federation(): void
    {
        $fed = Federation::factory()->create();
        $this->deleteJson("/api/admin/federations/{$fed->id}", [], $this->adminHeaders())
             ->assertNoContent();
        $this->assertDatabaseMissing('federations', ['id' => $fed->id]);
    }
}
```

- [ ] **Step 3: Verificar que los factories existen**

```bash
/d/xampp/php/php.exe artisan tinker --execute="echo class_exists(\Database\Factories\ConfederationFactory::class) ? 'OK' : 'MISSING';"
/d/xampp/php/php.exe artisan tinker --execute="echo class_exists(\Database\Factories\FederationFactory::class) ? 'OK' : 'MISSING';"
```

Si alguno dice `MISSING`, crear el factory correspondiente. Para Confederation:
```php
// database/factories/ConfederationFactory.php
<?php
namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;
class ConfederationFactory extends Factory {
    public function definition(): array {
        return [
            'name'   => $this->faker->unique()->word(),
            'region' => $this->faker->continent(),
        ];
    }
}
```

Para Federation (si no existe):
```php
// database/factories/FederationFactory.php
<?php
namespace Database\Factories;
use App\Models\Confederation;
use Illuminate\Database\Eloquent\Factories\Factory;
class FederationFactory extends Factory {
    public function definition(): array {
        return [
            'confederation_id'  => Confederation::factory(),
            'name'              => $this->faker->country() . ' Football Federation',
            'country_code'      => strtoupper($this->faker->unique()->lexify('???')),
            'qualified_wc_2026' => false,
        ];
    }
}
```

- [ ] **Step 4: Correr los tests**

```bash
/d/xampp/php/php.exe artisan test --filter=ConfederationAdminTest
/d/xampp/php/php.exe artisan test --filter=FederationAdminTest
```

Resultado esperado: todos en verde (5 + 4 = 9 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/tests/Feature/Admin/
git commit -m "test: add admin CRUD tests for confederations and federations"
```

---

## Task 4: Frontend — Extender adminApi.ts

**Files:**
- Modify: `frontend/src/lib/adminApi.ts`

- [ ] **Step 1: Añadir interfaces y métodos al final del archivo**

Al final de `frontend/src/lib/adminApi.ts`, añadir:

```typescript
// ── Tipos nuevos ─────────────────────────────────────────

export interface AdminConfederation {
  id:                   number;
  name:                 string;
  full_name:            string | null;
  region:               string | null;
  president:            string | null;
  headquarters_city:    string | null;
  headquarters_country: string | null;
  founded_year:         number | null;
  member_nations:       number | null;
  federations_count?:   number;
}

export interface AdminFederationRow {
  id:                 number;
  confederation_id:   number | null;
  confederation_name: string | null;
  name:               string;
  short_name:         string | null;
  country:            string | null;
  country_code:       string | null;
  continent:          string | null;
  fifa_ranking:       number | null;
  qualified_wc_2026:  boolean;
  head_coach:         string | null;
  founded_year:       number | null;
}
```

- [ ] **Step 2: Añadir métodos al objeto `adminApi`**

Dentro del objeto `adminApi`, añadir antes del cierre `}`:

```typescript
  // Confederations
  getConfederations: () =>
    http.get<AdminConfederation[]>("/admin/confederations").then((r) => r.data),
  createConfederation: (data: Partial<AdminConfederation>) =>
    http.post<AdminConfederation>("/admin/confederations", data).then((r) => r.data),
  updateConfederation: (id: number, data: Partial<AdminConfederation>) =>
    http.put<AdminConfederation>(`/admin/confederations/${id}`, data).then((r) => r.data),
  deleteConfederation: (id: number) =>
    http.delete(`/admin/confederations/${id}`),

  // Federations (admin)
  getAdminFederations: () =>
    http.get<AdminFederationRow[]>("/admin/federations").then((r) => r.data),
  createFederation: (data: Partial<AdminFederationRow>) =>
    http.post<AdminFederationRow>("/admin/federations", data).then((r) => r.data),
  updateFederation: (id: number, data: Partial<AdminFederationRow>) =>
    http.put<AdminFederationRow>(`/admin/federations/${id}`, data).then((r) => r.data),
  deleteFederation: (id: number) =>
    http.delete(`/admin/federations/${id}`),
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Resultado esperado: sin errores.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/adminApi.ts
git commit -m "feat: add confederation and federation admin API methods"
```

---

## Task 5: Frontend — Página admin/confederations

**Files:**
- Create: `frontend/src/app/admin/confederations/page.tsx`

- [ ] **Step 1: Crear la página**

```tsx
"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, PencilSimple, Trash, X } from "@phosphor-icons/react";
import { adminApi, AdminConfederation } from "@/lib/adminApi";

const INPUT_CLS =
  "w-full bg-[#111620] border border-[rgba(252,209,22,0.1)] rounded-xl px-4 py-2.5 text-sm text-[#F0EDE8] placeholder-[#6B7280]/40 focus:outline-none focus:border-[rgba(252,209,22,0.5)] focus:shadow-[0_0_0_3px_rgba(252,209,22,0.05)] transition-all duration-300";

const EDIT_FIELDS: { label: string; key: keyof AdminConfederation; type?: string }[] = [
  { label: "Nombre *",          key: "name"                 },
  { label: "Nombre completo",   key: "full_name"            },
  { label: "Región",            key: "region"               },
  { label: "Presidente",        key: "president"            },
  { label: "Ciudad sede",       key: "headquarters_city"    },
  { label: "País sede",         key: "headquarters_country" },
  { label: "Año fundación",     key: "founded_year",  type: "number" },
  { label: "Naciones miembro",  key: "member_nations", type: "number" },
];

const empty: Omit<AdminConfederation, "id"> = {
  name: "", full_name: null, region: null, president: null,
  headquarters_city: null, headquarters_country: null,
  founded_year: null, member_nations: null,
};

export default function AdminConferederationsPage() {
  const [items, setItems]     = useState<AdminConfederation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminConfederation | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [newForm, setNewForm] = useState<typeof empty>({ ...empty });

  useEffect(() => {
    adminApi.getConfederations().then(setItems).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar confederación? Esto también eliminará las federaciones asociadas.")) return;
    await adminApi.deleteConfederation(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  async function handleUpdate() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateConfederation(editing.id, {
        name: editing.name, full_name: editing.full_name,
        region: editing.region, president: editing.president,
        headquarters_city: editing.headquarters_city,
        headquarters_country: editing.headquarters_country,
        founded_year: editing.founded_year,
        member_nations: editing.member_nations,
      });
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setEditing(null);
    } finally { setSaving(false); }
  }

  async function handleCreate() {
    if (!newForm.name.trim()) return;
    setSaving(true);
    try {
      const created = await adminApi.createConfederation({
        ...newForm,
        name: newForm.name.trim(),
      });
      setItems((prev) => [...prev, created]);
      setCreating(false);
      setNewForm({ ...empty });
    } finally { setSaving(false); }
  }

  if (loading) return (
    <div className="flex items-center gap-3 text-[#6B7280] text-sm">
      <span className="btn-spinner" style={{ borderColor: "rgba(107,114,128,0.25)", borderTopColor: "#6B7280" }} />
      Cargando confederaciones…
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-[#F0EDE8] tracking-wide">Confederaciones</h1>
          <p className="text-[#6B7280] text-xs mt-0.5">{items.length} registros</p>
        </div>
        <motion.button onClick={() => setCreating(true)}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center gap-2 bg-[#FCD116] text-[#05080F] font-bold px-4 py-2.5 rounded-xl text-sm hover:brightness-110 transition-[filter] duration-200">
          <Plus size={15} weight="bold" />Nueva confederación
        </motion.button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-[rgba(252,209,22,0.07)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-[#0C1018]">
            <thead>
              <tr className="border-b border-[rgba(252,209,22,0.07)]">
                {["Nombre", "Región", "Sede", "Fundada", "Naciones", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] uppercase tracking-[0.15em] font-semibold text-[#6B7280] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-[rgba(252,209,22,0.025)] transition-colors duration-150 group">
                  <td className="px-5 py-3 font-medium text-[#F0EDE8]">{c.name}</td>
                  <td className="px-5 py-3 text-[#6B7280]">{c.region ?? "—"}</td>
                  <td className="px-5 py-3 text-[#6B7280]">{c.headquarters_city ? `${c.headquarters_city}, ${c.headquarters_country ?? ""}` : "—"}</td>
                  <td className="px-5 py-3 text-[#6B7280] font-mono">{c.founded_year ?? "—"}</td>
                  <td className="px-5 py-3 text-[#6B7280] font-mono">{c.member_nations ?? "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => setEditing(c)} className="flex items-center gap-1 text-xs text-[#FCD116] hover:text-white transition-colors">
                        <PencilSimple size={13} weight="bold" />Editar
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="flex items-center gap-1 text-xs text-[#CE1126] hover:text-red-400 transition-colors">
                        <Trash size={13} weight="bold" />Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <AdminModal title={`Editar: ${editing.name}`} onClose={() => setEditing(null)}>
            {EDIT_FIELDS.map(({ label, key, type }) => (
              <FormField key={key as string} label={label}>
                <input type={type ?? "text"}
                  value={(editing[key] as string | number | null) ?? ""}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value || null })}
                  className={INPUT_CLS} />
              </FormField>
            ))}
            <ModalActions onCancel={() => setEditing(null)} onConfirm={handleUpdate} saving={saving} label="Guardar" />
          </AdminModal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {creating && (
          <AdminModal title="Nueva confederación" onClose={() => setCreating(false)}>
            {EDIT_FIELDS.map(({ label, key, type }) => (
              <FormField key={key as string} label={label}>
                <input type={type ?? "text"}
                  value={(newForm[key] as string | number | null) ?? ""}
                  onChange={(e) => setNewForm({ ...newForm, [key]: e.target.value || null })}
                  className={INPUT_CLS} />
              </FormField>
            ))}
            <ModalActions onCancel={() => setCreating(false)} onConfirm={handleCreate}
              saving={saving} disabled={!newForm.name.trim()} label="Crear" />
          </AdminModal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Shared UI helpers ──────────────────────────────────────

function AdminModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="bg-[#0C1018] border border-[rgba(252,209,22,0.1)] rounded-2xl p-6 w-full max-w-sm shadow-[0_0_80px_rgba(0,0,0,0.7)] space-y-4 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#F0EDE8] tracking-wide">{title}</h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#F0EDE8] transition-colors p-1"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-[#6B7280] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ModalActions({ onCancel, onConfirm, saving, disabled, label }: {
  onCancel: () => void; onConfirm: () => void; saving: boolean; disabled?: boolean; label: string;
}) {
  return (
    <div className="flex gap-3 justify-end pt-2">
      <button onClick={onCancel} className="text-sm text-[#6B7280] hover:text-[#F0EDE8] transition-colors">Cancelar</button>
      <motion.button onClick={onConfirm} disabled={saving || disabled}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="bg-[#FCD116] text-[#05080F] font-bold px-5 py-2 rounded-xl text-sm hover:brightness-110 transition-[filter] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
        {saving
          ? <><span className="btn-spinner" style={{ borderColor: "rgba(5,8,15,0.2)", borderTopColor: "#05080F" }} />{label === "Guardar" ? "Guardando…" : "Creando…"}</>
          : label}
      </motion.button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/admin/confederations/page.tsx
git commit -m "feat: add admin confederations CRUD page"
```

---

## Task 6: Frontend — Página admin/federations

**Files:**
- Create: `frontend/src/app/admin/federations/page.tsx`

- [ ] **Step 1: Crear la página**

```tsx
"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, PencilSimple, Trash, X } from "@phosphor-icons/react";
import { adminApi, AdminFederationRow, AdminConfederation } from "@/lib/adminApi";

const INPUT_CLS =
  "w-full bg-[#111620] border border-[rgba(252,209,22,0.1)] rounded-xl px-4 py-2.5 text-sm text-[#F0EDE8] placeholder-[#6B7280]/40 focus:outline-none focus:border-[rgba(252,209,22,0.5)] focus:shadow-[0_0_0_3px_rgba(252,209,22,0.05)] transition-all duration-300";

const SELECT_CLS =
  "w-full bg-[#111620] border border-[rgba(252,209,22,0.1)] rounded-xl px-4 py-2.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[rgba(252,209,22,0.5)] transition-all duration-300 appearance-none";

const emptyForm: Partial<AdminFederationRow> = {
  confederation_id: null, name: "", short_name: null,
  country: null, country_code: null, continent: null,
  fifa_ranking: null, qualified_wc_2026: false, head_coach: null, founded_year: null,
};

export default function AdminFederationsPage() {
  const [items, setItems]               = useState<AdminFederationRow[]>([]);
  const [confederations, setConfs]      = useState<AdminConfederation[]>([]);
  const [loading, setLoading]           = useState(true);
  const [editing, setEditing]           = useState<AdminFederationRow | null>(null);
  const [creating, setCreating]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [newForm, setNewForm]           = useState<Partial<AdminFederationRow>>({ ...emptyForm });

  useEffect(() => {
    Promise.all([adminApi.getAdminFederations(), adminApi.getConfederations()])
      .then(([feds, confs]) => { setItems(feds); setConfs(confs); })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar federación?")) return;
    await adminApi.deleteFederation(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  async function handleUpdate() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateFederation(editing.id, {
        confederation_id: editing.confederation_id,
        name: editing.name, short_name: editing.short_name,
        country: editing.country, country_code: editing.country_code,
        continent: editing.continent, fifa_ranking: editing.fifa_ranking,
        qualified_wc_2026: editing.qualified_wc_2026, head_coach: editing.head_coach,
        founded_year: editing.founded_year,
      });
      const confName = confederations.find((c) => c.id === updated.confederation_id)?.name ?? null;
      setItems((prev) => prev.map((x) => (x.id === updated.id ? { ...updated, confederation_name: confName } : x)));
      setEditing(null);
    } finally { setSaving(false); }
  }

  async function handleCreate() {
    if (!newForm.name?.trim()) return;
    setSaving(true);
    try {
      const created = await adminApi.createFederation({ ...newForm, name: newForm.name!.trim() });
      const confName = confederations.find((c) => c.id === created.confederation_id)?.name ?? null;
      setItems((prev) => [...prev, { ...created, confederation_name: confName }]);
      setCreating(false);
      setNewForm({ ...emptyForm });
    } finally { setSaving(false); }
  }

  if (loading) return (
    <div className="flex items-center gap-3 text-[#6B7280] text-sm">
      <span className="btn-spinner" style={{ borderColor: "rgba(107,114,128,0.25)", borderTopColor: "#6B7280" }} />
      Cargando federaciones…
    </div>
  );

  const ConfSelect = ({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) => (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)} className={SELECT_CLS}>
      <option value="">Sin confederación</option>
      {confederations.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
    </select>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-[#F0EDE8] tracking-wide">Federaciones</h1>
          <p className="text-[#6B7280] text-xs mt-0.5">{items.length} registros</p>
        </div>
        <motion.button onClick={() => setCreating(true)}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center gap-2 bg-[#FCD116] text-[#05080F] font-bold px-4 py-2.5 rounded-xl text-sm hover:brightness-110 transition-[filter] duration-200">
          <Plus size={15} weight="bold" />Nueva federación
        </motion.button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-[rgba(252,209,22,0.07)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-[#0C1018]">
            <thead>
              <tr className="border-b border-[rgba(252,209,22,0.07)]">
                {["Nombre", "Código", "Confederación", "Ranking FIFA", "Clasificado", "DT", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] uppercase tracking-[0.15em] font-semibold text-[#6B7280] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
              {items.map((f) => (
                <tr key={f.id} className="hover:bg-[rgba(252,209,22,0.025)] transition-colors duration-150 group">
                  <td className="px-5 py-3 font-medium text-[#F0EDE8] whitespace-nowrap">{f.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-[#FCD116]">{f.country_code ?? "—"}</td>
                  <td className="px-5 py-3 text-[#6B7280]">{f.confederation_name ?? "—"}</td>
                  <td className="px-5 py-3 font-mono text-[#6B7280]">{f.fifa_ranking ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold ${f.qualified_wc_2026 ? "text-[#2DD4BF]" : "text-[#6B7280]"}`}>
                      {f.qualified_wc_2026 ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#6B7280] text-xs">{f.head_coach ?? "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => setEditing(f)} className="flex items-center gap-1 text-xs text-[#FCD116] hover:text-white transition-colors">
                        <PencilSimple size={13} weight="bold" />Editar
                      </button>
                      <button onClick={() => handleDelete(f.id)} className="flex items-center gap-1 text-xs text-[#CE1126] hover:text-red-400 transition-colors">
                        <Trash size={13} weight="bold" />Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <AdminModal title={`Editar: ${editing.name}`} onClose={() => setEditing(null)}>
            <FormField label="Confederación">
              <ConfSelect value={editing.confederation_id} onChange={(v) => setEditing({ ...editing, confederation_id: v })} />
            </FormField>
            {(["name","short_name","country","country_code","continent","head_coach"] as const).map((key) => (
              <FormField key={key} label={key.replace(/_/g, " ")}>
                <input type="text" value={(editing[key] as string | null) ?? ""}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value || null })}
                  className={INPUT_CLS} />
              </FormField>
            ))}
            {(["fifa_ranking","founded_year"] as const).map((key) => (
              <FormField key={key} label={key.replace(/_/g, " ")}>
                <input type="number" value={(editing[key] as number | null) ?? ""}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value ? Number(e.target.value) : null })}
                  className={INPUT_CLS} />
              </FormField>
            ))}
            <Toggle checked={editing.qualified_wc_2026}
              onChange={(v) => setEditing({ ...editing, qualified_wc_2026: v })}
              label="Clasificado WC 2026" />
            <ModalActions onCancel={() => setEditing(null)} onConfirm={handleUpdate} saving={saving} label="Guardar" />
          </AdminModal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {creating && (
          <AdminModal title="Nueva federación" onClose={() => setCreating(false)}>
            <FormField label="Confederación">
              <ConfSelect value={newForm.confederation_id ?? null}
                onChange={(v) => setNewForm({ ...newForm, confederation_id: v })} />
            </FormField>
            {(["name","short_name","country","country_code","continent","head_coach"] as const).map((key) => (
              <FormField key={key} label={key.replace(/_/g, " ")}>
                <input type="text" value={(newForm[key] as string | null) ?? ""}
                  onChange={(e) => setNewForm({ ...newForm, [key]: e.target.value || null })}
                  className={INPUT_CLS} />
              </FormField>
            ))}
            {(["fifa_ranking","founded_year"] as const).map((key) => (
              <FormField key={key} label={key.replace(/_/g, " ")}>
                <input type="number" value={(newForm[key] as number | null) ?? ""}
                  onChange={(e) => setNewForm({ ...newForm, [key]: e.target.value ? Number(e.target.value) : null })}
                  className={INPUT_CLS} />
              </FormField>
            ))}
            <Toggle checked={newForm.qualified_wc_2026 ?? false}
              onChange={(v) => setNewForm({ ...newForm, qualified_wc_2026: v })}
              label="Clasificado WC 2026" />
            <ModalActions onCancel={() => setCreating(false)} onConfirm={handleCreate}
              saving={saving} disabled={!newForm.name?.trim()} label="Crear" />
          </AdminModal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Shared UI helpers ──────────────────────────────────────

function AdminModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="bg-[#0C1018] border border-[rgba(252,209,22,0.1)] rounded-2xl p-6 w-full max-w-sm shadow-[0_0_80px_rgba(0,0,0,0.7)] space-y-4 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#F0EDE8] tracking-wide">{title}</h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#F0EDE8] transition-colors p-1"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-[#6B7280] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-[#F0EDE8]/80 group-hover:text-[#F0EDE8] transition-colors">{label}</span>
      <div onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-none cursor-pointer ${checked ? "bg-[#FCD116]" : "bg-[#1C2333]"}`}>
        <motion.div animate={{ x: checked ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
      </div>
    </label>
  );
}

function ModalActions({ onCancel, onConfirm, saving, disabled, label }: {
  onCancel: () => void; onConfirm: () => void; saving: boolean; disabled?: boolean; label: string;
}) {
  return (
    <div className="flex gap-3 justify-end pt-2">
      <button onClick={onCancel} className="text-sm text-[#6B7280] hover:text-[#F0EDE8] transition-colors">Cancelar</button>
      <motion.button onClick={onConfirm} disabled={saving || disabled}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="bg-[#FCD116] text-[#05080F] font-bold px-5 py-2 rounded-xl text-sm hover:brightness-110 transition-[filter] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
        {saving
          ? <><span className="btn-spinner" style={{ borderColor: "rgba(5,8,15,0.2)", borderTopColor: "#05080F" }} />{label === "Guardar" ? "Guardando…" : "Creando…"}</>
          : label}
      </motion.button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/admin/federations/page.tsx
git commit -m "feat: add admin federations CRUD page"
```

---

## Task 7: Frontend — Actualizar nav y dashboard del admin

**Files:**
- Modify: `frontend/src/app/admin/layout.tsx`
- Modify: `frontend/src/app/admin/page.tsx`

- [ ] **Step 1: Actualizar el array NAV en `layout.tsx`**

Localizar el array `NAV` en `frontend/src/app/admin/layout.tsx` y reemplazarlo:

```typescript
import { SquaresFour, UsersThree, Buildings, Flag, Globe, SignOut, ArrowLeft } from "@phosphor-icons/react";

const NAV = [
  { href: "/admin",                label: "Dashboard",      Icon: SquaresFour },
  { href: "/admin/players",        label: "Jugadores",      Icon: UsersThree  },
  { href: "/admin/clubs",          label: "Clubes",         Icon: Buildings   },
  { href: "/admin/federations",    label: "Federaciones",   Icon: Flag        },
  { href: "/admin/confederations", label: "Confederaciones", Icon: Globe      },
];
```

- [ ] **Step 2: Actualizar el dashboard en `page.tsx`**

Reemplazar el array `SECTIONS` en `frontend/src/app/admin/page.tsx`:

```typescript
import { UsersThree, Buildings, Flag, Globe, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const SECTIONS = [
  {
    href:    "/admin/players",
    label:   "Jugadores",
    desc:    "Gestionar prelista, posiciones y camisetas",
    Icon:    UsersThree,
    accent:  "from-[rgba(0,48,135,0.15)] to-[rgba(13,148,136,0.08)]",
    border:  "border-[rgba(0,48,135,0.3)]",
    iconClr: "text-[#6B9FFF]",
  },
  {
    href:    "/admin/clubs",
    label:   "Clubes",
    desc:    "Gestionar clubes, ciudades y ligas",
    Icon:    Buildings,
    accent:  "from-[rgba(252,209,22,0.08)] to-[rgba(206,17,38,0.06)]",
    border:  "border-[rgba(252,209,22,0.15)]",
    iconClr: "text-[#FCD116]",
  },
  {
    href:    "/admin/federations",
    label:   "Federaciones",
    desc:    "Gestionar selecciones y datos FIFA",
    Icon:    Flag,
    accent:  "from-[rgba(13,148,136,0.12)] to-[rgba(0,48,135,0.06)]",
    border:  "border-[rgba(13,148,136,0.25)]",
    iconClr: "text-[#2DD4BF]",
  },
  {
    href:    "/admin/confederations",
    label:   "Confederaciones",
    desc:    "Gestionar CONMEBOL, UEFA y otras",
    Icon:    Globe,
    accent:  "from-[rgba(206,17,38,0.1)] to-[rgba(252,209,22,0.05)]",
    border:  "border-[rgba(206,17,38,0.25)]",
    iconClr: "text-[#FF6B6B]",
  },
];
```

También cambiar el grid del dashboard de `grid-cols-1 sm:grid-cols-2` a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-2` (sigue 2 columnas, ahora 4 cards).

- [ ] **Step 3: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 4: Commit final**

```bash
git add frontend/src/app/admin/layout.tsx frontend/src/app/admin/page.tsx
git commit -m "feat: add confederations and federations to admin nav and dashboard"
```

---

## Checklist de verificación manual

Después de ejecutar todos los tasks, verificar en el browser:

1. `/admin` → Dashboard muestra 4 cards (Jugadores, Clubes, Federaciones, Confederaciones)
2. `/admin/confederations` → Tabla con los datos seeded, botón "Nueva confederación" abre modal
3. `/admin/federations` → Tabla con country_code en amarillo, badge Clasificado en verde/gris, select de confederación funciona en modal
4. Crear un registro en cada sección → aparece en tabla sin recargar
5. Editar → modal prefilled → guardar actualiza la fila
6. Eliminar → desaparece de la tabla
7. En mobile: el nav horizontal del admin muestra las nuevas secciones
