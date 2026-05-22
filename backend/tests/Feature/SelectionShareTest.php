<?php

namespace Tests\Feature;

use App\Models\Player;
use App\Models\Selection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SelectionShareTest extends TestCase
{
    use RefreshDatabase;

    private function makeSelection(string $token): Selection
    {
        return Selection::create([
            'session_id'      => 'sess-share-' . $token,
            'squad_players'   => [1, 2, 3],
            'starting_eleven' => [1, 2, 3],
            'formation'       => '4-3-3',
            'share_token'     => $token,
        ]);
    }

    public function test_share_endpoint_returns_selection_data(): void
    {
        $token = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
        $this->makeSelection($token);

        $res = $this->getJson("/api/selections/share/{$token}");

        $res->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('formation', '4-3-3')
            ->assertJsonStructure(['squad_players', 'starting_eleven', 'formation', 'players']);
    }

    public function test_share_endpoint_returns_404_for_unknown_token(): void
    {
        $res = $this->getJson('/api/selections/share/nonexistent-token');
        $res->assertNotFound()->assertJsonPath('ok', false);
    }
}
