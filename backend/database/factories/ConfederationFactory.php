<?php

namespace Database\Factories;

use App\Models\Confederation;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConfederationFactory extends Factory
{
    protected $model = Confederation::class;

    public function definition(): array
    {
        return [
            'name'                 => $this->faker->unique()->regexify('[A-Z]{3,8}'),
            'full_name'            => $this->faker->company() . ' Football Confederation',
            'region'               => $this->faker->randomElement(['South America', 'Europe', 'Africa', 'Asia', 'North America', 'Oceania']),
            'president'            => $this->faker->name(),
            'headquarters_city'    => $this->faker->city(),
            'headquarters_country' => $this->faker->country(),
            'founded_year'         => $this->faker->numberBetween(1900, 1970),
            'member_nations'       => $this->faker->numberBetween(10, 55),
            'website'              => $this->faker->url(),
            'logo_url'             => null,
        ];
    }
}
