<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ConfederationSeeder::class,
            ColombiaSeeder::class,
            ClubFederationsSeeder::class, // añade 14 federaciones y vincula los clubes
        ]);
    }
}
