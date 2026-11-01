<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Deadline;
use App\Models\Document;
use App\Models\Fee;
use App\Models\LegalCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_stats_aggregate_core_records(): void
    {
        $user = User::factory()->create(['role' => 'SOCIO']);
        $client = Client::factory()->create();
        $case = LegalCase::factory()->create([
            'client_id' => $client->id,
            'responsible_id' => $user->id,
            'status' => 'ATIVO',
        ]);
        Deadline::factory()->create(['case_id' => $case->id, 'is_completed' => false]);
        Document::query()->create([
            'title' => 'Case file',
            'type' => 'OUTROS',
            'file_name' => 'case-file.pdf',
            'file_path' => 'documents/case-file.pdf',
            'file_size' => 20,
            'mime_type' => 'application/pdf',
            'case_id' => $case->id,
            'uploaded_by' => $user->id,
        ]);
        Fee::factory()->create(['case_id' => $case->id, 'amount' => 500, 'status' => 'PENDENTE']);
        Appointment::factory()->create([
            'user_id' => $user->id,
            'type' => 'AUDIENCIA',
            'start_time' => now()->addDay(),
        ]);

        $this->actingAsSpa($user)->getJson('/api/dashboard/stats')
            ->assertOk()
            ->assertJsonPath('data.totalClients', 1)
            ->assertJsonPath('data.totalCases', 1)
            ->assertJsonPath('data.activeCases', 1)
            ->assertJsonPath('data.pendingDeadlines', 1)
            ->assertJsonPath('data.upcomingHearings', 1)
            ->assertJsonPath('data.pendingFees', 500)
            ->assertJsonPath('data.totalDocuments', 1);
    }

    public function test_case_type_distribution_counts_cases(): void
    {
        $user = User::factory()->create(['role' => 'SOCIO']);
        LegalCase::factory()->create(['responsible_id' => $user->id, 'type' => 'CIVIL']);
        LegalCase::factory()->create(['responsible_id' => $user->id, 'type' => 'CIVIL']);
        LegalCase::factory()->create(['responsible_id' => $user->id, 'type' => 'FAMILIA']);

        $this->actingAsSpa($user)->getJson('/api/dashboard/case-type-distribution')
            ->assertOk()
            ->assertJsonFragment(['type' => 'CIVIL', 'count' => 2])
            ->assertJsonFragment(['type' => 'FAMILIA', 'count' => 1]);
    }

    public function test_monthly_activity_returns_twelve_months(): void
    {
        $user = User::factory()->create(['role' => 'SOCIO']);

        $response = $this->actingAsSpa($user)->getJson('/api/dashboard/monthly-activity');

        $response->assertOk()->assertJsonCount(12, 'data');
        $this->assertSame(['month', 'cases', 'hearings'], array_keys($response->json('data.0')));
    }

    private function actingAsSpa(User $user): static
    {
        return $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/',
        ])->actingAs($user, 'web');
    }
}
