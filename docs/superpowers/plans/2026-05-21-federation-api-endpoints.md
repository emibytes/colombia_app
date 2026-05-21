# Federation API Endpoints — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir los endpoints REST que exponen confederaciones, federaciones, clubes y jugadores al frontend Next.js, con tests de feature sobre SQLite in-memory.

**Architecture:** Resource Controllers separados por entidad, API Resources para transformar JSON, Eloquent eager loading para evitar N+1. Los tests usan `RefreshDatabase` + factories sobre SQLite (phpunit.xml ya lo configura). No se toca la lógica existente de `selections/votes`.

**Tech Stack:** Laravel 11, PHPUnit (SQLite in-memory), Laravel API Resources, Eloquent Factories

---

## Mapa de archivos

| Acción | Archivo |
|--------|---------|
| Crear | `database/factories/ConfederationFactory.php` |
| Crear | `database/factories/FederationFactory.php` |
| Crear | `database/factories/ClubFactory.php` |
| Crear | `database/factories/PlayerFactory.php` |
| Crear | `app/Http/Resources/ConfederationResource.php` |
| Crear | `app/Http/Resources/FederationResource.php` |
| Crear | `app/Http/Resources/ClubResource.php` |
| Crear | `app/Http/Resources/PlayerResource.php` |
| Crear | `app/Http/Controllers/Api/ConfederationController.php` |
| Crear | `app/Http/Controllers/Api/FederationController.php` |
| Crear | `app/Http/Controllers/Api/ClubController.php` |
| Crear | `app/Http/Controllers/Api/PlayerController.php` |
| Modificar | `routes/api.php` |
| Crear | `tests/Feature/ConfederationApiTest.php` |
| Crear | `tests/Feature/FederationApiTest.php` |
| Crear | `tests/Feature/ClubApiTest.php` |
| Crear | `tests/Feature/PlayerApiTest.php` |

## Endpoints resultantes

```
GET /api/confederations
GET /api/federations
GET /api/federations/{code}           # code = ISO alpha-3: COL, ARG…
GET /api/federations/{code}/players   # ?position=goalkeeper&prelista=true
GET /api/clubs                        # ?country_code=COL
GET /api/players/{slug}               # slug: luis-diaz, james-rodriguez…
```

---

## Task 1: Model Factories

**Files:**
- Create: `database/factories/ConfederationFactory.php`
- Create: `database/factories/FederationFactory.php`
- Create: `database/factories/ClubFactory.php`
- Create: `database/factories/PlayerFactory.php`

- [ ] **Step 1.1 — Crear ConfederationFactory**

```php
<?php
// database/factories/ConfederationFactory.php

namespace Database\Factories;

use App\Models\Confederation;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConfederationFactory extends Factory
{
    protected $model = Confederation::class;

    public function definition(): array
    {
        return [
            'name'                 => $this->faker->unique()->regexify('[A-Z]{3,8}'),
            'full_name'            => $this->faker->company() . ' Football Confederation',
            'region'               => $this->faker->randomElement(['South America', 'Europe', 'Africa', 'Asia', 'North America', 'Oceania']),
            'president'            => $this->faker->name(),
            'headquarters_city'    => $this->faker->city(),
            'headquarters_country' => $this->faker->country(),
            'founded_year'         => $this->faker->numberBetween(1900, 1970),
            'member_nations'       => $this->faker->numberBetween(10, 55),
            'website'              => $this->faker->url(),
            'logo_url'             => null,
        ];
    }
}
```

- [ ] **Step 1.2 — Añadir hasFactory a Confederation model**

Abrir `app/Models/Confederation.php` y añadir el trait:

```php
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Confederation extends Model
{
    use HasFactory;
    // … resto igual
}
```

- [ ] **Step 1.3 — Crear FederationFactory**

