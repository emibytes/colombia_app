<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('federation_id')->constrained('federations')->cascadeOnDelete();
            $table->foreignId('club_id')->nullable()->constrained('clubs')->nullOnDelete();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('full_name', 200);
            $table->string('slug', 200)->unique();               // james-rodriguez, luis-diaz
            $table->string('photo_url', 500)->nullable();        // players/colombia/james-rodriguez.jpg
            $table->enum('position', ['goalkeeper', 'defender', 'midfielder', 'forward']);
            $table->unsignedTinyInteger('jersey_number')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('place_of_birth', 150)->nullable();
            $table->string('nationality', 100)->default('Colombia');
            $table->unsignedSmallInteger('height_cm')->nullable();
            $table->unsignedSmallInteger('weight_kg')->nullable();
            $table->unsignedSmallInteger('international_caps')->default(0);
            $table->unsignedSmallInteger('international_goals')->default(0);
            $table->enum('strong_foot', ['left', 'right', 'both'])->nullable();
            $table->boolean('active')->default(true);
            $table->boolean('in_wc_prelista_2026')->default(false);
            $table->timestamps();

            $table->index('federation_id');
            $table->index('position');
            $table->index('club_id');
            $table->index('in_wc_prelista_2026');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
