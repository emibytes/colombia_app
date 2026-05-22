<?php

namespace Tests\Feature;

use App\Models\Confederation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConfederationAdminTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        return User::factory()->admin()->create()->createToken('api')->plainTextToken;
    }

    public function test_admin_can_list_confederations(): void
    {
        Confederation::factory()->count(3)->create();

        $this->withToken($this->adminToken())
             ->getJson('/api/admin/confederations')
             ->assertOk()
             ->assertJsonCount(3);
    }

    public function test_admin_can_create_confederation(): void
    {
        $this->withToken($this->adminToken())
             ->postJson('/api/admin/confederations', [
                 'name'      => 'CONMEBOL',
                 'full_name' => 'Confederación Sudamericana de Fútbol',
                 'region'    => 'South America',
             ])
             ->assertCreated()
             ->assertJsonPath('name', 'CONMEBOL');

        $this->assertDatabaseHas('confederations', ['name' => 'CONMEBOL']);
    }

    public function test_admin_can_update_confederation(): void
    {
        $conf = Confederation::factory()->create(['name' => 'Old']);

        $this->withToken($this->adminToken())
             ->putJson("/api/admin/confederations/{$conf->id}", ['name' => 'New'])
             ->assertOk()
             ->assertJsonPath('name', 'New');
    }

    public function test_admin_can_delete_confederation(): void
    {
        $conf = Confederation::factory()->create();

        $this->withToken($this->adminToken())
             ->deleteJson("/api/admin/confederations/{$conf->id}")
             ->assertNoContent();

        $this->assertDatabaseMissing('confederations', ['id' => $conf->id]);
    }

    public function test_regular_user_cannot_access_admin_confederations(): void
    {
        $token = User::factory()->create()->createToken('api')->plainTextToken;

        $this->withToken($token)
             ->getJson('/api/admin/confederations')
             ->assertForbidden();
    }

    public function test_unauthenticated_cannot_access_admin_confederations(): void
    {
        $this->getJson('/api/admin/confederations')->assertUnauthorized();
    }
}