```php
<?php
// database/factories/FederationFactory.php

namespace Database\Factories;

use App\Models\Confederation;
use App\Models\Federation;
use Illuminate\Database\Eloquent\Factories\Factory;

class FederationFactory extends Factory
{
    protected $model = Federation::class;

    public function definition(): array
    {
        return [
            'confederation_id'    => Confederation::factory(),
            'name'                => $this->faker->country() . ' Football Federation',
            'short_name'          => $this->faker->unique()->regexify('[A-Z]{2,4}'),
            'country'             => $this->faker->country(),
            'country_code'        => $this->faker->unique()->regexify('[A-Z]{3}'),
            'continent'           => $this->faker->randomElement(['South America', 'Europe', 'Africa', 'Asia', 'North America', 'Oceania']),
            'city'                => $this->faker->city(),
            'president'           => $this->faker->name(),
            'head_coach'          => $this->faker->name(),
            'founded_year'        => $this->faker->numberBetween(1890, 1960),
            'fifa_ranking'        => $this->faker->numberBetween(1, 210),
            'world_cup_appearances' => $this->faker->numberBetween(0, 22),
            'world_cup_titles'    => 0,
            'best_result'         => 'Primera ronda',
            'national_stadium'    => $this->faker->city() . ' Stadium',
            'stadium_capacity'    => $this->faker->numberBetween(10000, 90000),
            'primary_color'       => '#' . $this->faker->hexColor(),
            'secondary_color'     => '#' . $this->faker->hexColor(),
            'website'             => $this->faker->url(),
            'logo_url'            => null,
            'latitude'            => $this->faker->latitude(),
            'longitude'           => $this->faker->longitude(),
            'qualified_wc_2026'   => false,
        ];
    }

    public function qualified(): static
    {
        return $this->state(['qualified_wc_2026' => true]);
    }
}
```

- [ ] **Step 1.4 — Añadir hasFactory a Federation model**

```php
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Federation extends Model
{
    use HasFactory;
    // … resto igual
}
```

- [ ] **Step 1.5 — Crear ClubFactory**

```php
<?php
// database/factories/ClubFactory.php

namespace Database\Factories;

use App\Models\Club;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClubFactory extends Factory
{
    protected $model = Club::class;

    public function definition(): array
    {
        return [
            'federation_id'    => null,
            'name'             => $this->faker->company() . ' FC',
            'short_name'       => $this->faker->word(),
            'country'          => $this->faker->country(),
            'country_code'     => $this->faker->regexify('[A-Z]{3}'),
            'city'             => $this->faker->city(),
            'stadium_name'     => $this->faker->city() . ' Stadium',
            'stadium_capacity' => $this->faker->numberBetween(5000, 90000),
            'founded_year'     => $this->faker->numberBetween(1880, 2010),
            'league_name'      => $this->faker->word() . ' League',
            'logo_url'         => null,
            'website'          => $this->faker->url(),
            'latitude'         => $this->faker->latitude(),
            'longitude'        => $this->faker->longitude(),
        ];
    }
}
```

- [ ] **Step 1.6 — Añadir hasFactory a Club model**

```php
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Club extends Model
{
    use HasFactory;
    // … resto igual
}
```

- [ ] **Step 1.7 — Crear PlayerFactory**

```php
<?php
// database/factories/PlayerFactory.php

namespace Database\Factories;

use App\Models\Club;
use App\Models\Federation;
use App\Models\Player;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PlayerFactory extends Factory
{
    protected $model = Player::class;

    public function definition(): array
    {
        $first = $this->faker->firstName('male');
        $last  = $this->faker->lastName();
        $full  = $first . ' ' . $last;

        return [
            'federation_id'       => Federation::factory(),
            'club_id'             => Club::factory(),
            'first_name'          => $first,
            'last_name'           => $last,
            'full_name'           => $full,
            'slug'                => Str::slug($full) . '-' . $this->faker->unique()->randomNumber(5),
            'photo_url'           => null,
            'position'            => $this->faker->randomElement(['goalkeeper', 'defender', 'midfielder', 'forward']),
            'jersey_number'       => null,
            'date_of_birth'       => $this->faker->dateTimeBetween('-38 years', '-18 years')->format('Y-m-d'),
            'place_of_birth'      => $this->faker->city() . ', Colombia',
            'nationality'         => 'Colombia',
            'height_cm'           => $this->faker->numberBetween(165, 200),
            'weight_kg'           => $this->faker->numberBetween(60, 95),
            'international_caps'  => $this->faker->numberBetween(0, 120),
            'international_goals' => $this->faker->numberBetween(0, 30),
            'strong_foot'         => $this->faker->randomElement(['left', 'right']),
            'active'              => true,
            'in_wc_prelista_2026' => false,
        ];
    }

    public function inPrelista(): static
    {
        return $this->state(['in_wc_prelista_2026' => true]);
    }

    public function goalkeeper(): static
    {
        return $this->state(['position' => 'goalkeeper']);
    }

    public function defender(): static
    {
        return $this->state(['position' => 'defender']);
    }

    public function midfielder(): static
    {
        return $this->state(['position' => 'midfielder']);
    }

    public function forward(): static
    {
        return $this->state(['position' => 'forward']);
    }
}
```

- [ ] **Step 1.8 — Añadir hasFactory a Player model**

```php
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Player extends Model
{
    use HasFactory;
    // … resto igual
}
```

