<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Club;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClubController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Club::with('federation')->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'federation_id'     => ['nullable', 'exists:federations,id'],
            'name'              => ['required', 'string', 'max:150'],
            'short_name'        => ['nullable', 'string', 'max:20'],
            'country'           => ['nullable', 'string', 'max:100'],
            'country_code'      => ['nullable', 'string', 'max:3'],
            'city'              => ['nullable', 'string', 'max:100'],
            'stadium_name'      => ['nullable', 'string', 'max:150'],
            'stadium_capacity'  => ['nullable', 'integer', 'min:0'],
            'founded_year'      => ['nullable', 'integer', 'min:1800', 'max:2100'],
            'league_name'       => ['nullable', 'string', 'max:150'],
            'logo_url'          => ['nullable', 'url'],
            'website'           => ['nullable', 'url'],
            'latitude'          => ['nullable', 'numeric'],
            'longitude'         => ['nullable', 'numeric'],
        ]);

        $club = Club::create($data);

        return response()->json($club, 201);
    }

    public function show(Club $club): JsonResponse
    {
        return response()->json($club->load('federation'));
    }

    public function update(Request $request, Club $club): JsonResponse
    {
        $data = $request->validate([
            'federation_id'     => ['nullable', 'exists:federations,id'],
            'name'              => ['sometimes', 'string', 'max:150'],
            'short_name'        => ['nullable', 'string', 'max:20'],
            'country'           => ['nullable', 'string', 'max:100'],
            'country_code'      => ['nullable', 'string', 'max:3'],
            'city'              => ['nullable', 'string', 'max:100'],
            'stadium_name'      => ['nullable', 'string', 'max:150'],
            'stadium_capacity'  => ['nullable', 'integer', 'min:0'],
            'founded_year'      => ['nullable', 'integer', 'min:1800', 'max:2100'],
            'league_name'       => ['nullable', 'string', 'max:150'],
            'logo_url'          => ['nullable', 'url'],
            'website'           => ['nullable', 'url'],
            'latitude'          => ['nullable', 'numeric'],
            'longitude'         => ['nullable', 'numeric'],
        ]);

        $club->update($data);

        return response()->json($club);
    }

    public function destroy(Club $club): JsonResponse
    {
        $club->delete();

        return response()->json(null, 204);
    }
}
