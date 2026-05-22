<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Confederation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConfederationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Confederation::withCount('federations')->orderBy('name')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                 => ['required', 'string', 'max:20'],
            'full_name'            => ['required', 'string', 'max:150'],
            'region'               => ['required', 'string', 'max:80'],
            'president'            => ['nullable', 'string', 'max:150'],
            'headquarters_city'    => ['nullable', 'string', 'max:100'],
            'headquarters_country' => ['nullable', 'string', 'max:100'],
            'founded_year'         => ['nullable', 'integer', 'min:1800', 'max:2100'],
            'member_nations'       => ['nullable', 'integer', 'min:0'],
            'website'              => ['nullable', 'url'],
            'logo_url'             => ['nullable', 'url'],
        ]);

        return response()->json(Confederation::create($data), 201);
    }

    public function show(Confederation $confederation): JsonResponse
    {
        return response()->json($confederation->loadCount('federations'));
    }

    public function update(Request $request, Confederation $confederation): JsonResponse
    {
        $data = $request->validate([
            'name'                 => ['sometimes', 'string', 'max:20'],
            'full_name'            => ['sometimes', 'string', 'max:150'],
            'region'               => ['sometimes', 'string', 'max:80'],
            'president'            => ['nullable', 'string', 'max:150'],
            'headquarters_city'    => ['nullable', 'string', 'max:100'],
            'headquarters_country' => ['nullable', 'string', 'max:100'],
            'founded_year'         => ['nullable', 'integer', 'min:1800', 'max:2100'],
            'member_nations'       => ['nullable', 'integer', 'min:0'],
            'website'              => ['nullable', 'url'],
            'logo_url'             => ['nullable', 'url'],
        ]);

        $confederation->update($data);

        return response()->json($confederation);
    }

    public function destroy(Confederation $confederation): JsonResponse
    {
        $confederation->delete();

        return response()->json(null, 204);
    }
}