- [ ] **Step 1.9 — Verificar que las factories funcionan**

```bash
cd backend
/d/xampp/php/php.exe artisan tinker --execute="
\App\Models\Player::factory()->make()->toArray();
"
```

Salida esperada: array con todos los campos del player sin errores.

- [ ] **Step 1.10 — Commit**

```bash
git add database/factories/ app/Models/
git commit -m "feat: add model factories for Confederation, Federation, Club, Player"
```

---

## Task 2: API Resources

**Files:**
- Create: `app/Http/Resources/ConfederationResource.php`
- Create: `app/Http/Resources/FederationResource.php`
- Create: `app/Http/Resources/ClubResource.php`
- Create: `app/Http/Resources/PlayerResource.php`

- [ ] **Step 2.1 — Crear ConfederationResource**

```php
<?php
// app/Http/Resources/ConfederationResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConfederationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'name'                 => $this->name,
            'full_name'            => $this->full_name,
            'region'               => $this->region,
            'president'            => $this->president,
            'headquarters_city'    => $this->headquarters_city,
            'headquarters_country' => $this->headquarters_country,
            'founded_year'         => $this->founded_year,
            'member_nations'       => $this->member_nations,
            'website'              => $this->website,
            'logo_url'             => $this->logo_url,
            'federations_count'    => $this->whenCounted('federations'),
        ];
    }
}
```

- [ ] **Step 2.2 — Crear FederationResource**

```php
<?php
// app/Http/Resources/FederationResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FederationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'name'                  => $this->name,
            'short_name'            => $this->short_name,
            'country'               => $this->country,
            'country_code'          => $this->country_code,
            'continent'             => $this->continent,
            'city'                  => $this->city,
            'president'             => $this->president,
            'head_coach'            => $this->head_coach,
            'founded_year'          => $this->founded_year,
            'fifa_ranking'          => $this->fifa_ranking,
            'world_cup_appearances' => $this->world_cup_appearances,
            'world_cup_titles'      => $this->world_cup_titles,
            'best_result'           => $this->best_result,
            'national_stadium'      => $this->national_stadium,
            'stadium_capacity'      => $this->stadium_capacity,
            'primary_color'         => $this->primary_color,
            'secondary_color'       => $this->secondary_color,
            'website'               => $this->website,
            'logo_url'              => $this->logo_url,
            'coordinates'           => [
                'lat' => $this->latitude,
                'lng' => $this->longitude,
            ],
            'qualified_wc_2026'     => $this->qualified_wc_2026,
            'confederation'         => new ConfederationResource($this->whenLoaded('confederation')),
        ];
    }
}
```

- [ ] **Step 2.3 — Crear ClubResource**

```php
<?php
// app/Http/Resources/ClubResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClubResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'short_name'       => $this->short_name,
            'country'          => $this->country,
            'country_code'     => $this->country_code,
            'city'             => $this->city,
            'stadium_name'     => $this->stadium_name,
            'stadium_capacity' => $this->stadium_capacity,
            'founded_year'     => $this->founded_year,
            'league_name'      => $this->league_name,
            'logo_url'         => $this->logo_url,
            'coordinates'      => [
                'lat' => $this->latitude,
                'lng' => $this->longitude,
            ],
            'federation'       => $this->whenLoaded('federation', fn () => [
                'id'         => $this->federation->id,
                'short_name' => $this->federation->short_name,
                'country'    => $this->federation->country,
                'logo_url'   => $this->federation->logo_url,
            ]),
        ];
    }
}
```

- [ ] **Step 2.4 — Crear PlayerResource**

```php
<?php
// app/Http/Resources/PlayerResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlayerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'first_name'          => $this->first_name,
            'last_name'           => $this->last_name,
            'full_name'           => $this->full_name,
            'slug'                => $this->slug,
            'photo_url'           => $this->photo_url,
            'position'            => $this->position,
            'jersey_number'       => $this->jersey_number,
            'date_of_birth'       => $this->date_of_birth?->format('Y-m-d'),
            'age'                 => $this->date_of_birth?->age,
            'place_of_birth'      => $this->place_of_birth,
            'nationality'         => $this->nationality,
            'height_cm'           => $this->height_cm,
            'weight_kg'           => $this->weight_kg,
            'international_caps'  => $this->international_caps,
            'international_goals' => $this->international_goals,
            'strong_foot'         => $this->strong_foot,
            'active'              => $this->active,
            'in_wc_prelista_2026' => $this->in_wc_prelista_2026,
            'club'                => $this->whenLoaded('club', fn () => new ClubResource($this->club)),
            'federation'          => $this->whenLoaded('federation', fn () => [
                'id'         => $this->federation->id,
                'short_name' => $this->federation->short_name,
                'country'    => $this->federation->country,
            ]),
        ];
    }
}
```

