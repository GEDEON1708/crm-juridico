<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\LegalCase;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LegalCase>
 */
class LegalCaseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'case_number' => fake()->unique()->numerify('##########'),
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'type' => 'CIVIL',
            'status' => 'ATIVO',
            'court' => fake()->optional()->company().' Court',
            'jurisdiction' => fake()->optional()->word(),
            'judge' => fake()->optional()->name(),
            'value' => fake()->randomFloat(2, 0, 100000),
            'start_date' => now(),
            'end_date' => null,
            'client_id' => Client::factory(),
            'responsible_id' => User::factory(),
        ];
    }
}
