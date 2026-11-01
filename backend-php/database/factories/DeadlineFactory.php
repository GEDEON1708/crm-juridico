<?php

namespace Database\Factories;

use App\Models\Deadline;
use App\Models\LegalCase;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Deadline>
 */
class DeadlineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->sentence(),
            'due_date' => now()->addDays(10),
            'is_completed' => false,
            'completed_at' => null,
            'priority' => 'MEDIA',
            'case_id' => LegalCase::factory(),
        ];
    }
}