- [ ] **Step 2.5 — Commit**

```bash
git add app/Http/Resources/
git commit -m "feat: add API resources for Confederation, Federation, Club, Player"
```

---

## Task 3: Confederation API

**Files:**
- Create: `app/Http/Controllers/Api/ConfederationController.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/ConfederationApiTest.php`

- [ ] **Step 3.1 — Escribir el test (debe fallar)**

```php
<?php
// tests/Feature/ConfederationApiTest.php

namespace Tests\Feature;

use App\Models\Confederation;
use App\Models\Federation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConfederationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_lists_all_confederations(): void
    {
        Confederation::factory()->count(3)->create();

        $this->getJson('/api/confederations')
             ->assertOk()
             ->assertJsonCount(3, 'data')
             ->assertJsonStructure(['data' => [['id', 'name', 'full_name', 'region', 'member_nations']]]);
    }

    public function test_includes_federation_count(): void
    {
        $conf = Confederation::factory()->create();
        Federation::factory()->count(4)->create(['confederation_id' => $conf->id]);

        $this->getJson('/api/confederations')
             ->assertOk()
             ->assertJsonPath('data.0.federations_count', 4);
    }

    public function test_returns_empty_when_no_confederations(): void
    {
        $this->getJson('/api/confederations')
             ->assertOk()
             ->assertJsonCount(0, 'data');
    }
}
```

- [ ] **Step 3.2 — Correr el test para confirmar que falla**

```bash
cd backend
/d/xampp/php/php.exe artisan test tests/Feature/ConfederationApiTest.php --verbose
```

Salida esperada: `FAIL` — 404 porque la ruta no existe aún.

- [ ] **Step 3.3 — Crear ConfederationController**

```php
<?php
// app/Http/Controllers/Api/ConfederationController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConfederationResource;
use App\Models\Confederation;
use Illuminate\Http\JsonResponse;

class ConfederationController extends Controller
{
    public function index(): JsonResponse
    {
        $confederations = Confederation::withCount('federations')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => ConfederationResource::collection($confederations)]);
    }
}
```

- [ ] **Step 3.4 — Añadir ruta**

Reemplazar el contenido de `routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\ConfederationController;
use App\Http\Controllers\Api\ClubController;
use App\Http\Controllers\Api\FederationController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\SelectionController;
use Illuminate\Support\Facades\Route;

// ── Selecciones (existente) ───────────────────────────────────────────────
Route::prefix('selections')->group(function () {
    Route::post('/',     [SelectionController::class, 'store']);
    Route::get('/stats', [SelectionController::class, 'stats']);
});

// ── Confederaciones ───────────────────────────────────────────────────────
Route::get('confederations', [ConfederationController::class, 'index']);

// ── Federaciones (se añaden en Task 4) ───────────────────────────────────
// Route::get('federations', ...);

// ── Clubes (se añaden en Task 5) ─────────────────────────────────────────
// Route::get('clubs', ...);

// ── Jugadores (se añaden en Task 6) ──────────────────────────────────────
// Route::get('players/{slug}', ...);
```

