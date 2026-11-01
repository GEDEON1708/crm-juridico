<?php

namespace Tests\Feature;

use App\Models\Deadline;
use App\Models\LegalCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeadlineApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $this->getJson('/api/deadlines')->assertUnauthorized();
    }

    public function test_deadline_list_filters_and_returns_calculated_status(): void
    {
        $this->travelTo('2026-01-01 12:00:00');
        $user = User::factory()->create();
        $case = LegalCase::factory()->create(['responsible_id' => $user->id]);
        $deadline = Deadline::factory()->create([
            'case_id' => $case->id,
            'priority' => 'URGENTE',
            'due_date' => '2025-12-31 12:00:00',
        ]);
        Deadline::factory()->create(['priority' => 'BAIXA', 'due_date' => '2026-02-01 12:00:00']);

        $response = $this->actingAsSpa($user)
            ->getJson('/api/deadlines?priority=URGENTE&caseId='.$case->id.'&limit=1');

        $response->assertOk()
            ->assertJsonPath('data.deadlines.0.id', $deadline->id)
            ->assertJsonPath('data.deadlines.0.status', 'ATRASADO')
            ->assertJsonPath('data.deadlines.0.case.caseNumber', $case->case_number)
            ->assertJsonPath('data.pagination.total', 1);
    }

    public function test_deadline_creation_returns_resource_and_audit_entry(): void
    {
        $user = User::factory()->create();
        $case = LegalCase::factory()->create(['responsible_id' => $user->id]);

        $response = $this->actingAsSpa($user)->postJson('/api/deadlines', [
            'title' => 'Submit the response',
            'description' => 'File before the deadline',
            'dueDate' => '2026-12-15 09:00:00',
            'priority' => 'ALTA',
            'caseId' => $case->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Submit the response')
            ->assertJsonPath('data.priority', 'ALTA')
            ->assertJsonPath('data.status', 'PENDENTE');
        $this->assertDatabaseHas('deadlines', [
            'title' => 'Submit the response',
            'case_id' => $case->id,
            'is_completed' => false,
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'CREATE',
            'entity' => 'Deadline',
            'user_id' => $user->id,
        ]);
    }

    public function test_deadline_can_be_completed_using_the_frontend_status_payload(): void
    {
        $user = User::factory()->create();
        $deadline = Deadline::factory()->create();

        $response = $this->actingAsSpa($user)->putJson('/api/deadlines/'.$deadline->id, [
            'status' => 'CONCLUIDO',
            'completedAt' => '2026-01-01T12:00:00.000Z',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'CONCLUIDO')
            ->assertJsonPath('data.isCompleted', true);
        $this->assertDatabaseHas('deadlines', [
            'id' => $deadline->id,
            'is_completed' => true,
        ]);
    }

    private function actingAsSpa(User $user): static
    {
        return $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/',
        ])->actingAs($user, 'web');
    }
}
