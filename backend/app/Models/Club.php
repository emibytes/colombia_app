<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Club extends Model
{
    use HasFactory;

    protected $fillable = [
        'federation_id', 'name', 'short_name', 'country', 'country_code', 'city',
        'stadium_name', 'stadium_capacity', 'founded_year', 'league_name',
        'logo_url', 'website', 'latitude', 'longitude',
    ];

    public function federation(): BelongsTo
    {
        return $this->belongsTo(Federation::class);
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }
}