- [ ] **Step 3.5 — Correr tests para confirmar que pasan**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/ConfederationApiTest.php --verbose
```

Salida esperada:
```
PASS  Tests\Feature\ConfederationApiTest
✓ lists all confederations
✓ includes federation count
✓ returns empty when no confederations
```

- [ ] **Step 3.6 — Commit**

```bash
git add app/Http/Controllers/Api/ConfederationController.php routes/api.php tests/Feature/ConfederationApiTest.php
git commit -m "feat: GET /api/confederations with federation count"
```

---

## Task 4: Federation API

**Files:**
- Create: `app/Http/Controllers/Api/FederationController.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/FederationApiTest.php`

- [ ] **Step 4.1 — Escribir el test (debe fallar)**

```php
<?php
// tests/Feature/FederationApiTest.php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\Confederation;
use App\Models\Federation;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FederationApiTest extends TestCase
{
    use RefreshDatabase;

    // ── index ─────────────────────────────────────────────────────────────

    public function test_lists_all_federations(): void
    {
        Federation::factory()->count(5)->create();

        $this->getJson('/api/federations')
             ->assertOk()
             ->assertJsonCount(5, 'data')
             ->assertJsonStructure(['data' => [['id', 'name', 'country_code', 'continent', 'qualified_wc_2026']]]);
    }

    public function test_filters_by_qualified_wc_2026(): void
    {
        Federation::factory()->count(3)->create(['qualified_wc_2026' => false]);
        Federation::factory()->count(2)->qualified()->create();

        $this->getJson('/api/federations?qualified_wc_2026=true')
             ->assertOk()
             ->assertJsonCount(2, 'data');
    }

    public function test_filters_by_continent(): void
    {
        Federation::factory()->count(2)->create(['continent' => 'Europe']);
        Federation::factory()->count(3)->create(['continent' => 'South America']);

        $this->getJson('/api/federations?continent=Europe')
             ->assertOk()
             ->assertJsonCount(2, 'data');
    }

    public function test_filters_by_confederation_name(): void
    {
        $conmebol = Confederation::factory()->create(['name' => 'CONMEBOL']);
        $uefa     = Confederation::factory()->create(['name' => 'UEFA']);

        Federation::factory()->count(3)->create(['confederation_id' => $conmebol->id]);
        Federation::factory()->count(5)->create(['confederation_id' => $uefa->id]);

        $this->getJson('/api/federations?confederation=CONMEBOL')
             ->assertOk()
             ->assertJsonCount(3, 'data');
    }

    public function test_index_includes_confederation(): void
    {
        $conf = Confederation::factory()->create(['name' => 'CONMEBOL']);
        Federation::factory()->create(['confederation_id' => $conf->id]);

        $this->getJson('/api/federations')
             ->assertOk()
             ->assertJsonPath('data.0.confederation.name', 'CONMEBOL');
    }

    // ── show ──────────────────────────────────────────────────────────────

    public function test_shows_federation_by_country_code(): void
    {
        $fed = Federation::factory()->create(['country_code' => 'COL', 'country' => 'Colombia']);

        $this->getJson('/api/federations/COL')
             ->assertOk()
             ->assertJsonPath('data.country_code', 'COL')
             ->assertJsonPath('data.id', $fed->id);
    }

    public function test_show_is_case_insensitive(): void
    {
        Federation::factory()->create(['country_code' => 'COL']);

        $this->getJson('/api/federations/col')->assertOk();
    }

    public function test_show_returns_404_for_unknown_code(): void
    {
        $this->getJson('/api/federations/XXX')->assertNotFound();
    }

    public function test_show_includes_coordinates(): void
    {
        Federation::factory()->create([
            'country_code' => 'COL',
            'latitude'     => 4.7110,
            'longitude'    => -74.0721,
        ]);

        $this->getJson('/api/federations/COL')
             ->assertOk()
             ->assertJsonPath('data.coordinates.lat', 4.711)
             ->assertJsonPath('data.coordinates.lng', -74.0721);
    }

    // ── players subresource ───────────────────────────────────────────────

    public function test_lists_players_of_a_federation(): void
    {
        $fed = Federation::factory()->create(['country_code' => 'COL']);
        Player::factory()->count(6)->create(['federation_id' => $fed->id]);

        $this->getJson('/api/federations/COL/players')
             ->assertOk()
             ->assertJsonCount(6, 'data');
    }

    public function test_players_does_not_return_other_federations_players(): void
    {
        $col = Federation::factory()->create(['country_code' => 'COL']);
        $arg = Federation::factory()->create(['country_code' => 'ARG']);

        Player::factory()->count(3)->create(['federation_id' => $col->id]);
        Player::factory()->count(5)->create(['federation_id' => $arg->id]);

        $this->getJson('/api/federations/COL/players')
             ->assertOk()
             ->assertJsonCount(3, 'data');
    }

    public function test_players_filtered_by_position(): void
    {
        $fed = Federation::factory()->create(['country_code' => 'COL']);
        Player::factory()->count(6)->goalkeeper()->create(['federation_id' => $fed->id]);
        Player::factory()->count(11)->defender()->create(['federation_id' => $fed->id]);

        $this->getJson('/api/federations/COL/players?position=goalkeeper')
             ->assertOk()
             ->assertJsonCount(6, 'data');
    }

    public function test_players_filtered_by_prelista(): void
    {
        $fed = Federation::factory()->create(['country_code' => 'COL']);
        Player::factory()->count(55)->inPrelista()->create(['federation_id' => $fed->id]);
        Player::factory()->count(10)->create(['federation_id' => $fed->id]);

        $this->getJson('/api/federations/COL/players?prelista=true')
             ->assertOk()
             ->assertJsonCount(55, 'data');
    }

    public function test_players_includes_club_data(): void
    {
        $club = Club::factory()->create(['name' => 'Bayern Munich']);
        $fed  = Federation::factory()->create(['country_code' => 'COL']);
        Player::factory()->create(['federation_id' => $fed->id, 'club_id' => $club->id]);

        $this->getJson('/api/federations/COL/players')
             ->assertOk()
             ->assertJsonPath('data.0.club.name', 'Bayern Munich');
    }

    public function test_players_response_has_age_field(): void
    {
        $fed = Federation::factory()->create(['country_code' => 'COL']);
        Player::factory()->create([
            'federation_id' => $fed->id,
            'date_of_birth' => '1991-07-12',
        ]);

        $response = $this->getJson('/api/federations/COL/players')->assertOk();
        $this->assertIsInt($response->json('data.0.age'));
    }
}
```

- [ ] **Step 4.2 — Correr el test para confirmar que falla**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/FederationApiTest.php --verbose
```

