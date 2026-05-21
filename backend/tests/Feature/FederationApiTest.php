<?php

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
