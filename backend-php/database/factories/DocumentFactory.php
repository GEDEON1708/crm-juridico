<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
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
            'type' => 'OUTROS',
            'file_name' => fake()->word().'.pdf',
            'file_path' => 'documents/'.fake()->uuid().'.pdf',
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
            'version' => 1,
            'case_id' => null,
            'uploaded_by' => User::factory(),
        ];
    }
}
