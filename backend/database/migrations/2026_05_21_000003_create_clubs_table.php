<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clubs', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('short_name', 60)->nullable();
            $table->string('country', 100);
            $table->string('country_code', 3)->nullable();        // ISO 3166-1 alpha-3
            $table->string('city', 100)->nullable();
            $table->string('stadium_name', 150)->nullable();
            $table->unsignedInteger('stadium_capacity')->nullable();
            $table->unsignedSmallInteger('founded_year')->nullable();
            $table->string('league_name', 150)->nullable();
            $table->string('logo_url', 500)->nullable();
            $table->string('website', 200)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamps();

            $table->index('country_code');
            $table->index('country');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clubs');
    }
};
