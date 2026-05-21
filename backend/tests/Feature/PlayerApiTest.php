<?php

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
        $club = Club::factory()->create(['name' => 'Bayern Munich']);
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
