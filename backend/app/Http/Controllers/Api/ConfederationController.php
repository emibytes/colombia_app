<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConfederationResource;
use App\Models\Confederation;
use Illuminate\Http\JsonResponse;

class ConfederationController extends Controller
{
    public function index(): JsonResponse
    {
        $confederations = Confederation::withCount('federations')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => ConfederationResource::collection($confederations)]);
    }
}
