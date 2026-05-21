<?php

namespace Database\Factories;

use App\Models\Confederation;
use App\Models\Federation;
use Illuminate\Database\Eloquent\Factories\Factory;

class FederationFactory extends Factory
{
    protected $model = Federation::class;

    public function definition(): array
    {
        return [
            'confederation_id'      => Confederation::factory(),
            'name'                  => $this->faker->country() . ' Football Federation',
            'short_name'            => $this->faker->unique()->regexify('[A-Z]{2,4}'),
            'country'               => $this->faker->country(),
            'country_code'          => $this->faker->unique()->regexify('[A-Z]{3}'),
            'continent'             => $this->faker->randomElement(['South America', 'Europe', 'Africa', 'Asia', 'North America', 'Oceania']),
            'city'                  => $this->faker->city(),
            'president'             => $this->faker->name(),
            'head_coach'            => $this->faker->name(),
            'founded_year'          => $this->faker->numberBetween(1890, 1960),
            'fifa_ranking'          => $this->faker->numberBetween(1, 210),
            'world_cup_appearances' => $this->faker->numberBetween(0, 22),
            'world_cup_titles'      => 0,
            'best_result'           => 'Primera ronda',
            'national_stadium'      => $this->faker->city() . ' Stadium',
            'stadium_capacity'      => $this->faker->numberBetween(10000, 90000),
            'primary_color'         => $this->faker->hexColor(),   // hexColor() ya incluye #
            'secondary_color'       => $this->faker->hexColor(),
            'website'               => $this->faker->url(),
            'logo_url'              => null,
            'latitude'              => $this->faker->latitude(),
            'longitude'             => $this->faker->longitude(),
            'qualified_wc_2026'     => false,
        ];
    }

    public function qualified(): static
    {
        return $this->state(['qualified_wc_2026' => true]);
    }
}
