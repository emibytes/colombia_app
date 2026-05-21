<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FederationResource;
use App\Http\Resources\PlayerResource;
use App\Models\Federation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FederationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $federations = Federation::with('confederation')
            ->when($request->confederation, fn ($q, $v) =>
                $q->whereHas('confederation', fn ($q2) => $q2->where('name', $v))
            )
            ->when($request->continent, fn ($q, $v) => $q->where('continent', $v))
            ->when($request->boolean('qualified_wc_2026'), fn ($q) => $q->where('qualified_wc_2026', true))
            ->orderBy('fifa_ranking')
            ->get();

        return response()->json(['data' => FederationResource::collection($federations)]);
    }

    public function show(string $code): JsonResponse
    {
        $federation = Federation::with('confederation')
            ->where('country_code', strtoupper($code))
            ->firstOrFail();

        return response()->json(['data' => new FederationResource($federation)]);
    }

    public function players(Request $request, string $code): JsonResponse
    {
        $federation = Federation::where('country_code', strtoupper($code))->firstOrFail();

        $players = $federation->players()
            ->with('club')
            ->when($request->position, fn ($q, $v) => $q->where('position', $v))
            ->when($request->boolean('prelista'), fn ($q) => $q->where('in_wc_prelista_2026', true))
            ->orderByRaw("
                CASE position
                    WHEN 'goalkeeper' THEN 1
                    WHEN 'defender'   THEN 2
                    WHEN 'midfielder' THEN 3
                    WHEN 'forward'    THEN 4
                END
            ")
            ->orderBy('last_name')
            ->get();

        return response()->json(['data' => PlayerResource::collection($players)]);
    }
}
