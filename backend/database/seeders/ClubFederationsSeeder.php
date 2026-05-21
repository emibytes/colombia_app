<?php

namespace Database\Seeders;

use App\Models\Club;
use App\Models\Confederation;
use App\Models\Federation;
use Illuminate\Database\Seeder;

class ClubFederationsSeeder extends Seeder
{
    public function run(): void
    {
        $conmebol  = Confederation::where('name', 'CONMEBOL')->firstOrFail();
        $uefa      = Confederation::where('name', 'UEFA')->firstOrFail();
        $concacaf  = Confederation::where('name', 'CONCACAF')->firstOrFail();

        // ─────────────────────────────────────────────────────────────────────
        // Federaciones que necesitamos para cubrir los clubes sembrados
        // ─────────────────────────────────────────────────────────────────────
        $federations = [

            // ── CONMEBOL ─────────────────────────────────────────────────────
            [
                'confederation_id'    => $conmebol->id,
                'name'                => 'Asociación del Fútbol Argentino',
                'short_name'          => 'AFA',
                'country'             => 'Argentina',
                'country_code'        => 'ARG',
                'continent'           => 'South America',
                'city'                => 'Buenos Aires',
                'president'           => 'Claudio Tapia',
                'head_coach'          => 'Lionel Scaloni',
                'founded_year'        => 1893,
                'fifa_ranking'        => 1,
                'world_cup_appearances' => 18,
                'world_cup_titles'    => 3,
                'best_result'         => 'Campeón (1978, 1986, 2022)',
                'national_stadium'    => 'Estadio Monumental',
                'stadium_capacity'    => 84567,
                'primary_color'       => '#75AADB',
                'secondary_color'     => '#FFFFFF',
                'website'             => 'https://www.afa.com.ar',
                'latitude'            => -34.5454,
                'longitude'           => -58.4499,
                'qualified_wc_2026'   => true,
            ],
            [
                'confederation_id'    => $conmebol->id,
                'name'                => 'Confederação Brasileira de Futebol',
                'short_name'          => 'CBF',
                'country'             => 'Brazil',
                'country_code'        => 'BRA',
                'continent'           => 'South America',
                'city'                => 'Rio de Janeiro',
                'president'           => 'Ednaldo Rodrigues',
                'head_coach'          => 'Dorival Júnior',
                'founded_year'        => 1914,
                'fifa_ranking'        => 5,
                'world_cup_appearances' => 22,
                'world_cup_titles'    => 5,
                'best_result'         => 'Campeón (1958, 1962, 1970, 1994, 2002)',
                'national_stadium'    => 'Estádio do Maracanã',
                'stadium_capacity'    => 78838,
                'primary_color'       => '#009C3B',
                'secondary_color'     => '#FFDF00',
                'website'             => 'https://www.cbf.com.br',
                'latitude'            => -22.9068,
                'longitude'           => -43.1729,
                'qualified_wc_2026'   => true,
            ],
            [
                'confederation_id'    => $conmebol->id,
                'name'                => 'Federación Ecuatoriana de Fútbol',
                'short_name'          => 'FEF',
                'country'             => 'Ecuador',
                'country_code'        => 'ECU',
                'continent'           => 'South America',
                'city'                => 'Guayaquil',
                'president'           => 'Francisco Egas',
                'head_coach'          => 'Sebastián Beccacece',
                'founded_year'        => 1925,
                'fifa_ranking'        => 38,
                'world_cup_appearances' => 4,
                'world_cup_titles'    => 0,
                'best_result'         => 'Segunda ronda (2002, 2006)',
                'national_stadium'    => 'Estadio Rodrigo Paz Delgado',
                'stadium_capacity'    => 41575,
                'primary_color'       => '#FFD700',
                'secondary_color'     => '#003087',
                'website'             => 'https://www.fef.ec',
                'latitude'            => -0.1807,
                'longitude'           => -78.4678,
                'qualified_wc_2026'   => true,
            ],

            // ── UEFA ─────────────────────────────────────────────────────────
            [
                'confederation_id'    => $uefa->id,
                'name'                => 'Football Association',
                'short_name'          => 'FA',
                'country'             => 'England',
                'country_code'        => 'ENG',
                'continent'           => 'Europe',
                'city'                => 'London',
                'president'           => 'Mark Bullingham',
                'head_coach'          => 'Thomas Tuchel',
                'founded_year'        => 1863,
                'fifa_ranking'        => 5,
                'world_cup_appearances' => 16,
                'world_cup_titles'    => 1,
                'best_result'         => 'Campeón (1966)',
                'national_stadium'    => 'Wembley Stadium',
                'stadium_capacity'    => 90000,
                'primary_color'       => '#FFFFFF',
                'secondary_color'     => '#003087',
                'website'             => 'https://www.thefa.com',
                'latitude'            => 51.5560,
                'longitude'           => -0.2795,
                'qualified_wc_2026'   => true,
            ],
            [
                'confederation_id'    => $uefa->id,
                'name'                => 'Deutscher Fußball-Bund',
                'short_name'          => 'DFB',
                'country'             => 'Germany',
                'country_code'        => 'GER',
                'continent'           => 'Europe',
                'city'                => 'Frankfurt',
                'president'           => 'Bernd Neuendorf',
                'head_coach'          => 'Julian Nagelsmann',
                'founded_year'        => 1900,
                'fifa_ranking'        => 16,
                'world_cup_appearances' => 20,
                'world_cup_titles'    => 4,
                'best_result'         => 'Campeón (1954, 1974, 1990, 2014)',
                'national_stadium'    => 'Olympiastadion Berlin',
                'stadium_capacity'    => 74475,
                'primary_color'       => '#FFFFFF',
                'secondary_color'     => '#000000',
                'website'             => 'https://www.dfb.de',
                'latitude'            => 50.0600,
                'longitude'           => 8.6285,
                'qualified_wc_2026'   => true,
            ],
            [
                'confederation_id'    => $uefa->id,
                'name'                => 'Fédération Française de Football',
                'short_name'          => 'FFF',
                'country'             => 'France',
                'country_code'        => 'FRA',
                'continent'           => 'Europe',
                'city'                => 'Paris',
                'president'           => 'Philippe Diallo',
                'head_coach'          => 'Didier Deschamps',
                'founded_year'        => 1919,
                'fifa_ranking'        => 2,
                'world_cup_appearances' => 16,
                'world_cup_titles'    => 2,
                'best_result'         => 'Campeón (1998, 2018)',
                'national_stadium'    => 'Stade de France',
                'stadium_capacity'    => 81338,
                'primary_color'       => '#003087',
                'secondary_color'     => '#FFFFFF',
                'website'             => 'https://www.fff.fr',
                'latitude'            => 48.9245,
                'longitude'           => 2.3601,
                'qualified_wc_2026'   => true,
            ],
            [
                'confederation_id'    => $uefa->id,
                'name'                => 'Federazione Italiana Giuoco Calcio',
                'short_name'          => 'FIGC',
                'country'             => 'Italy',
                'country_code'        => 'ITA',
                'continent'           => 'Europe',
                'city'                => 'Rome',
                'president'           => 'Gabriele Gravina',
                'head_coach'          => 'Luciano Spalletti',
                'founded_year'        => 1898,
                'fifa_ranking'        => 9,
                'world_cup_appearances' => 18,
                'world_cup_titles'    => 4,
                'best_result'         => 'Campeón (1934, 1938, 1982, 2006)',
                'national_stadium'    => 'Stadio Olimpico',
                'stadium_capacity'    => 72698,
                'primary_color'       => '#003087',
                'secondary_color'     => '#FFFFFF',
                'website'             => 'https://www.figc.it',
                'latitude'            => 41.9348,
                'longitude'           => 12.4547,
                'qualified_wc_2026'   => true,
            ],
            [
                'confederation_id'    => $uefa->id,
                'name'                => 'Federação Portuguesa de Futebol',
                'short_name'          => 'FPF',
                'country'             => 'Portugal',
                'country_code'        => 'POR',
                'continent'           => 'Europe',
                'city'                => 'Lisbon',
                'president'           => 'Fernando Gomes',
                'head_coach'          => 'Roberto Martínez',
                'founded_year'        => 1914,
                'fifa_ranking'        => 6,
                'world_cup_appearances' => 8,
                'world_cup_titles'    => 0,
                'best_result'         => 'Tercer lugar (1966)',
                'national_stadium'    => 'Estádio da Luz',
                'stadium_capacity'    => 64642,
                'primary_color'       => '#006600',
                'secondary_color'     => '#FF0000',
                'website'             => 'https://www.fpf.pt',
                'latitude'            => 38.7167,
                'longitude'           => -9.1393,
                'qualified_wc_2026'   => true,
            ],
            [
                'confederation_id'    => $uefa->id,
                'name'                => 'Russian Football Union',
                'short_name'          => 'RFU',
                'country'             => 'Russia',
                'country_code'        => 'RUS',
                'continent'           => 'Europe',
                'city'                => 'Moscow',
                'president'           => 'Alexander Dyukov',
                'head_coach'          => null,
                'founded_year'        => 1912,
                'fifa_ranking'        => null,
                'world_cup_appearances' => 11,
                'world_cup_titles'    => 0,
                'best_result'         => 'Cuartos de final (2018)',
                'national_stadium'    => 'Luzhniki Stadium',
                'stadium_capacity'    => 81000,
                'primary_color'       => '#CC0000',
                'secondary_color'     => '#FFFFFF',
                'website'             => 'https://www.rfs.ru',
                'latitude'            => 55.7522,
                'longitude'           => 37.5601,
                'qualified_wc_2026'   => false, // suspendida de competencias FIFA/UEFA
            ],
            [
                'confederation_id'    => $uefa->id,
                'name'                => 'Real Federación Española de Fútbol',
                'short_name'          => 'RFEF',
                'country'             => 'Spain',
                'country_code'        => 'ESP',
                'continent'           => 'Europe',
                'city'                => 'Madrid',
                'president'           => 'Rafael Louzan',
                'head_coach'          => 'Luis de la Fuente',
                'founded_year'        => 1913,
                'fifa_ranking'        => 3,
                'world_cup_appearances' => 16,
                'world_cup_titles'    => 1,
                'best_result'         => 'Campeón (2010)',
                'national_stadium'    => 'Estadio de La Cartuja',
                'stadium_capacity'    => 57619,
                'primary_color'       => '#CC0000',
                'secondary_color'     => '#FFD700',
                'website'             => 'https://www.rfef.es',
                'latitude'            => 40.4530,
                'longitude'           => -3.6883,
                'qualified_wc_2026'   => true,
            ],
            [
                'confederation_id'    => $uefa->id,
                'name'                => 'Türkiye Futbol Federasyonu',
                'short_name'          => 'TFF',
                'country'             => 'Turkey',
                'country_code'        => 'TUR',
                'continent'           => 'Europe',
                'city'                => 'Istanbul',
                'president'           => 'İbrahim Hacıosmanoğlu',
                'head_coach'          => 'Vincenzo Montella',
                'founded_year'        => 1923,
                'fifa_ranking'        => 25,
                'world_cup_appearances' => 2,
                'world_cup_titles'    => 0,
                'best_result'         => 'Tercer lugar (2002)',
                'national_stadium'    => 'Atatürk Olimpiyat Stadyumu',
                'stadium_capacity'    => 76092,
                'primary_color'       => '#CC0000',
                'secondary_color'     => '#FFFFFF',
                'website'             => 'https://www.tff.org',
                'latitude'            => 41.0082,
                'longitude'           => 28.9784,
                'qualified_wc_2026'   => true,
            ],

            // ── CONCACAF ─────────────────────────────────────────────────────
            [
                'confederation_id'    => $concacaf->id,
                'name'                => 'Federación Mexicana de Fútbol',
                'short_name'          => 'FMF',
                'country'             => 'México',
                'country_code'        => 'MEX',
                'continent'           => 'North America',
                'city'                => 'Ciudad de México',
                'president'           => 'Ivar Sisniega',
                'head_coach'          => 'Javier Aguirre',
                'founded_year'        => 1927,
                'fifa_ranking'        => 14,
                'world_cup_appearances' => 17,
                'world_cup_titles'    => 0,
                'best_result'         => 'Cuartos de final (1970, 1986)',
                'national_stadium'    => 'Estadio Azteca',
                'stadium_capacity'    => 87523,
                'primary_color'       => '#006847',
                'secondary_color'     => '#FFFFFF',
                'website'             => 'https://www.fmf.mx',
                'latitude'            => 19.4284,
                'longitude'           => -99.1276,
                'qualified_wc_2026'   => true, // coanfitrión
            ],
            [
                'confederation_id'    => $concacaf->id,
                'name'                => 'Canada Soccer',
                'short_name'          => 'CSA',
                'country'             => 'Canada',
                'country_code'        => 'CAN',
                'continent'           => 'North America',
                'city'                => 'Ottawa',
                'president'           => 'Nick Bontis',
                'head_coach'          => 'Jesse Marsch',
                'founded_year'        => 1912,
                'fifa_ranking'        => 40,
                'world_cup_appearances' => 4,
                'world_cup_titles'    => 0,
                'best_result'         => 'Fase de grupos (1986, 2022)',
                'national_stadium'    => 'BMO Field',
                'stadium_capacity'    => 30991,
                'primary_color'       => '#CC0000',
                'secondary_color'     => '#FFFFFF',
                'website'             => 'https://www.canadasoccer.com',
                'latitude'            => 45.4215,
                'longitude'           => -75.6972,
                'qualified_wc_2026'   => true, // coanfitrión
            ],
            [
                'confederation_id'    => $concacaf->id,
                'name'                => 'United States Soccer Federation',
                'short_name'          => 'USSF',
                'country'             => 'United States',
                'country_code'        => 'USA',
                'continent'           => 'North America',
                'city'                => 'Chicago',
                'president'           => 'Cindy Parlow Cone',
                'head_coach'          => 'Mauricio Pochettino',
                'founded_year'        => 1913,
                'fifa_ranking'        => 11,
                'world_cup_appearances' => 11,
                'world_cup_titles'    => 0,
                'best_result'         => 'Tercer lugar (1930)',
                'national_stadium'    => 'Rose Bowl',
                'stadium_capacity'    => 92542,
                'primary_color'       => '#002868',
                'secondary_color'     => '#BF0A30',
                'website'             => 'https://www.ussoccer.com',
                'latitude'            => 41.8827,
                'longitude'           => -87.6233,
                'qualified_wc_2026'   => true, // coanfitrión
            ],
        ];

        // Upsert federaciones
        foreach ($federations as $data) {
            Federation::updateOrCreate(['country_code' => $data['country_code']], $data);
        }

        // ─────────────────────────────────────────────────────────────────────
        // Mapa: nombre de club → country_code de su federación
        // ─────────────────────────────────────────────────────────────────────
        $clubFederationMap = [
            // Colombia
            'Atlético Nacional'          => 'COL',
            'Independiente Santa Fe'     => 'COL',
            'Deportes Tolima'            => 'COL',

            // Argentina
            'Vélez Sarsfield'            => 'ARG',
            'Club Atlético Independiente' => 'ARG',
            'San Lorenzo'               => 'ARG',
            'River Plate'               => 'ARG',
            'Independiente Rivadavia'    => 'ARG',
            'Estudiantes de La Plata'    => 'ARG',
            'Rosario Central'           => 'ARG',

            // México
            'Atlas'                     => 'MEX',
            'Cruz Azul'                 => 'MEX',
            'Pumas UNAM'                => 'MEX',
            'Club América'              => 'MEX',

            // Ecuador
            'Independiente del Valle'   => 'ECU',

            // Inglaterra
            'Crystal Palace'            => 'ENG',
            'Wolverhampton Wanderers'   => 'ENG',
            'Birmingham City'           => 'ENG',

            // Italia
            'Bologna'                   => 'ITA',
            'Cagliari'                  => 'ITA',
            'Juventus'                  => 'ITA',
            'Pisa Calcio'               => 'ITA',

            // Turquía
            'Galatasaray'               => 'TUR',

            // España
            'RCD Mallorca'              => 'ESP',
            'Real Betis'                => 'ESP',
            'Racing de Santander'       => 'ESP',

            // Brasil
            'Vasco da Gama'             => 'BRA',
            'Flamengo'                  => 'BRA',
            'Coritiba'                  => 'BRA',
            'Athletico Paranaense'      => 'BRA',
            'Botafogo'                  => 'BRA',
            'Palmeiras'                 => 'BRA',
            'Cruzeiro'                  => 'BRA',
            'Internacional'             => 'BRA',

            // Francia
            'FC Nantes'                 => 'FRA',

            // Canadá
            'Vancouver Whitecaps'       => 'CAN',

            // Estados Unidos
            'Minnesota United'          => 'USA',

            // Rusia
            'Zenit'                     => 'RUS',
            'Krasnodar'                 => 'RUS',

            // Portugal
            'Benfica'                   => 'POR',
            'Sporting CP'               => 'POR',

            // Alemania
            'Bayern Munich'             => 'GER',
        ];

        // Cargar federaciones en memoria para evitar N+1
        $federationIndex = Federation::whereIn('country_code', array_unique(array_values($clubFederationMap)))
            ->pluck('id', 'country_code');

        foreach ($clubFederationMap as $clubName => $countryCode) {
            $federationId = $federationIndex[$countryCode] ?? null;
            if ($federationId) {
                Club::where('name', $clubName)->update(['federation_id' => $federationId]);
            }
        }
    }
}
