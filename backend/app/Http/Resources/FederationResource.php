<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FederationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'name'                  => $this->name,
            'short_name'            => $this->short_name,
            'country'               => $this->country,
            'country_code'          => $this->country_code,
            'continent'             => $this->continent,
            'city'                  => $this->city,
            'president'             => $this->president,
            'head_coach'            => $this->head_coach,
            'founded_year'          => $this->founded_year,
            'fifa_ranking'          => $this->fifa_ranking,
            'world_cup_appearances' => $this->world_cup_appearances,
            'world_cup_titles'      => $this->world_cup_titles,
            'best_result'           => $this->best_result,
            'national_stadium'      => $this->national_stadium,
            'stadium_capacity'      => $this->stadium_capacity,
            'primary_color'         => $this->primary_color,
            'secondary_color'       => $this->secondary_color,
            'website'               => $this->website,
            'logo_url'              => $this->logo_url,
            'coordinates'           => [
                'lat' => $this->latitude,
                'lng' => $this->longitude,
            ],
            'qualified_wc_2026'     => $this->qualified_wc_2026,
            'confederation'         => new ConfederationResource($this->whenLoaded('confederation')),
        ];
    }
}
