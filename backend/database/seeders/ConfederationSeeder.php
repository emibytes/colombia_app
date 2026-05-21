<?php

namespace Database\Seeders;

use App\Models\Confederation;
use Illuminate\Database\Seeder;

class ConfederationSeeder extends Seeder
{
    public function run(): void
    {
        $confederations = [
            [
                'name'                 => 'CONMEBOL',
                'full_name'            => 'Confederación Sudamericana de Fútbol',
                'region'               => 'South America',
                'president'            => 'Alejandro Domínguez',
                'headquarters_city'   => 'Luque',
                'headquarters_country' => 'Paraguay',
                'founded_year'         => 1916,
                'member_nations'       => 10,
                'website'              => 'https://www.conmebol.com',
                'logo_url'             => null,
            ],
            [
                'name'                 => 'UEFA',
                'full_name'            => 'Union of European Football Associations',
                'region'               => 'Europe',
                'president'            => 'Aleksander Čeferin',
                'headquarters_city'   => 'Nyon',
                'headquarters_country' => 'Switzerland',
                'founded_year'         => 1954,
                'member_nations'       => 55,
                'website'              => 'https://www.uefa.com',
                'logo_url'             => null,
            ],
            [
                'name'                 => 'CONCACAF',
                'full_name'            => 'Confederation of North, Central America and Caribbean Association Football',
                'region'               => 'North/Central America & Caribbean',
                'president'            => 'Victor Montagliani',
                'headquarters_city'   => 'Miami',
                'headquarters_country' => 'United States',
                'founded_year'         => 1961,
                'member_nations'       => 41,
                'website'              => 'https://www.concacaf.com',
                'logo_url'             => null,
            ],
            [
                'name'                 => 'AFC',
                'full_name'            => 'Asian Football Confederation',
                'region'               => 'Asia',
                'president'            => 'Sheikh Salman bin Ebrahim Al Khalifa',
                'headquarters_city'   => 'Kuala Lumpur',
                'headquarters_country' => 'Malaysia',
                'founded_year'         => 1954,
                'member_nations'       => 47,
                'website'              => 'https://www.the-afc.com',
                'logo_url'             => null,
            ],
            [
                'name'                 => 'CAF',
                'full_name'            => 'Confederation of African Football',
                'region'               => 'Africa',
                'president'            => 'Patrice Motsepe',
                'headquarters_city'   => 'Cairo',
                'headquarters_country' => 'Egypt',
                'founded_year'         => 1957,
                'member_nations'       => 54,
                'website'              => 'https://www.cafonline.com',
                'logo_url'             => null,
            ],
            [
                'name'                 => 'OFC',
                'full_name'            => 'Oceania Football Confederation',
                'region'               => 'Oceania',
                'president'            => 'Lambert Maltock',
                'headquarters_city'   => 'Auckland',
                'headquarters_country' => 'New Zealand',
                'founded_year'         => 1966,
                'member_nations'       => 14,
                'website'              => 'https://www.oceaniafootball.com',
                'logo_url'             => null,
            ],
        ];

        foreach ($confederations as $data) {
            Confederation::updateOrCreate(['name' => $data['name']], $data);
        }
    }
}
