<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
            $table->string('google_id')->nullable()->after('remember_token');
            $table->string('facebook_id')->nullable()->after('google_id');
            $table->enum('role', ['user', 'admin'])->default('user')->after('facebook_id');
            $table->timestamp('data_treatment_accepted_at')->nullable()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'facebook_id', 'role', 'data_treatment_accepted_at']);
            $table->string('password')->nullable(false)->change();
        });
    }
};
