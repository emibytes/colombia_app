<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('confederations', function (Blueprint $table) {
            $table->id();
            $table->string('name', 20)->unique();           // CONMEBOL, UEFA…
            $table->string('full_name', 150);
            $table->string('region', 80);                   // South America, Europe…
            $table->string('president', 150)->nullable();
            $table->string('headquarters_city', 100)->nullable();
            $table->string('headquarters_country', 100)->nullable();
            $table->unsignedSmallInteger('founded_year')->nullable();
            $table->unsignedTinyInteger('member_nations')->nullable();
            $table->string('website', 200)->nullable();
            $table->string('logo_url', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('confederations');
    }
};
