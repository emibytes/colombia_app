<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('selections', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 100)->unique();
            $table->json('squad_players');
            $table->json('starting_eleven')->nullable();
            $table->string('formation', 20)->default('4-3-3');
            $table->timestamps();
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('selections');
    }
};
