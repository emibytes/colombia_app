# Authentication System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir autenticación opcional (credenciales + Google + Facebook) al Colombia App, preservando el flujo anónimo existente (session_id), con cumplimiento de Ley 1581/2012 y separación de rol admin.

**Architecture:** Laravel Sanctum API tokens (Bearer) + Laravel Socialite. Credenciales → token en respuesta JSON. OAuth → callback redirige al frontend con token en URL. El flujo anónimo (session_id) no cambia. Zustand persiste el token en localStorage + una cookie ligera para que el middleware de Next.js pueda leer el rol sin acceder a localStorage.

**Tech Stack:** Laravel 11, Sanctum 4.x, Socialite, Next.js 16 App Router, Zustand 5, axios

---

## Análisis Habeas Data — Ley 1581/2012 Colombia

| Campo recopilado | Es dato personal | Requiere consentimiento |
|---|---|---|
| `email` | Sí (identificador) | Sí |
| `name` | Sí (display name; alias permitido) | Sí |
| `google_id` / `facebook_id` | Pseudónimo técnico | Sí (vía proveedor + nuestro modal) |
| `session_id` (anónimo) | No (generado en cliente, sin vinculación) | No |
| Estadísticas agregadas | No (anónimas) | No |

**Lo que NO recopilamos:** cédula, teléfono, dirección, fecha de nacimiento, datos sensibles.

**Flujo anónimo** → cero datos personales → cero obligaciones bajo Ley 1581.

**Flujo credenciales** → checkbox obligatorio en registro → `data_treatment_accepted_at` guardado como prueba de autorización (Art. 9 Ley 1581/2012).

**Flujo OAuth** → modal de consentimiento en primer login (`needs_consent=1` en URL de callback) → `acceptConsent` endpoint guarda el timestamp.

**Política de privacidad:** https://emibytes.com/privacy (ya publicada).

---

## Mapa de archivos

### Backend
| Acción | Archivo |
|--------|---------|
| Crear | `backend/database/migrations/2026_05_21_200001_add_auth_fields_to_users_table.php` |
| Crear | `backend/database/migrations/2026_05_21_200002_add_user_id_to_selections_table.php` |
| Modificar | `backend/app/Models/User.php` |
| Modificar | `backend/database/factories/UserFactory.php` |
| Crear | `backend/app/Http/Requests/Auth/RegisterRequest.php` |
| Crear | `backend/app/Http/Requests/Auth/LoginRequest.php` |
| Crear | `backend/app/Http/Controllers/Api/AuthController.php` |
| Crear | `backend/app/Http/Controllers/Api/SocialAuthController.php` |
| Crear | `backend/app/Http/Middleware/AdminMiddleware.php` |
| Modificar | `backend/bootstrap/app.php` |
| Modificar | `backend/config/services.php` |
| Modificar | `backend/routes/api.php` |
| Crear | `backend/tests/Feature/AuthTest.php` |
| Crear | `backend/tests/Feature/SocialAuthTest.php` |

### Frontend
| Acción | Archivo |
|--------|---------|
| Crear | `frontend/src/types/auth.ts` |
| Modificar | `frontend/src/lib/api.ts` |
| Crear | `frontend/src/stores/authStore.ts` |
| Crear | `frontend/src/app/(auth)/layout.tsx` |
| Crear | `frontend/src/app/(auth)/login/page.tsx` |
| Crear | `frontend/src/app/(auth)/register/page.tsx` |
| Crear | `frontend/src/app/auth/callback/page.tsx` |
| Crear | `frontend/src/middleware.ts` |

---

## Task 1: Migraciones DB

**Files:**
- Create: `backend/database/migrations/2026_05_21_200001_add_auth_fields_to_users_table.php`
- Create: `backend/database/migrations/2026_05_21_200002_add_user_id_to_selections_table.php`

- [ ] **Step 1.1 — Instalar Socialite**

```bash
cd backend
composer require laravel/socialite
```

Salida esperada: `laravel/socialite` instalado sin errores.

- [ ] **Step 1.2 — Crear migración de users**

