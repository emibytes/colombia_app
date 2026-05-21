<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClubResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'short_name'       => $this->short_name,
            'country'          => $this->country,
            'country_code'     => $this->country_code,
            'city'             => $this->city,
            'stadium_name'     => $this->stadium_name,
            'stadium_capacity' => $this->stadium_capacity,
            'founded_year'     => $this->founded_year,
            'league_name'      => $this->league_name,
            'logo_url'         => $this->logo_url,
            'coordinates'      => [
                'lat' => $this->latitude,
                'lng' => $this->longitude,
            ],
            'federation'       => $this->whenLoaded('federation', fn () => $this->federation ? [
                'id'         => $this->federation->id,
                'short_name' => $this->federation->short_name,
                'country'    => $this->federation->country,
                'logo_url'   => $this->federation->logo_url,
            ] : null),
        ];
    }
}
