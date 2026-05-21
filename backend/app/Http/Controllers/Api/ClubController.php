<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClubResource;
use App\Models\Club;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClubController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $clubs = Club::with('federation')
            ->when($request->country_code, fn ($q, $v) => $q->where('country_code', strtoupper($v)))
            ->when($request->federation_id, fn ($q, $v) => $q->where('federation_id', $v))
            ->orderBy('name')
            ->get();

        return response()->json(['data' => ClubResource::collection($clubs)]);
    }
}
