<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Federation extends Model
{
    use HasFactory;

    protected $fillable = [
        'confederation_id', 'name', 'short_name', 'country', 'country_code',
        'continent', 'city', 'president', 'head_coach', 'founded_year',
        'fifa_ranking', 'world_cup_appearances', 'world_cup_titles', 'best_result',
        'national_stadium', 'stadium_capacity', 'primary_color', 'secondary_color',
        'website', 'logo_url', 'latitude', 'longitude', 'qualified_wc_2026',
    ];

    protected $casts = [
        'qualified_wc_2026' => 'boolean',
    ];

    public function confederation(): BelongsTo
    {
        return $this->belongsTo(Confederation::class);
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    public function clubs(): HasMany
    {
        return $this->hasMany(Club::class);
    }
}
