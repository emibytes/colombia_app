<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlayerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'first_name'          => $this->first_name,
            'last_name'           => $this->last_name,
            'full_name'           => $this->full_name,
            'slug'                => $this->slug,
            'photo_url'           => $this->photo_url,
            'position'            => $this->position,
            'jersey_number'       => $this->jersey_number,
            'date_of_birth'       => $this->date_of_birth?->format('Y-m-d'),
            'age'                 => $this->date_of_birth?->age,
            'place_of_birth'      => $this->place_of_birth,
            'nationality'         => $this->nationality,
            'height_cm'           => $this->height_cm,
            'weight_kg'           => $this->weight_kg,
            'international_caps'  => $this->international_caps,
            'international_goals' => $this->international_goals,
            'strong_foot'         => $this->strong_foot,
            'active'              => $this->active,
            'in_wc_prelista_2026' => $this->in_wc_prelista_2026,
            'club'                => $this->whenLoaded('club', fn () => $this->club ? new ClubResource($this->club) : null),
            'federation'          => $this->whenLoaded('federation', fn () => $this->federation ? [
                'id'         => $this->federation->id,
                'short_name' => $this->federation->short_name,
                'country'    => $this->federation->country,
            ] : null),
        ];
    }
}