Salida esperada: todos `FAIL` con 404.

- [ ] **Step 4.3 — Crear FederationController**

```php
<?php
// app/Http/Controllers/Api/FederationController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FederationResource;
use App\Http\Resources\PlayerResource;
use App\Models\Federation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FederationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $federations = Federation::with('confederation')
            ->when($request->confederation, fn ($q, $v) =>
                $q->whereHas('confederation', fn ($q2) => $q2->where('name', $v))
            )
            ->when($request->continent, fn ($q, $v) => $q->where('continent', $v))
            ->when($request->boolean('qualified_wc_2026'), fn ($q) => $q->where('qualified_wc_2026', true))
            ->orderBy('fifa_ranking')
            ->get();

        return response()->json(['data' => FederationResource::collection($federations)]);
    }

    public function show(string $code): JsonResponse
    {
        $federation = Federation::with('confederation')
            ->where('country_code', strtoupper($code))
            ->firstOrFail();

        return response()->json(['data' => new FederationResource($federation)]);
    }

    public function players(Request $request, string $code): JsonResponse
    {
        $federation = Federation::where('country_code', strtoupper($code))->firstOrFail();

        $players = $federation->players()
            ->with('club')
            ->when($request->position, fn ($q, $v) => $q->where('position', $v))
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
}
```

> **Nota sobre CASE vs FIELD:** Se usa `CASE` en lugar de `FIELD()` porque `FIELD()` es MySQL-specific y los tests corren en SQLite. `CASE` funciona en ambos.

- [ ] **Step 4.4 — Añadir rutas**

Reemplazar las líneas comentadas de federaciones en `routes/api.php`:

```php
// ── Federaciones ──────────────────────────────────────────────────────────
Route::prefix('federations')->group(function () {
    Route::get('/',                [FederationController::class, 'index']);
    Route::get('/{code}',          [FederationController::class, 'show']);
    Route::get('/{code}/players',  [FederationController::class, 'players']);
});
```

- [ ] **Step 4.5 — Correr tests**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/FederationApiTest.php --verbose
```

Salida esperada: todos `PASS`.

- [ ] **Step 4.6 — Commit**

```bash
git add app/Http/Controllers/Api/FederationController.php routes/api.php tests/Feature/FederationApiTest.php
git commit -m "feat: GET /api/federations, /api/federations/{code}, /api/federations/{code}/players"
```

---

## Task 5: Club API

**Files:**
- Create: `app/Http/Controllers/Api/ClubController.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/ClubApiTest.php`

- [ ] **Step 5.1 — Escribir el test (debe fallar)**

```php
<?php
// tests/Feature/ClubApiTest.php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\Federation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClubApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_lists_all_clubs(): void
    {
        Club::factory()->count(5)->create();

        $this->getJson('/api/clubs')
             ->assertOk()
             ->assertJsonCount(5, 'data')
             ->assertJsonStructure(['data' => [['id', 'name', 'country', 'city', 'coordinates']]]);
    }

    public function test_filters_by_country_code(): void
    {
        Club::factory()->count(3)->create(['country_code' => 'COL']);
        Club::factory()->count(2)->create(['country_code' => 'BRA']);

        $this->getJson('/api/clubs?country_code=COL')
             ->assertOk()
             ->assertJsonCount(3, 'data');
    }

    public function test_country_code_filter_is_case_insensitive(): void
    {
        Club::factory()->count(2)->create(['country_code' => 'COL']);

        $this->getJson('/api/clubs?country_code=col')
             ->assertOk()
             ->assertJsonCount(2, 'data');
    }

    public function test_filters_by_federation_id(): void
    {
        $fed = Federation::factory()->create();
        Club::factory()->count(3)->create(['federation_id' => $fed->id]);
        Club::factory()->count(4)->create(['federation_id' => null]);

        $this->getJson('/api/clubs?federation_id=' . $fed->id)
             ->assertOk()
             ->assertJsonCount(3, 'data');
    }

    public function test_club_includes_federation_when_linked(): void
    {
        $fed  = Federation::factory()->create(['short_name' => 'FCF', 'country' => 'Colombia']);
        $club = Club::factory()->create(['federation_id' => $fed->id]);

        $this->getJson('/api/clubs')
             ->assertOk()
             ->assertJsonPath('data.0.federation.short_name', 'FCF');
    }

    public function test_club_federation_is_null_when_not_linked(): void
    {
        Club::factory()->create(['federation_id' => null]);

        $this->getJson('/api/clubs')
             ->assertOk()
             ->assertJsonPath('data.0.federation', null);
    }

    public function test_clubs_ordered_by_name(): void
    {
        Club::factory()->create(['name' => 'Zenit']);
        Club::factory()->create(['name' => 'Atlético Nacional']);
        Club::factory()->create(['name' => 'Bayern Munich']);

        $response = $this->getJson('/api/clubs')->assertOk();

        $names = collect($response->json('data'))->pluck('name')->values()->all();
        $this->assertEquals(['Atlético Nacional', 'Bayern Munich', 'Zenit'], $names);
    }
}
```

- [ ] **Step 5.2 — Correr el test para confirmar que falla**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/ClubApiTest.php --verbose
```

