<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Federation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FederationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Federation::with('confederation')
                ->orderBy('name')
                ->get()
                ->map(fn ($f) => [
                    'id'                 => $f->id,
                    'confederation_id'   => $f->confederation_id,
                    'confederation_name' => $f->confederation?->name,
                    'name'               => $f->name,
                    'short_name'         => $f->short_name,
                    'country'            => $f->country,
                    'country_code'       => $f->country_code,
                    'continent'          => $f->continent,
                    'fifa_ranking'       => $f->fifa_ranking,
                    'qualified_wc_2026'  => $f->qualified_wc_2026,
                    'head_coach'         => $f->head_coach,
                    'founded_year'       => $f->founded_year,
                ])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'confederation_id'   => ['required', 'exists:confederations,id'],
            'name'               => ['required', 'string', 'max:150'],
            'short_name'         => ['required', 'string', 'max:20'],
            'country'            => ['required', 'string', 'max:100'],
            'country_code'       => ['required', 'string', 'max:3', 'unique:federations,country_code'],
            'continent'          => ['required', 'string', 'max:60'],
            'city'               => ['nullable', 'string', 'max:100'],
            'president'          => ['nullable', 'string', 'max:150'],
            'head_coach'         => ['nullable', 'string', 'max:150'],
            'founded_year'       => ['nullable', 'integer', 'min:1800', 'max:2100'],
            'fifa_ranking'       => ['nullable', 'integer', 'min:1', 'max:300'],
            'qualified_wc_2026'  => ['boolean'],
            'national_stadium'   => ['nullable', 'string', 'max:150'],
            'stadium_capacity'   => ['nullable', 'integer', 'min:0'],
            'website'            => ['nullable', 'url'],
            'logo_url'           => ['nullable', 'url'],
            'primary_color'      => ['nullable', 'string', 'max:7'],
            'secondary_color'    => ['nullable', 'string', 'max:7'],
        ]);

        return response()->json(Federation::create($data), 201);
    }

    public function show(Federation $federation): JsonResponse
    {
        return response()->json($federation->load('confederation'));
    }

    public function update(Request $request, Federation $federation): JsonResponse
    {
        $data = $request->validate([
            'confederation_id'   => ['sometimes', 'exists:confederations,id'],
            'name'               => ['sometimes', 'string', 'max:150'],
            'short_name'         => ['sometimes', 'string', 'max:20'],
            'country'            => ['sometimes', 'string', 'max:100'],
            'country_code'       => ['sometimes', 'string', 'max:3', "unique:federations,country_code,{$federation->id}"],
            'continent'          => ['sometimes', 'string', 'max:60'],
            'city'               => ['nullable', 'string', 'max:100'],
            'president'          => ['nullable', 'string', 'max:150'],
            'head_coach'         => ['nullable', 'string', 'max:150'],
            'founded_year'       => ['nullable', 'integer', 'min:1800', 'max:2100'],
            'fifa_ranking'       => ['nullable', 'integer', 'min:1', 'max:300'],
            'qualified_wc_2026'  => ['boolean'],
            'national_stadium'   => ['nullable', 'string', 'max:150'],
            'stadium_capacity'   => ['nullable', 'integer', 'min:0'],
            'website'            => ['nullable', 'url'],
            'logo_url'           => ['nullable', 'url'],
            'primary_color'      => ['nullable', 'string', 'max:7'],
            'secondary_color'    => ['nullable', 'string', 'max:7'],
        ]);

        $federation->update($data);

        return response()->json($federation);
    }

    public function destroy(Federation $federation): JsonResponse
    {
        $federation->delete();

        return response()->json(null, 204);
    }
}
