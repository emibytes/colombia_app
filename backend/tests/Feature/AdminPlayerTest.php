<?php

namespace Tests\Feature;

use App\Models\Club;
use App\Models\Confederation;
use App\Models\Federation;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPlayerTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        return User::factory()->admin()->create()->createToken('api')->plainTextToken;
    }

    private function federation(): Federation
    {
        $conf = Confederation::factory()->create();
        return Federation::factory()->create(['confederation_id' => $conf->id]);
    }

    public function test_admin_can_list_players(): void
    {
        $fed = $this->federation();
        Player::factory(3)->create(['federation_id' => $fed->id]);

        $this->withToken($this->adminToken())
             ->getJson('/api/admin/players')
             ->assertOk()
             ->assertJsonCount(3);
    }

    public function test_admin_can_create_player(): void
    {
        $fed = $this->federation();

        $this->withToken($this->adminToken())
             ->postJson('/api/admin/players', [
                 'federation_id' => $fed->id,
                 'first_name'    => 'James',
                 'last_name'     => 'Rodríguez',
                 'position'      => 'midfielder',
             ])
             ->assertStatus(201)
             ->assertJsonPath('full_name', 'James Rodríguez');

        $this->assertDatabaseHas('players', ['full_name' => 'James Rodríguez']);
    }

    public function test_admin_can_update_player(): void
    {
        $fed    = $this->federation();
        $player = Player::factory()->create(['federation_id' => $fed->id]);

        $this->withToken($this->adminToken())
             ->putJson("/api/admin/players/{$player->id}", ['jersey_number' => 10])
             ->assertOk()
             ->assertJsonPath('jersey_number', 10);
    }

    public function test_admin_can_delete_player(): void
    {
        $fed    = $this->federation();
        $player = Player::factory()->create(['federation_id' => $fed->id]);

        $this->withToken($this->adminToken())
             ->deleteJson("/api/admin/players/{$player->id}")
             ->assertNoContent();

        $this->assertDatabaseMissing('players', ['id' => $player->id]);
    }

    public function test_regular_user_cannot_access_admin_players(): void
    {
        $token = User::factory()->create()->createToken('api')->plainTextToken;

        $this->withToken($token)
             ->getJson('/api/admin/players')
             ->assertForbidden();
    }

    public function test_unauthenticated_cannot_access_admin_players(): void
    {
        $this->getJson('/api/admin/players')->assertUnauthorized();
    }
}
