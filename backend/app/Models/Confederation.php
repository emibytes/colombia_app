<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Confederation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'full_name', 'region', 'president',
        'headquarters_city', 'headquarters_country',
        'founded_year', 'member_nations', 'website', 'logo_url',
    ];

    public function federations(): HasMany
    {
        return $this->hasMany(Federation::class);
    }
}
