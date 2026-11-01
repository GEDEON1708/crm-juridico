<?php

namespace Tests\Feature;

use App\Models\Fee;
use App\Models\LegalCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeeApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $this->getJson('/api/fees')->assertUnauthorized();
    }

    public function test_lawyer_can_create_a_fee(): void
    {
        $user = User::factory()->create(['role' => 'ADVOGADO']);
        $case = LegalCase::factory()->create(['responsible_id' => $user->id]);

        $response = $this->actingAsSpa($user)->postJson('/api/fees', [
            'description' => 'Initial legal fee',
            'amount' => 1500.50,
            'dueDate' => '2026-12-10',
            'type' => 'HONORARIO',
            'caseId' => $case->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.description', 'Initial legal fee')
            ->assertJsonPath('data.case.id', $case->id);
        $this->assertDatabaseHas('fees', [
            'description' => 'Initial legal fee',
            'case_id' => $case->id,
        ]);
    }

    public function test_intern_cannot_create_a_fee(): void
    {
        $user = User::factory()->create(['role' => 'ESTAGIARIO']);
        $case = LegalCase::factory()->create(['responsible_id' => $user->id]);

        $this->actingAsSpa($user)->postJson('/api/fees', [
            'description' => 'Restricted fee',
            'amount' => 100,
            'dueDate' => '2026-12-10',
            'type' => 'HONORARIO',
            'caseId' => $case->id,
        ])->assertForbidden();

        $this->assertDatabaseCount('fees', 0);
    }

    public function test_fee_list_calculates_overdue_status_and_stats(): void
    {
        $this->travelTo('2026-01-01 12:00:00');
        $user = User::factory()->create(['role' => 'SOCIO']);
        $case = LegalCase::factory()->create(['responsible_id' => $user->id]);
        $overdue = Fee::factory()->create([
            'case_id' => $case->id,
            'status' => 'PENDENTE',
            'amount' => 250,
            'due_date' => '2025-12-31',
        ]);

        $this->actingAsSpa($user)->getJson('/api/fees')
            ->assertOk()
            ->assertJsonPath('data.0.id', $overdue->id)
            ->assertJsonPath('data.0.status', 'ATRASADO');

        $this->getJson('/api/fees/stats')
            ->assertOk()
            ->assertJsonPath('data.totalAtrasado', 1)
            ->assertJsonPath('data.valorAtrasado', 250);
    }

    public function test_fee_can_be_marked_as_paid(): void
    {
        $user = User::factory()->create(['role' => 'ADVOGADO']);
        $fee = Fee::factory()->create(['status' => 'PENDENTE']);

        $this->actingAsSpa($user)->putJson('/api/fees/'.$fee->id, [
            'status' => 'PAGO',
            'paidDate' => '2026-11-01T10:00:00.000Z',
        ])->assertOk()
            ->assertJsonPath('data.status', 'PAGO');

        $this->assertDatabaseHas('fees', [
            'id' => $fee->id,
            'status' => 'PAGO',
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
