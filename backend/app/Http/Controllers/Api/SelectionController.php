<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSelectionRequest;
use App\Models\Selection;
use App\Models\Vote;
use Illuminate\Http\JsonResponse;
use Laravel\Sanctum\PersonalAccessToken;

class SelectionController extends Controller
{
    /**
     * POST /api/selections
     * Save or update a user's squad of 23 + starting 11.
     */
    public function store(StoreSelectionRequest $request): JsonResponse
    {
        $data   = $request->validated();
        $pat    = $request->bearerToken()
                    ? PersonalAccessToken::findToken($request->bearerToken())
                    : null;
        $userId = $pat?->tokenable_id;

        $updateData = [
            'squad_players'   => $data['squad_players'],
            'starting_eleven' => $data['starting_eleven'] ?? null,
            'formation'       => $data['formation'],
        ];
        if ($userId) {
            $updateData['user_id'] = $userId;
        }

        // Preserve share_token on updates; generate a new UUID on create
        $existing   = Selection::where('session_id', $data['session_id'])->first();
        $shareToken = $existing?->share_token ?? (string) \Illuminate\Support\Str::uuid();

        $selection = Selection::updateOrCreate(
            ['session_id' => $data['session_id']],
            array_merge($updateData, ['share_token' => $shareToken])
        );

        if (!empty($data['starting_eleven'])) {
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
            'ok'          => true,
            'message'     => '¡Selección guardada con éxito!',
            'id'          => $selection->id,
            'share_token' => $selection->share_token,
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

        $formationDist = Selection::selectRaw('formation, COUNT(*) as count')
            ->groupBy('formation')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'formation' => $row->formation,
                'count'     => (int) $row->count,
            ]);

        $raw     = config('dt_selection.squad_player_ids', '');
        $dtIds   = ($raw !== '' && $raw !== null)
            ? array_map('intval', explode(',', (string) $raw))
            : [];
        $dtSquad = !empty($dtIds) ? $dtIds : null;

        return response()->json([
            'ok'                     => true,
            'total_selections'       => $total,
            'top_squad'              => $topSquad,
            'top_eleven'             => $topEleven,
            'formation_distribution' => $formationDist,
            'dt_squad'               => $dtSquad,
        ]);
    }
}