Salida esperada: todos `FAIL` con 404.

- [ ] **Step 5.3 — Crear ClubController**

```php
<?php
// app/Http/Controllers/Api/ClubController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClubResource;
use App\Models\Club;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClubController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $clubs = Club::with('federation')
            ->when($request->country_code, fn ($q, $v) => $q->where('country_code', strtoupper($v)))
            ->when($request->federation_id, fn ($q, $v) => $q->where('federation_id', $v))
            ->orderBy('name')
            ->get();

        return response()->json(['data' => ClubResource::collection($clubs)]);
    }
}
```

- [ ] **Step 5.4 — Añadir ruta**

```php
// ── Clubes ────────────────────────────────────────────────────────────────
Route::get('clubs', [ClubController::class, 'index']);
```

- [ ] **Step 5.5 — Correr tests**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/ClubApiTest.php --verbose
```

Salida esperada: todos `PASS`.

- [ ] **Step 5.6 — Commit**

```bash
git add app/Http/Controllers/Api/ClubController.php routes/api.php tests/Feature/ClubApiTest.php
git commit -m "feat: GET /api/clubs with country_code and federation_id filters"
```

---

## Task 6: Player API

**Files:**
- Create: `app/Http/Controllers/Api/PlayerController.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/PlayerApiTest.php`

- [ ] **Step 6.1 — Escribir el test (debe fallar)**

```php
<?php
// tests/Feature/PlayerApiTest.php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\Federation;
use App\Models\Player;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_shows_player_by_slug(): void
    {
        $player = Player::factory()->create(['slug' => 'luis-diaz-12345']);

        $this->getJson('/api/players/luis-diaz-12345')
             ->assertOk()
             ->assertJsonPath('data.slug', 'luis-diaz-12345')
             ->assertJsonPath('data.id', $player->id);
    }

    public function test_player_response_includes_full_structure(): void
    {
        Player::factory()->create(['slug' => 'james-rodriguez-99']);

        $this->getJson('/api/players/james-rodriguez-99')
             ->assertOk()
             ->assertJsonStructure(['data' => [
                 'id', 'first_name', 'last_name', 'full_name', 'slug',
                 'photo_url', 'position', 'date_of_birth', 'age',
                 'height_cm', 'weight_kg', 'international_caps',
                 'international_goals', 'strong_foot', 'in_wc_prelista_2026',
             ]]);
    }

    public function test_player_response_includes_club(): void
    {
        $club   = Club::factory()->create(['name' => 'Bayern Munich']);
        Player::factory()->create(['slug' => 'luis-diaz-11', 'club_id' => $club->id]);

        $this->getJson('/api/players/luis-diaz-11')
             ->assertOk()
             ->assertJsonPath('data.club.name', 'Bayern Munich');
    }

    public function test_player_response_includes_federation(): void
    {
        $fed = Federation::factory()->create(['short_name' => 'FCF', 'country' => 'Colombia']);
        Player::factory()->create(['slug' => 'david-ospina-22', 'federation_id' => $fed->id]);

        $this->getJson('/api/players/david-ospina-22')
             ->assertOk()
             ->assertJsonPath('data.federation.short_name', 'FCF');
    }

    public function test_player_age_is_integer(): void
    {
        Player::factory()->create([
            'slug'          => 'young-player-55',
            'date_of_birth' => '2001-02-07',
        ]);

        $response = $this->getJson('/api/players/young-player-55')->assertOk();
        $this->assertIsInt($response->json('data.age'));
    }

    public function test_returns_404_for_unknown_slug(): void
    {
        $this->getJson('/api/players/nobody-here')->assertNotFound();
    }
}
```

- [ ] **Step 6.2 — Correr el test para confirmar que falla**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/PlayerApiTest.php --verbose
```

