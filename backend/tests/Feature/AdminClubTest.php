<?php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\Confederation;
use App\Models\Federation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminClubTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        return User::factory()->admin()->create()->createToken('api')->plainTextToken;
    }

    public function test_admin_can_list_clubs(): void
    {
        Club::factory(3)->create();

        $this->withToken($this->adminToken())
             ->getJson('/api/admin/clubs')
             ->assertOk()
             ->assertJsonCount(3);
    }

    public function test_admin_can_create_club(): void
    {
        $this->withToken($this->adminToken())
             ->postJson('/api/admin/clubs', [
                 'name'         => 'Atlético Nacional',
                 'country'      => 'Colombia',
                 'country_code' => 'COL',
             ])
             ->assertStatus(201)
             ->assertJsonPath('name', 'Atlético Nacional');

        $this->assertDatabaseHas('clubs', ['name' => 'Atlético Nacional']);
    }

    public function test_admin_can_update_club(): void
    {
        $club = Club::factory()->create();

        $this->withToken($this->adminToken())
             ->putJson("/api/admin/clubs/{$club->id}", ['city' => 'Medellín'])
             ->assertOk()
             ->assertJsonPath('city', 'Medellín');
    }

    public function test_admin_can_delete_club(): void
    {
        $club = Club::factory()->create();

        $this->withToken($this->adminToken())
             ->deleteJson("/api/admin/clubs/{$club->id}")
             ->assertNoContent();

        $this->assertDatabaseMissing('clubs', ['id' => $club->id]);
    }

    public function test_regular_user_cannot_access_admin_clubs(): void
    {
        $token = User::factory()->create()->createToken('api')->plainTextToken;

        $this->withToken($token)
             ->getJson('/api/admin/clubs')
             ->assertForbidden();
    }
}
