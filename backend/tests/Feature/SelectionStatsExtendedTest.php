<?php

namespace Tests\Feature;

use App\Models\Selection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SelectionStatsExtendedTest extends TestCase
{
    use RefreshDatabase;

    public function test_stats_includes_formation_distribution(): void
    {
        Selection::create([
            'session_id'      => 'sess-a',
            'squad_players'   => [1, 2, 3],
            'starting_eleven' => [1, 2, 3],
            'formation'       => '4-3-3',
        ]);
        Selection::create([
            'session_id'      => 'sess-b',
            'squad_players'   => [4, 5, 6],
            'starting_eleven' => [4, 5, 6],
            'formation'       => '4-3-3',
        ]);
        Selection::create([
            'session_id'      => 'sess-c',
            'squad_players'   => [7, 8, 9],
            'starting_eleven' => [7, 8, 9],
            'formation'       => '4-4-2',
        ]);

        $res = $this->getJson('/api/selections/stats');

        $res->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonStructure([
                'formation_distribution' => [
                    '*' => ['formation', 'count'],
                ],
            ]);

        $dist = collect($res->json('formation_distribution'));
        $this->assertEquals(2, $dist->firstWhere('formation', '4-3-3')['count']);
        $this->assertEquals(1, $dist->firstWhere('formation', '4-4-2')['count']);
    }

    public function test_stats_includes_dt_squad_key(): void
    {
        $res = $this->getJson('/api/selections/stats');

        $res->assertOk()->assertJsonStructure(['dt_squad']);
        $this->assertNull($res->json('dt_squad'));
    }
}
