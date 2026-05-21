<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('player_id');
            $table->enum('type', ['squad', 'starting_eleven']);
            $table->timestamps();
            $table->index('player_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};
