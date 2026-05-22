<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@colombia-app.test'],
            [
                'name'                       => 'Admin',
                'password'                   => Hash::make('colombia2026'),
                'role'                       => 'admin',
                'data_treatment_accepted_at' => now(),
            ]
        );
    }
}