```php
<?php
// backend/database/migrations/2026_05_21_200001_add_auth_fields_to_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
            $table->string('google_id')->nullable()->after('remember_token');
            $table->string('facebook_id')->nullable()->after('google_id');
            $table->enum('role', ['user', 'admin'])->default('user')->after('facebook_id');
            $table->timestamp('data_treatment_accepted_at')->nullable()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'facebook_id', 'role', 'data_treatment_accepted_at']);
            $table->string('password')->nullable(false)->change();
        });
    }
};
```

- [ ] **Step 1.3 — Crear migración de selections**

```php
<?php
// backend/database/migrations/2026_05_21_200002_add_user_id_to_selections_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('selections', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')
                  ->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('selections', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\User::class);
            $table->dropColumn('user_id');
        });
    }
};
```

- [ ] **Step 1.4 — Correr migraciones**

```bash
/d/xampp/php/php.exe artisan migrate
```

Salida esperada: ambas migraciones en `Migrated:`.

- [ ] **Step 1.5 — Commit**

```bash
git add backend/database/migrations/2026_05_21_200001_add_auth_fields_to_users_table.php backend/database/migrations/2026_05_21_200002_add_user_id_to_selections_table.php
git commit -m "feat: add auth fields to users + user_id to selections"
```

---

## Task 2: User model + UserFactory

**Files:**
- Modify: `backend/app/Models/User.php`
- Modify: `backend/database/factories/UserFactory.php`

- [ ] **Step 2.1 — Reescribir User.php**

```php
<?php
// backend/app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'facebook_id',
        'role',
        'data_treatment_accepted_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
        'facebook_id',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'          => 'datetime',
            'data_treatment_accepted_at' => 'datetime',
            'password'                   => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
```

- [ ] **Step 2.2 — Actualizar UserFactory.php**

```php
<?php
// backend/database/factories/UserFactory.php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name'                       => fake()->name(),
            'email'                      => fake()->unique()->safeEmail(),
            'email_verified_at'          => now(),
            'password'                   => static::$password ??= Hash::make('password'),
            'role'                       => 'user',
            'data_treatment_accepted_at' => now(),
            'remember_token'             => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(['email_verified_at' => null]);
    }

    public function admin(): static
    {
        return $this->state(['role' => 'admin']);
    }

    public function withoutConsent(): static
    {
        return $this->state(['data_treatment_accepted_at' => null]);
    }
}
```

- [ ] **Step 2.3 — Correr suite para verificar sin regresiones**

```bash
/d/xampp/php/php.exe artisan test
```

Salida esperada: todos los tests existentes siguen en PASS.

- [ ] **Step 2.4 — Commit**

```bash
git add backend/app/Models/User.php backend/database/factories/UserFactory.php
git commit -m "feat: User model with HasApiTokens, role, consent + updated UserFactory"
```

---

## Task 3: Configurar servicios OAuth

**Files:**
- Modify: `backend/config/services.php`

- [ ] **Step 3.1 — Añadir Google y Facebook a services.php**

Al final del array `return [...]` en `backend/config/services.php`, añadir:

```php
'google' => [
    'client_id'     => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect'      => env('APP_URL') . '/api/auth/google/callback',
],

'facebook' => [
    'client_id'     => env('FACEBOOK_APP_ID'),
    'client_secret' => env('FACEBOOK_APP_SECRET'),
    'redirect'      => env('APP_URL') . '/api/auth/facebook/callback',
],
```

- [ ] **Step 3.2 — Añadir variables al .env**

Añadir al final de `backend/.env`:

