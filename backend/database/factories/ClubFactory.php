<?php

namespace Database\Factories;

use App\Models\Club;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClubFactory extends Factory
{
    protected $model = Club::class;

    public function definition(): array
    {
        return [
            'federation_id'    => null,
            'name'             => $this->faker->company() . ' FC',
            'short_name'       => $this->faker->word(),
            'country'          => $this->faker->country(),
            'country_code'     => $this->faker->regexify('[A-Z]{3}'),
            'city'             => $this->faker->city(),
            'stadium_name'     => $this->faker->city() . ' Stadium',
            'stadium_capacity' => $this->faker->numberBetween(5000, 90000),
            'founded_year'     => $this->faker->numberBetween(1880, 2010),
            'league_name'      => $this->faker->word() . ' League',
            'logo_url'         => null,
            'website'          => $this->faker->url(),
            'latitude'         => $this->faker->latitude(),
            'longitude'        => $this->faker->longitude(),
        ];
    }
}
