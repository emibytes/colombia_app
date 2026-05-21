<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlayerResource;
use App\Models\Player;
use Illuminate\Http\JsonResponse;

class PlayerController extends Controller
{
    public function show(string $slug): JsonResponse
    {
        $player = Player::with(['federation', 'club'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json(['data' => new PlayerResource($player)]);
    }
}
