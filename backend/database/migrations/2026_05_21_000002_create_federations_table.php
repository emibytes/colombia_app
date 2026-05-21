<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('federations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('confederation_id')->constrained('confederations')->cascadeOnDelete();
            $table->string('name', 150);                          // Federación Colombiana de Fútbol
            $table->string('short_name', 20);                     // FCF
            $table->string('country', 100);                       // Colombia
            $table->string('country_code', 3)->unique();          // COL (ISO 3166-1 alpha-3)
            $table->string('continent', 60);                      // South America
            $table->string('city', 100)->nullable();              // Sede administrativa
            $table->string('president', 150)->nullable();
            $table->string('head_coach', 150)->nullable();
            $table->unsignedSmallInteger('founded_year')->nullable();
            $table->unsignedSmallInteger('fifa_ranking')->nullable();
            $table->unsignedSmallInteger('world_cup_appearances')->default(0);
            $table->unsignedTinyInteger('world_cup_titles')->default(0);
            $table->string('best_result', 100)->nullable();       // Cuartos de final (2014)
            $table->string('national_stadium', 150)->nullable();
            $table->unsignedInteger('stadium_capacity')->nullable();
            $table->string('primary_color', 7)->nullable();       // hex: #FCD116
            $table->string('secondary_color', 7)->nullable();     // hex: #003087
            $table->string('website', 200)->nullable();
            $table->string('logo_url', 500)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->boolean('qualified_wc_2026')->default(false);
            $table->timestamps();

            $table->index('confederation_id');
            $table->index('continent');
            $table->index('qualified_wc_2026');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('federations');
    }
};
