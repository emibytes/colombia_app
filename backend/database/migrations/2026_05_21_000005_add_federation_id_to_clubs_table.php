<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clubs', function (Blueprint $table) {
            // nullable: se llena cuando exista la federación del país del club
            $table->foreignId('federation_id')
                  ->nullable()
                  ->after('id')
                  ->constrained('federations')
                  ->nullOnDelete();

            $table->index('federation_id');
        });
    }

    public function down(): void
    {
        Schema::table('clubs', function (Blueprint $table) {
            $table->dropForeign(['federation_id']);
            $table->dropColumn('federation_id');
        });
    }
};
