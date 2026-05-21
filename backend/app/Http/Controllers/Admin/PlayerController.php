<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PlayerController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Player::with(['federation', 'club'])->orderBy('full_name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'federation_id'        => ['required', 'exists:federations,id'],
            'club_id'              => ['nullable', 'exists:clubs,id'],
            'first_name'           => ['required', 'string', 'max:100'],
            'last_name'            => ['required', 'string', 'max:100'],
            'photo_url'            => ['nullable', 'url'],
            'position'             => ['required', 'in:goalkeeper,defender,midfielder,forward'],
            'jersey_number'        => ['nullable', 'integer', 'min:1', 'max:99'],
            'date_of_birth'        => ['nullable', 'date'],
            'place_of_birth'       => ['nullable', 'string', 'max:100'],
            'nationality'          => ['nullable', 'string', 'max:100'],
            'height_cm'            => ['nullable', 'integer'],
            'weight_kg'            => ['nullable', 'integer'],
            'international_caps'   => ['nullable', 'integer', 'min:0'],
            'international_goals'  => ['nullable', 'integer', 'min:0'],
            'strong_foot'          => ['nullable', 'in:left,right,both'],
            'active'               => ['boolean'],
            'in_wc_prelista_2026'  => ['boolean'],
        ]);

        $data['full_name'] = trim($data['first_name'] . ' ' . $data['last_name']);
        $data['slug']      = Str::slug($data['full_name']);

        $player = Player::create($data);

        return response()->json($player, 201);
    }

    public function show(Player $player): JsonResponse
    {
        return response()->json($player->load(['federation', 'club']));
    }

    public function update(Request $request, Player $player): JsonResponse
    {
        $data = $request->validate([
            'federation_id'        => ['sometimes', 'exists:federations,id'],
            'club_id'              => ['nullable', 'exists:clubs,id'],
            'first_name'           => ['sometimes', 'string', 'max:100'],
            'last_name'            => ['sometimes', 'string', 'max:100'],
            'photo_url'            => ['nullable', 'url'],
            'position'             => ['sometimes', 'in:goalkeeper,defender,midfielder,forward'],
            'jersey_number'        => ['nullable', 'integer', 'min:1', 'max:99'],
            'date_of_birth'        => ['nullable', 'date'],
            'place_of_birth'       => ['nullable', 'string', 'max:100'],
            'nationality'          => ['nullable', 'string', 'max:100'],
            'height_cm'            => ['nullable', 'integer'],
            'weight_kg'            => ['nullable', 'integer'],
            'international_caps'   => ['nullable', 'integer', 'min:0'],
            'international_goals'  => ['nullable', 'integer', 'min:0'],
            'strong_foot'          => ['nullable', 'in:left,right,both'],
            'active'               => ['boolean'],
            'in_wc_prelista_2026'  => ['boolean'],
        ]);

        if (isset($data['first_name']) || isset($data['last_name'])) {
            $firstName = $data['first_name'] ?? $player->first_name;
            $lastName  = $data['last_name']  ?? $player->last_name;
            $data['full_name'] = trim($firstName . ' ' . $lastName);
            $data['slug']      = Str::slug($data['full_name']);
        }

        $player->update($data);

        return response()->json($player);
    }

    public function destroy(Player $player): JsonResponse
    {
        $player->delete();

        return response()->json(null, 204);
    }
}
