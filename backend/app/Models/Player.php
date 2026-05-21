<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'federation_id', 'club_id', 'first_name', 'last_name', 'full_name', 'slug',
        'photo_url', 'position', 'jersey_number', 'date_of_birth', 'place_of_birth',
        'nationality', 'height_cm', 'weight_kg', 'international_caps',
        'international_goals', 'strong_foot', 'active', 'in_wc_prelista_2026',
    ];

    protected $casts = [
        'date_of_birth'       => 'date',
        'active'              => 'boolean',
        'in_wc_prelista_2026' => 'boolean',
    ];

    public function federation(): BelongsTo
    {
        return $this->belongsTo(Federation::class);
    }

    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class);
    }
}
