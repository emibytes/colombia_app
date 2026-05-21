<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    // --- register ---

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                     => 'Carlos Test',
            'email'                    => 'carlos@example.com',
            'password'                 => 'password123',
            'password_confirmation'    => 'password123',
            'data_treatment_accepted'  => true,
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);

        $this->assertDatabaseHas('users', [
            'email' => 'carlos@example.com',
            'role'  => 'user',
        ]);

        $this->assertNotNull(
            User::where('email', 'carlos@example.com')->first()->data_treatment_accepted_at
        );
    }

    public function test_register_requires_consent(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Carlos Test',
            'email'                 => 'carlos@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            // data_treatment_accepted omitted
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['data_treatment_accepted']);
    }

    public function test_register_requires_unique_email(): void
    {
        User::factory()->create(['email' => 'exists@example.com']);

        $response = $this->postJson('/api/auth/register', [
            'name'                    => 'Dup',
            'email'                   => 'exists@example.com',
            'password'                => 'password123',
            'password_confirmation'   => 'password123',
            'data_treatment_accepted' => true,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    // --- login ---

    public function test_login_returns_token_for_valid_credentials(): void
    {
        $user = User::factory()->create(['email' => 'james@example.com']);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'james@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);
    }

    public function test_login_rejects_wrong_password(): void
    {
        User::factory()->create(['email' => 'james@example.com']);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'james@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    // --- logout ---

    public function test_logout_revokes_token(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/auth/logout');

        $response->assertStatus(200);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    // --- me ---

    public function test_me_returns_authenticated_user(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/auth/me');

        $response->assertStatus(200)
                 ->assertJsonPath('user.email', $user->email);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/auth/me')->assertStatus(401);
    }
}
