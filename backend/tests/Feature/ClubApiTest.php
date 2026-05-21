<?php

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
        Club::factory()->create(['federation_id' => $fed->id]);

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