Salida esperada: todos `FAIL` con 404.

- [ ] **Step 6.3 — Crear PlayerController**

```php
<?php
// app/Http/Controllers/Api/PlayerController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlayerResource;
use App\Models\Player;
use Illuminate\Http\JsonResponse;

class PlayerController extends Controller
{
    public function show(string $slug): JsonResponse
    {
        $player = Player::with(['federation', 'club.federation'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json(['data' => new PlayerResource($player)]);
    }
}
```

- [ ] **Step 6.4 — Añadir ruta**

```php
// ── Jugadores ─────────────────────────────────────────────────────────────
Route::get('players/{slug}', [PlayerController::class, 'show']);
```

- [ ] **Step 6.5 — Correr tests**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/PlayerApiTest.php --verbose
```

Salida esperada: todos `PASS`.

- [ ] **Step 6.6 — Commit**

```bash
git add app/Http/Controllers/Api/PlayerController.php routes/api.php tests/Feature/PlayerApiTest.php
git commit -m "feat: GET /api/players/{slug} with club and federation"
```

---

## Task 7: Suite completa + smoke test con datos reales

**Files:**
- No se crea ningún archivo nuevo

- [ ] **Step 7.1 — Correr toda la suite de tests**

```bash
/d/xampp/php/php.exe artisan test --verbose
```

Salida esperada: **todos los tests pasan** (ConfederationApiTest, FederationApiTest, ClubApiTest, PlayerApiTest + los existentes ExampleTest).

- [ ] **Step 7.2 — Smoke test contra la base de datos real (XAMPP corriendo)**

```bash
# Confederaciones
curl -s http://localhost/colombia_app/backend/public/api/confederations | /d/xampp/php/php.exe -r "
    \$r = json_decode(file_get_contents('php://stdin'), true);
    echo count(\$r['data']) . ' confederaciones' . PHP_EOL;
"

# Colombia players prelista
curl -s "http://localhost/colombia_app/backend/public/api/federations/COL/players?prelista=true" | /d/xampp/php/php.exe -r "
    \$r = json_decode(file_get_contents('php://stdin'), true);
    echo count(\$r['data']) . ' jugadores en prelista' . PHP_EOL;
    echo \$r['data'][0]['full_name'] . ' - ' . \$r['data'][0]['position'] . PHP_EOL;
"

# Luis Díaz
curl -s http://localhost/colombia_app/backend/public/api/players/luis-diaz | /d/xampp/php/php.exe -r "
    \$r = json_decode(file_get_contents('php://stdin'), true);
    \$p = \$r['data'];
    echo \$p['full_name'] . ' | ' . \$p['club']['name'] . ' | ' . \$p['age'] . ' años' . PHP_EOL;
"
```

Salida esperada:
```
6 confederaciones
55 jugadores en prelista
David Ospina - goalkeeper
Luis Díaz | Bayern Munich | 28 años
```

> **Nota:** Ajustar la URL base según el virtualhost configurado en XAMPP. Si el backend corre en `http://localhost:8000`, cambiar la URL.

- [ ] **Step 7.3 — Commit final**

```bash
git add -A
git commit -m "feat: complete federation/club/player REST API with full test coverage"
```

---

## Resumen de endpoints disponibles al finalizar

| Método | URL | Filtros disponibles |
|--------|-----|---------------------|
| GET | `/api/confederations` | — |
| GET | `/api/federations` | `?confederation=CONMEBOL`, `?continent=Europe`, `?qualified_wc_2026=true` |
| GET | `/api/federations/{code}` | — (code = COL, ARG, BRA…) |
| GET | `/api/federations/{code}/players` | `?position=goalkeeper`, `?prelista=true` |
| GET | `/api/clubs` | `?country_code=COL`, `?federation_id=1` |
| GET | `/api/players/{slug}` | — (slug = luis-diaz, james-rodriguez…) |
| POST | `/api/selections` | body: session_id, squad_players, starting_eleven, formation |
| GET | `/api/selections/stats` | — |
