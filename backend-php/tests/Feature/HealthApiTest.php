<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthApiTest extends TestCase
{
    public function test_api_health_returns_status_and_timestamp(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonStructure(['status', 'timestamp'])
            ->assertJson(['status' => 'OK']);
    }
}
