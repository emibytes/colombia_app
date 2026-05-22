<?php

namespace Tests\Feature;

use App\Models\Confederation;
use App\Models\Federation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FederationAdminTest extends TestCase
{
    use RefreshDatabase;

    private function adminToken(): string
    {
        return User::factory()->admin()->create()->createToken('api')->plainTextToken;
    }

    public function test_admin_can_list_federations(): void
    {
        $conf = Confederation::factory()->create();
        Federation::factory()->count(3)->create(['confederation_id' => $conf->id]);

        $this->withToken($this->adminToken())
             ->getJson('/api/admin/federations')
             ->assertOk()
             ->assertJsonCount(3);
    }

    public function test_admin_can_create_federation(): void
    {
        $conf = Confederation::factory()->create();

        $this->withToken($this->adminToken())
             ->postJson('/api/admin/federations', [
                 'confederation_id'  => $conf->id,
                 'name'              => 'Federación Colombiana de Fútbol',
                 'short_name'        => 'FCF',
                 'country'           => 'Colombia',
                 'country_code'      => 'COL',
                 'continent'         => 'South America',
                 'qualified_wc_2026' => true,
             ])
             ->assertCreated()
             ->assertJsonPath('country_code', 'COL');

        $this->assertDatabaseHas('federations', ['country_code' => 'COL']);
    }

    public function test_admin_can_update_federation(): void
    {
        $conf = Confederation::factory()->create();
        $fed  = Federation::factory()->create(['confederation_id' => $conf->id, 'fifa_ranking' => 50]);

        $this->withToken($this->adminToken())
             ->putJson("/api/admin/federations/{$fed->id}", ['fifa_ranking' => 12])
             ->assertOk()
             ->assertJsonPath('fifa_ranking', 12);
    }

    public function test_admin_can_delete_federation(): void
    {
        $conf = Confederation::factory()->create();
        $fed  = Federation::factory()->create(['confederation_id' => $conf->id]);

        $this->withToken($this->adminToken())
             ->deleteJson("/api/admin/federations/{$fed->id}")
             ->assertNoContent();

        $this->assertDatabaseMissing('federations', ['id' => $fed->id]);
    }

    public function test_regular_user_cannot_access_admin_federations(): void
    {
        $token = User::factory()->create()->createToken('api')->plainTextToken;

        $this->withToken($token)
             ->getJson('/api/admin/federations')
             ->assertForbidden();
    }
}
