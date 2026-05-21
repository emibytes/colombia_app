<?php

namespace Tests\Feature;

use App\Models\Federation;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SelectionApiTest extends TestCase
{
    use RefreshDatabase;

    private function makePayload(array $playerIds): array
    {
        return [
            'session_id'    => 'test-session-' . uniqid(),
            'squad_players' => $playerIds,
            'formation'     => '4-3-3',
        ];
    }

    private function createPlayers(int $count): \Illuminate\Support\Collection
    {
        $fed = Federation::factory()->create(['country_code' => 'COL']);
        return Player::factory($count)->create(['federation_id' => $fed->id]);
    }

    public function test_anonymous_save_sets_no_user_id(): void
    {
        $players = $this->createPlayers(23);

        $this->postJson('/api/selections', $this->makePayload($players->pluck('id')->toArray()))
             ->assertStatus(201);

        $this->assertDatabaseHas('selections', ['user_id' => null]);
    }

    public function test_authenticated_save_links_user_id(): void
    {
        $user      = User::factory()->create();
        $token     = $user->createToken('api')->plainTextToken;
        $players   = $this->createPlayers(23);
        $sessionId = 'auth-session-' . uniqid();

        $this->withToken($token)
             ->postJson('/api/selections', array_merge(
                 $this->makePayload($players->pluck('id')->toArray()),
                 ['session_id' => $sessionId]
             ))
             ->assertStatus(201);

        $this->assertDatabaseHas('selections', [
            'session_id' => $sessionId,
            'user_id'    => $user->id,
        ]);
    }
}