```
FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

> Los valores reales se obtienen en [Google Cloud Console](https://console.cloud.google.com) y [Meta for Developers](https://developers.facebook.com). La URL de callback a registrar en ambos es: `{APP_URL}/api/auth/{provider}/callback`.

- [ ] **Step 3.3 — Commit**

```bash
git add backend/config/services.php
git commit -m "feat: Google and Facebook OAuth service config"
```

---

## Task 4: AuthController (credentials) + tests

**Files:**
- Create: `backend/app/Http/Requests/Auth/RegisterRequest.php`
- Create: `backend/app/Http/Requests/Auth/LoginRequest.php`
- Create: `backend/app/Http/Controllers/Api/AuthController.php`
- Create: `backend/tests/Feature/AuthTest.php`

- [ ] **Step 4.1 — Escribir el test**

```php
<?php
// backend/tests/Feature/AuthTest.php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_credentials(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                    => 'Hincha Colombia',
            'email'                   => 'fan@example.com',
            'password'                => 'secret123',
            'password_confirmation'   => 'secret123',
            'data_treatment_accepted' => true,
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['token', 'user' => ['id', 'email', 'role']]);

        $this->assertDatabaseHas('users', ['email' => 'fan@example.com', 'role' => 'user']);
        $this->assertNotNull(User::first()->data_treatment_accepted_at);
    }

    public function test_register_requires_data_treatment_acceptance(): void
    {
        $this->postJson('/api/auth/register', [
            'email'                   => 'fan@example.com',
            'password'                => 'secret123',
            'password_confirmation'   => 'secret123',
            'data_treatment_accepted' => false,
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['data_treatment_accepted']);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $this->postJson('/api/auth/register', [
            'email'                   => 'existing@example.com',
            'password'                => 'secret123',
            'password_confirmation'   => 'secret123',
            'data_treatment_accepted' => true,
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login(): void
    {
        User::factory()->create(['email' => 'fan@example.com']);

        $this->postJson('/api/auth/login', [
            'email'    => 'fan@example.com',
            'password' => 'password',
        ])->assertOk()
          ->assertJsonStructure(['token', 'user' => ['id', 'email', 'role']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'fan@example.com']);

        $this->postJson('/api/auth/login', [
            'email'    => 'fan@example.com',
            'password' => 'wrong',
        ])->assertStatus(401);
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('spa')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
             ->getJson('/api/auth/me')
             ->assertOk()
             ->assertJsonPath('user.id', $user->id);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/auth/me')->assertStatus(401);
    }

    public function test_logout_invalidates_token(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('spa')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
             ->postJson('/api/auth/logout')
             ->assertOk();

        $this->withHeader('Authorization', "Bearer {$token}")
             ->getJson('/api/auth/me')
             ->assertStatus(401);
    }

    public function test_user_can_accept_consent(): void
    {
        $user  = User::factory()->withoutConsent()->create();
        $token = $user->createToken('spa')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
             ->patchJson('/api/auth/consent')
             ->assertOk();

        $this->assertNotNull($user->fresh()->data_treatment_accepted_at);
    }
}
```

- [ ] **Step 4.2 — Correr test para confirmar que falla**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/AuthTest.php
```

Salida esperada: FAIL — rutas no existen.

- [ ] **Step 4.3 — Crear RegisterRequest**

```php
<?php
// backend/app/Http/Requests/Auth/RegisterRequest.php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                    => ['nullable', 'string', 'max:100'],
            'email'                   => ['required', 'email', 'unique:users,email'],
            'password'                => ['required', 'string', 'min:8', 'confirmed'],
            'data_treatment_accepted' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'data_treatment_accepted.accepted' =>
                'Debes aceptar la Política de Privacidad para crear una cuenta.',
        ];
    }
}
```

- [ ] **Step 4.4 — Crear LoginRequest**

```php
<?php
// backend/app/Http/Requests/Auth/LoginRequest.php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
```

- [ ] **Step 4.5 — Crear AuthController**

```php
<?php
// backend/app/Http/Controllers/Api/AuthController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'                       => $request->name ?? 'Hincha Colombia',
            'email'                      => $request->email,
            'password'                   => $request->password,
            'role'                       => 'user',
            'data_treatment_accepted_at' => now(),
        ]);

        $token = $user->createToken('spa')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $this->userPayload($user)], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            return response()->json(['message' => 'Credenciales incorrectas.'], 401);
        }

        /** @var User $user */
        $user  = Auth::user();
        $token = $user->createToken('spa')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $this->userPayload($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['ok' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->userPayload($request->user())]);
    }

    public function acceptConsent(Request $request): JsonResponse
    {
        $request->user()->update(['data_treatment_accepted_at' => now()]);

        return response()->json(['ok' => true]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id'                         => $user->id,
            'name'                       => $user->name,
            'email'                      => $user->email,
            'role'                       => $user->role,
            'data_treatment_accepted_at' => $user->data_treatment_accepted_at?->toIso8601String(),
        ];
    }
}
```

- [ ] **Step 4.6 — Añadir rutas auth en api.php**

Añadir al final de `backend/routes/api.php`:

```php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SocialAuthController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout',   [AuthController::class, 'logout']);
        Route::get('me',        [AuthController::class, 'me']);
        Route::patch('consent', [AuthController::class, 'acceptConsent']);
    });

    Route::get('{provider}/redirect',  [SocialAuthController::class, 'redirect']);
    Route::get('{provider}/callback',  [SocialAuthController::class, 'callback']);
});
```

- [ ] **Step 4.7 — Correr tests**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/AuthTest.php
```

Salida esperada: todos PASS (el test de social auth fallará aún — es Task 5).

- [ ] **Step 4.8 — Commit**

```bash
git add backend/app/Http/Requests/Auth/ backend/app/Http/Controllers/Api/AuthController.php backend/routes/api.php backend/tests/Feature/AuthTest.php
git commit -m "feat: credentials auth — register/login/logout/me/consent with Sanctum"
```

---

## Task 5: SocialAuthController (OAuth) + tests

**Files:**
- Create: `backend/app/Http/Controllers/Api/SocialAuthController.php`
- Create: `backend/tests/Feature/SocialAuthTest.php`

- [ ] **Step 5.1 — Escribir el test**

```php
<?php
// backend/tests/Feature/SocialAuthTest.php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class SocialAuthTest extends TestCase
{
    use RefreshDatabase;

    private function mockSocialiteUser(string $provider, string $id, string $email, string $name): void
    {
        $socialUser = Mockery::mock(SocialiteUser::class);
        $socialUser->shouldReceive('getId')->andReturn($id);
        $socialUser->shouldReceive('getEmail')->andReturn($email);
        $socialUser->shouldReceive('getName')->andReturn($name);

        $driver = Mockery::mock('Laravel\Socialite\Contracts\Provider');
        $driver->shouldReceive('stateless')->andReturnSelf();
        $driver->shouldReceive('user')->andReturn($socialUser);

        Socialite::shouldReceive('driver')->with($provider)->andReturn($driver);
    }

    public function test_redirect_returns_302_for_google(): void
    {
        $driver = Mockery::mock('Laravel\Socialite\Contracts\Provider');
        $driver->shouldReceive('stateless')->andReturnSelf();
        $driver->shouldReceive('redirect')->andReturn(redirect('https://accounts.google.com/o/oauth2/auth'));

        Socialite::shouldReceive('driver')->with('google')->andReturn($driver);

        $this->get('/api/auth/google/redirect')->assertRedirect();
    }

    public function test_callback_creates_new_user_and_redirects(): void
    {
        $this->mockSocialiteUser('google', 'gid-123', 'fan@gmail.com', 'Fan Colombia');

        $response = $this->get('/api/auth/google/callback');

        $response->assertRedirect();
        $location = $response->headers->get('Location');
        $this->assertStringContainsString('token=', $location);
        $this->assertStringContainsString('needs_consent=1', $location);
        $this->assertDatabaseHas('users', ['email' => 'fan@gmail.com', 'google_id' => 'gid-123']);
    }

    public function test_callback_links_google_id_to_existing_user(): void
    {
        User::factory()->create(['email' => 'fan@gmail.com', 'google_id' => null]);
        $this->mockSocialiteUser('google', 'gid-456', 'fan@gmail.com', 'Fan Colombia');

        $this->get('/api/auth/google/callback')->assertRedirect();

        $this->assertEquals('gid-456', User::where('email', 'fan@gmail.com')->value('google_id'));
    }

    public function test_callback_skips_consent_when_already_accepted(): void
    {
        User::factory()->create([
            'email'                      => 'fan@gmail.com',
            'google_id'                  => 'gid-789',
            'data_treatment_accepted_at' => now(),
        ]);
        $this->mockSocialiteUser('google', 'gid-789', 'fan@gmail.com', 'Fan Colombia');

        $location = $this->get('/api/auth/google/callback')->headers->get('Location');
        $this->assertStringContainsString('needs_consent=0', $location);
    }

    public function test_redirect_rejects_invalid_provider(): void
    {
        $this->get('/api/auth/invalid/redirect')->assertStatus(422);
    }
}
```

- [ ] **Step 5.2 — Correr test para confirmar que falla**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/SocialAuthTest.php
```

Salida esperada: FAIL — clase no existe.

- [ ] **Step 5.3 — Crear SocialAuthController**

```php
<?php
// backend/app/Http/Controllers/Api/SocialAuthController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    private const ALLOWED_PROVIDERS = ['google', 'facebook'];

    public function redirect(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::ALLOWED_PROVIDERS), 422);

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::ALLOWED_PROVIDERS), 422);

        $social = Socialite::driver($provider)->stateless()->user();

        $user = User::firstOrCreate(
            ['email' => $social->getEmail()],
            [
                'name'           => $social->getName() ?? 'Hincha Colombia',
                'role'           => 'user',
                "{$provider}_id" => $social->getId(),
            ]
        );

        if (!$user->getAttribute("{$provider}_id")) {
            $user->update(["{$provider}_id" => $social->getId()]);
        }

        $token        = $user->createToken('spa')->plainTextToken;
        $needsConsent = is_null($user->data_treatment_accepted_at) ? '1' : '0';
        $frontend     = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        return redirect("{$frontend}/auth/callback?token={$token}&needs_consent={$needsConsent}");
    }
}
```

- [ ] **Step 5.4 — Correr tests**

```bash
/d/xampp/php/php.exe artisan test tests/Feature/SocialAuthTest.php
```

Salida esperada: todos PASS.

- [ ] **Step 5.5 — Commit**

```bash
git add backend/app/Http/Controllers/Api/SocialAuthController.php backend/tests/Feature/SocialAuthTest.php
git commit -m "feat: OAuth redirect + callback for Google/Facebook via Socialite"
```

---

## Task 6: AdminMiddleware + bootstrap/app.php

**Files:**
- Create: `backend/app/Http/Middleware/AdminMiddleware.php`
- Modify: `backend/bootstrap/app.php`

- [ ] **Step 6.1 — Crear AdminMiddleware**

```php
<?php
// backend/app/Http/Middleware/AdminMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        return $next($request);
    }
}
```

- [ ] **Step 6.2 — Registrar alias en bootstrap/app.php**

Reemplazar el bloque `withMiddleware` en `backend/bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'admin' => \App\Http\Middleware\AdminMiddleware::class,
    ]);
})
```

- [ ] **Step 6.3 — Correr suite completa**

```bash
/d/xampp/php/php.exe artisan test
```

Salida esperada: todos PASS.

- [ ] **Step 6.4 — Commit**

```bash
git add backend/app/Http/Middleware/AdminMiddleware.php backend/bootstrap/app.php
git commit -m "feat: AdminMiddleware with 'admin' alias registered"
```

---

## Task 7: Frontend — auth types + authStore

**Files:**
- Create: `frontend/src/types/auth.ts`
- Create: `frontend/src/stores/authStore.ts`

- [ ] **Step 7.1 — Crear auth.ts**

```typescript
// frontend/src/types/auth.ts

export interface AuthUser {
  id:                         number;
  name:                       string;
  email:                      string;
  role:                       'user' | 'admin';
  data_treatment_accepted_at: string | null;
}

export interface AuthState {
  user:      AuthUser | null;
  token:     string | null;
  isLoading: boolean;

  setAuth:      (user: AuthUser, token: string) => void;
  clearAuth:    () => void;
  setLoading:   (v: boolean) => void;
  isAdmin:      () => boolean;
  needsConsent: () => boolean;
}
```

- [ ] **Step 7.2 — Crear authStore.ts**

```typescript
// frontend/src/stores/authStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState, AuthUser } from "@/types/auth";

function writeRoleCookie(role: string) {
  if (typeof document !== "undefined") {
    document.cookie = `colombia-auth-role=${role}; path=/; max-age=86400; SameSite=Lax`;
  }
}

function clearRoleCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "colombia-auth-role=; path=/; max-age=0";
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:      null,
      token:     null,
      isLoading: false,

      setAuth: (user: AuthUser, token: string) => {
        set({ user, token, isLoading: false });
        writeRoleCookie(user.role);
      },

      clearAuth: () => {
        set({ user: null, token: null, isLoading: false });
        clearRoleCookie();
      },

      setLoading: (v: boolean) => set({ isLoading: v }),

      isAdmin: () => get().user?.role === "admin",

      needsConsent: () =>
        get().user !== null && get().user?.data_treatment_accepted_at === null,
    }),
    {
      name:       "colombia-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);
```

- [ ] **Step 7.3 — Commit**

```bash
git add frontend/src/types/auth.ts frontend/src/stores/authStore.ts
git commit -m "feat: AuthUser type + authStore with Zustand persist + role cookie"
```

---

## Task 8: Frontend — extender api.ts con métodos de auth

**Files:**
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 8.1 — Reescribir api.ts**

```typescript
// frontend/src/lib/api.ts

import axios from "axios";
import { SaveSelectionPayload, StatsResponse } from "@/types";
import { AuthUser } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export const http = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Inject Bearer token from localStorage on every request
http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw   = localStorage.getItem("colombia-auth");
      const token = raw ? JSON.parse(raw)?.state?.token : null;
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

// ── Selections ─────────────────────────────────────────────────────────────

export async function saveSelection(payload: SaveSelectionPayload) {
  const { data } = await http.post("/selections", payload);
  return data as { ok: boolean; message: string; id?: number };
}

export async function getStats(): Promise<StatsResponse> {
  const { data } = await http.get("/selections/stats");
  return data as StatsResponse;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name?:                   string;
  email:                   string;
  password:                string;
  password_confirmation:   string;
  data_treatment_accepted: boolean;
}

export interface AuthResponse {
  token: string;
  user:  AuthUser;
}

export async function authRegister(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await http.post("/auth/register", payload);
  return data;
}

export async function authLogin(email: string, password: string): Promise<AuthResponse> {
  const { data } = await http.post("/auth/login", { email, password });
  return data;
}

export async function authLogout(): Promise<void> {
  await http.post("/auth/logout");
}

export async function authMe(): Promise<AuthUser> {
  const { data } = await http.get("/auth/me");
  return data.user;
}

export async function authAcceptConsent(): Promise<void> {
  await http.patch("/auth/consent");
}

export function getOAuthUrl(provider: "google" | "facebook"): string {
  return `${API_URL}/auth/${provider}/redirect`;
}
```

- [ ] **Step 8.2 — Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat: auth API methods with Bearer token interceptor"
```

---

## Task 9: Frontend — Login page

**Files:**
- Create: `frontend/src/app/(auth)/layout.tsx`
- Create: `frontend/src/app/(auth)/login/page.tsx`

- [ ] **Step 9.1 — Crear (auth)/layout.tsx**

```tsx
// frontend/src/app/(auth)/layout.tsx

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-neutral-950 p-4">
      {children}
    </main>
  );
}
```

- [ ] **Step 9.2 — Crear login/page.tsx**

```tsx
// frontend/src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authLogin, getOAuthUrl } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await authLogin(email, password);
      setAuth(user, token);
      router.push("/");
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-yellow-400 tracking-wide">
          Iniciar sesión
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          o{" "}
          <Link href="/" className="text-yellow-400 underline">
            continúa sin cuenta
          </Link>
        </p>
      </div>

      {/* OAuth */}
      <div className="space-y-3">
        <a
          href={getOAuthUrl("google")}
          className="flex items-center justify-center gap-3 w-full rounded-lg border border-neutral-700 bg-neutral-900 py-3 text-sm text-white hover:bg-neutral-800 transition"
        >
          <GoogleIcon />
          Continuar con Google
        </a>
        <a
          href={getOAuthUrl("facebook")}
          className="flex items-center justify-center gap-3 w-full rounded-lg bg-[#1877f2] py-3 text-sm text-white hover:bg-[#166fe5] transition"
        >
          <FacebookIcon />
          Continuar con Facebook
        </a>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-neutral-700" />
        <span className="text-xs text-neutral-500">o con email</span>
        <div className="flex-1 border-t border-neutral-700" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <div>
          <label className="block text-xs text-neutral-400 mb-1">Correo electrónico</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-xs text-neutral-400 mb-1">Contraseña</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-neutral-950 hover:bg-yellow-300 transition disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Iniciar sesión"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-yellow-400 underline">Crear cuenta</Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 fill-white" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
```

- [ ] **Step 9.3 — Commit**

```bash
git add frontend/src/app/(auth)/
git commit -m "feat: login page with Google, Facebook, and credentials"
```

---

## Task 10: Frontend — Register page

**Files:**
- Create: `frontend/src/app/(auth)/register/page.tsx`

- [ ] **Step 10.1 — Crear register/page.tsx**

```tsx
// frontend/src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authRegister, getOAuthUrl } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface FormErrors { name?: string; email?: string; password?: string; accepted?: string }

export default function RegisterPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors]     = useState<FormErrors>({});
  const [loading, setLoading]   = useState(false);

  function field(key: keyof typeof form) {
    return {
      value:    form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setErrors((er) => ({ ...er, [key]: undefined }));
      },
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) { setErrors({ accepted: "Debes aceptar la Política de Privacidad." }); return; }

    setLoading(true);
    try {
      const { token, user } = await authRegister({ ...form, data_treatment_accepted: true });
      setAuth(user, token);
      router.push("/");
    } catch (err: unknown) {
      const apiErrors = (err as { response?: { data?: { errors?: Record<string, string[]> } } })
        ?.response?.data?.errors ?? {};
      const flat: FormErrors = {};
      for (const [k, msgs] of Object.entries(apiErrors)) (flat as Record<string, string>)[k] = msgs[0];
      setErrors(flat);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-lg bg-neutral-900 border border-neutral-700 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-yellow-400";

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-yellow-400 tracking-wide">
          Crear cuenta
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          o <Link href="/" className="text-yellow-400 underline">sigue sin cuenta</Link>
        </p>
      </div>

      <div className="space-y-3">
        <a href={getOAuthUrl("google")} className="flex items-center justify-center gap-3 w-full rounded-lg border border-neutral-700 bg-neutral-900 py-3 text-sm text-white hover:bg-neutral-800 transition">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Registrarme con Google
        </a>
        <a href={getOAuthUrl("facebook")} className="flex items-center justify-center gap-3 w-full rounded-lg bg-[#1877f2] py-3 text-sm text-white hover:bg-[#166fe5] transition">
          <svg className="h-5 w-5 shrink-0 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Registrarme con Facebook
        </a>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-neutral-700" />
        <span className="text-xs text-neutral-500">o con email</span>
        <div className="flex-1 border-t border-neutral-700" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Nombre o alias <span className="text-neutral-600">(opcional)</span></label>
          <input type="text" {...field("name")} className={inputClass} placeholder="Hincha Colombia" />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Correo electrónico</label>
          <input type="email" {...field("email")} required className={inputClass} placeholder="tu@email.com" />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Contraseña</label>
          <input type="password" {...field("password")} required className={inputClass} placeholder="Mínimo 8 caracteres" />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Confirmar contraseña</label>
          <input type="password" {...field("password_confirmation")} required className={inputClass} placeholder="Repite tu contraseña" />
        </div>

        {/* Habeas data — Ley 1581/2012 */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-yellow-400 rounded"
          />
          <span className="text-xs text-neutral-400 leading-relaxed">
            Autorizo el tratamiento de mi email y nombre para identificación de mi cuenta. No compartimos datos con terceros. Ver{" "}
            <a href="https://emibytes.com/privacy" target="_blank" rel="noopener noreferrer" className="text-yellow-400 underline">
              Política de Privacidad
            </a>
            {" "}(Ley 1581/2012).
          </span>
        </label>
        {errors.accepted && <p className="text-xs text-red-400">{errors.accepted}</p>}

        <button
          type="submit" disabled={loading || !accepted}
          className="w-full rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-neutral-950 hover:bg-yellow-300 transition disabled:opacity-50"
        >
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-yellow-400 underline">Iniciar sesión</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 10.2 — Commit**

```bash
git add frontend/src/app/(auth)/register/
git commit -m "feat: register page with Ley 1581/2012 consent checkbox"
```

---

## Task 11: Frontend — OAuth callback + Next.js middleware

**Files:**
- Create: `frontend/src/app/auth/callback/page.tsx`
- Create: `frontend/src/middleware.ts`

- [ ] **Step 11.1 — Crear /auth/callback/page.tsx**

```tsx
// frontend/src/app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAcceptConsent, authMe } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export default function AuthCallbackPage() {
  const router       = useRouter();
  const params       = useSearchParams();
  const { setAuth, clearAuth } = useAuthStore();
  const [showConsent, setShowConsent] = useState(false);
  const [pendingToken, setPendingToken] = useState("");
  const [accepting, setAccepting]      = useState(false);

  useEffect(() => {
    const token       = params.get("token");
    const needConsent = params.get("needs_consent") === "1";

    if (!token) { router.replace("/login"); return; }

    // Temporarily store token so the axios interceptor can pick it up for authMe()
    localStorage.setItem("colombia-auth", JSON.stringify({ state: { token, user: null } }));
    setPendingToken(token);

    authMe()
      .then((user) => {
        if (needConsent) {
          setShowConsent(true);
        } else {
          setAuth(user, token);
          router.replace("/");
        }
      })
      .catch(() => router.replace("/login"));
  }, []);

  async function handleAccept() {
    setAccepting(true);
    await authAcceptConsent();
    const user = await authMe();
    setAuth(user, pendingToken);
    router.replace("/");
  }

  function handleDecline() {
    clearAuth();
    localStorage.removeItem("colombia-auth");
    router.replace("/");
  }

  if (showConsent) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-neutral-950 p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h2 className="font-[family-name:var(--font-bebas)] text-3xl text-yellow-400">
            Un último paso
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Para guardar tu selección vinculada a tu cuenta, necesitamos tu autorización para tratar tu email y nombre según la{" "}
            <a href="https://emibytes.com/privacy" target="_blank" rel="noopener noreferrer" className="text-yellow-400 underline">
              Política de Privacidad
            </a>{" "}
            (Ley 1581/2012). No compartimos datos con terceros.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 rounded-lg border border-neutral-700 py-3 text-sm text-neutral-400 hover:bg-neutral-900 transition"
            >
              Continuar anónimamente
            </button>
            <button
              onClick={handleAccept} disabled={accepting}
              className="flex-1 rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-neutral-950 hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {accepting ? "Guardando…" : "Acepto"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex items-center justify-center bg-neutral-950">
      <p className="text-neutral-400 text-sm">Autenticando…</p>
    </main>
  );
}
```

- [ ] **Step 11.2 — Crear middleware.ts**

```typescript
// frontend/src/middleware.ts

import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const role    = req.cookies.get("colombia-auth-role")?.value;
  const isAdmin = role === "admin";

  if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 11.3 — Commit**

```bash
git add frontend/src/app/auth/ frontend/src/middleware.ts
git commit -m "feat: OAuth callback page + admin route protection middleware"
```

---

## Task 12: Verificación final

- [ ] **Step 12.1 — Correr suite backend completa**

```bash
/d/xampp/php/php.exe artisan test
```

Salida esperada: todos PASS (auth + social + federation + club + player + confederation).

- [ ] **Step 12.2 — Commit final**

```bash
git add -A
git commit -m "feat: complete auth system — credentials + Google/Facebook OAuth with Ley 1581/2012 consent"
```
