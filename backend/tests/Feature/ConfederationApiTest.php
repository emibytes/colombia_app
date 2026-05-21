<?php

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
