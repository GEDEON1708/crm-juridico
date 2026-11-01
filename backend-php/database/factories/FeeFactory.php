<?php

namespace Database\Factories;

use App\Models\Fee;
use App\Models\LegalCase;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Fee>
 */
class FeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'description' => fake()->sentence(4),
            'amount' => fake()->randomFloat(2, 1, 100000),
            'due_date' => now()->addDays(15),
            'paid_date' => null,
            'status' => 'PENDENTE',
            'type' => 'HONORARIO',
            'case_id' => LegalCase::factory(),
        ];
    }
}
