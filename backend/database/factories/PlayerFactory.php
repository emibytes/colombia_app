<?php

namespace Database\Factories;

use App\Models\Club;
use App\Models\Federation;
use App\Models\Player;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PlayerFactory extends Factory
{
    protected $model = Player::class;

    public function definition(): array
    {
        $first = $this->faker->firstName('male');
        $last  = $this->faker->lastName();
        $full  = $first . ' ' . $last;

        return [
            'federation_id'       => Federation::factory(),
            'club_id'             => Club::factory(),
            'first_name'          => $first,
            'last_name'           => $last,
            'full_name'           => $full,
            'slug'                => Str::slug($full) . '-' . $this->faker->unique()->randomNumber(5),
            'photo_url'           => null,
            'position'            => $this->faker->randomElement(['goalkeeper', 'defender', 'midfielder', 'forward']),
            'jersey_number'       => null,
            'date_of_birth'       => $this->faker->dateTimeBetween('-38 years', '-18 years')->format('Y-m-d'),
            'place_of_birth'      => $this->faker->city() . ', Colombia',
            'nationality'         => 'Colombia',
            'height_cm'           => $this->faker->numberBetween(165, 200),
            'weight_kg'           => $this->faker->numberBetween(60, 95),
            'international_caps'  => $this->faker->numberBetween(0, 120),
            'international_goals' => $this->faker->numberBetween(0, 30),
            'strong_foot'         => $this->faker->randomElement(['left', 'right']),
            'active'              => true,
            'in_wc_prelista_2026' => false,
        ];
    }

    public function inPrelista(): static
    {
        return $this->state(['in_wc_prelista_2026' => true]);
    }

    public function goalkeeper(): static
    {
        return $this->state(['position' => 'goalkeeper']);
    }

    public function defender(): static
    {
        return $this->state(['position' => 'defender']);
    }

    public function midfielder(): static
    {
        return $this->state(['position' => 'midfielder']);
    }

    public function forward(): static
    {
        return $this->state(['position' => 'forward']);
    }
}
