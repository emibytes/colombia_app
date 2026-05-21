<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConfederationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'name'                 => $this->name,
            'full_name'            => $this->full_name,
            'region'               => $this->region,
            'president'            => $this->president,
            'headquarters_city'    => $this->headquarters_city,
            'headquarters_country' => $this->headquarters_country,
            'founded_year'         => $this->founded_year,
            'member_nations'       => $this->member_nations,
            'website'              => $this->website,
            'logo_url'             => $this->logo_url,
            'federations_count'    => $this->whenCounted('federations'),
        ];
    }
}
