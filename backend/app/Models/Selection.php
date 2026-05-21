<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Selection extends Model
{
    protected $table = 'selections';

    protected $fillable = ['session_id', 'squad_players', 'starting_eleven', 'formation'];

    protected $casts = [
        'squad_players'   => 'array',
        'starting_eleven' => 'array',
    ];

    public function votes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Vote::class, 'session_id', 'session_id');
    }
}
