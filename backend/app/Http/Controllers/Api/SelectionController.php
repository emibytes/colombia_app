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
     * GET /api/selections/share/{token}
     * Public endpoint — returns a selection by share_token with enriched player data.
     */
    public function share(string $token): JsonResponse
    {
        $selection = Selection::where('share_token', $token)->first();

        if (!$selection) {
            return response()->json(['ok' => false, 'message' => 'Selección no encontrada.'], 404);
        }

        $allIds = array_unique(array_merge(
            $selection->squad_players   ?? [],
            $selection->starting_eleven ?? []
        ));

        $positionGroup = [
            'goalkeeper' => 'GK',
            'defender'   => 'DEF',
            'midfielder' => 'MID',
            'forward'    => 'FWD',
        ];
        $positionLabel = [
            'goalkeeper' => 'Portero',
            'defender'   => 'Defensa',
            'midfielder' => 'Mediocampista',
            'forward'    => 'Delantero',
        ];

        $players = \App\Models\Player::with('club')
            ->whereIn('id', $allIds)
            ->get()
            ->keyBy('id')
            ->map(fn ($p) => [
                'id'        => $p->id,
                'name'      => $p->full_name,
                'position'  => $positionLabel[$p->position] ?? $p->position,
                'group'     => $positionGroup[$p->position]  ?? 'MID',
                'age'       => $p->age ?? 0,
                'club'      => $p->club?->name ?? '',
                'country'   => $p->nationality ?? '',
                'photo_url' => $p->photo_url,
            ]);

        return response()->json([
            'ok'              => true,
            'share_token'     => $token,
            'squad_players'   => $selection->squad_players,
            'starting_eleven' => $selection->starting_eleven,
            'formation'       => $selection->formation,
            'players'         => $players,
        ]);
    }

    /**
     * GET /api/selections/stats
     * Global stats: most-selected players across all submissions.
     */
    public function stats(): JsonResponse
    {
        $total = Selection::count();

        $topSquad = Vote::where('votes.type', 'squad')
            ->join('players', 'players.id', '=', 'votes.player_id')
            ->selectRaw('votes.player_id as id, players.full_name as name, COUNT(*) as votes')
            ->groupBy('votes.player_id', 'players.full_name')
            ->orderByDesc('votes')
            ->limit(15)
            ->get()
            ->map(fn ($row) => [
                'id'    => $row->id,
                'name'  => $row->name,
                'votes' => $row->votes,
            ]);

        $topEleven = Vote::where('votes.type', 'starting_eleven')
            ->join('players', 'players.id', '=', 'votes.player_id')
            ->selectRaw('votes.player_id as id, players.full_name as name, COUNT(*) as votes')
            ->groupBy('votes.player_id', 'players.full_name')
            ->orderByDesc('votes')
            ->limit(11)
            ->get()
            ->map(fn ($row) => [
                'id'    => $row->id,
                'name'  => $row->name,
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
