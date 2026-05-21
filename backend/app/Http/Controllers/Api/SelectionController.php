<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSelectionRequest;
use App\Models\Selection;
use App\Models\Vote;
use Illuminate\Http\JsonResponse;

class SelectionController extends Controller
{
    /**
     * POST /api/selections
     * Save or update a user's squad of 23 + starting 11.
     */
    public function store(StoreSelectionRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Upsert — one record per session_id
        $selection = Selection::updateOrCreate(
            ['session_id' => $data['session_id']],
            [
                'squad_players'   => $data['squad_players'],
                'starting_eleven' => $data['starting_eleven'] ?? null,
                'formation'       => $data['formation'],
            ]
        );

        // Record individual votes when a starting 11 is provided
        if (!empty($data['starting_eleven'])) {
            // Remove any previous votes associated with these player IDs
            Vote::whereIn('player_id', array_merge(
                $data['squad_players'],
                $data['starting_eleven']
            ))->delete();

            $votes = [];
            foreach ($data['squad_players'] as $playerId) {
                $votes[] = [
                    'player_id'  => $playerId,
                    'type'       => 'squad',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            foreach ($data['starting_eleven'] as $playerId) {
                $votes[] = [
                    'player_id'  => $playerId,
                    'type'       => 'starting_eleven',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            Vote::insert($votes);
        }

        return response()->json([
            'ok'      => true,
            'message' => '¡Selección guardada con éxito!',
            'id'      => $selection->id,
        ], 201);
    }

    /**
     * GET /api/selections/stats
     * Global stats: most-selected players across all submissions.
     */
    public function stats(): JsonResponse
    {
        $total = Selection::count();

        $topSquad = Vote::where('type', 'squad')
            ->selectRaw('player_id as id, COUNT(*) as votes')
            ->groupBy('player_id')
            ->orderByDesc('votes')
            ->limit(15)
            ->get()
            ->map(fn ($row) => [
                'id'    => $row->id,
                'name'  => '',   // enriched client-side from PLAYERS_MAP
                'votes' => $row->votes,
            ]);

        $topEleven = Vote::where('type', 'starting_eleven')
            ->selectRaw('player_id as id, COUNT(*) as votes')
            ->groupBy('player_id')
            ->orderByDesc('votes')
            ->limit(11)
            ->get()
            ->map(fn ($row) => [
                'id'    => $row->id,
                'name'  => '',
                'votes' => $row->votes,
            ]);

        return response()->json([
            'ok'               => true,
            'total_selections' => $total,
            'top_squad'        => $topSquad,
            'top_eleven'       => $topEleven,
        ]);
    }
}
