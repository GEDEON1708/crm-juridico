<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\LegalCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CaseApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $this->getJson('/api/cases')->assertUnauthorized();
    }

    public function test_case_creation_defaults_responsible_user_to_the_authenticated_user(): void
    {
        $user = User::factory()->create(['role' => 'ADVOGADO']);
        $client = Client::factory()->create();
        $payload = $this->validCasePayload($client);

        $response = $this->actingAsSpa($user)->postJson('/api/cases', $payload);

        $response->assertCreated()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.case.caseNumber', $payload['caseNumber'])
            ->assertJsonPath('data.case.clientId', $client->id)
            ->assertJsonPath('data.case.responsibleId', $user->id);
        $this->assertDatabaseHas('cases', [
            'case_number' => $payload['caseNumber'],
            'client_id' => $client->id,
            'responsible_id' => $user->id,
        ]);
    }

    public function test_case_list_filters_and_returns_client_and_responsible(): void
    {
        $user = User::factory()->create(['role' => 'SOCIO']);
        $client = Client::factory()->create();
        $case = LegalCase::factory()->create([
            'client_id' => $client->id,
            'responsible_id' => $user->id,
            'status' => 'ATIVO',
            'type' => 'CIVIL',
        ]);
        LegalCase::factory()->create(['status' => 'ARQUIVADO', 'type' => 'TRABALHISTA']);

        $response = $this->actingAsSpa($user)->getJson('/api/cases?status=ATIVO&type=CIVIL&limit=1');

        $response->assertOk()
            ->assertJsonPath('data.cases.0.id', $case->id)
            ->assertJsonPath('data.cases.0.client.id', $client->id)
            ->assertJsonPath('data.cases.0.responsible.id', $user->id)
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.pagination.totalPages', 1);
    }

    public function test_case_update_changes_status(): void
    {
        $user = User::factory()->create(['role' => 'ADVOGADO']);
        $case = LegalCase::factory()->create(['responsible_id' => $user->id]);

        $response = $this->actingAsSpa($user)->putJson('/api/cases/'.$case->id, [
            'status' => 'ENCERRADO',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.case.status', 'ENCERRADO');
        $this->assertDatabaseHas('cases', [
            'id' => $case->id,
            'status' => 'ENCERRADO',
        ]);
    }

    public function test_case_creation_returns_422_for_unknown_client(): void
    {
        $user = User::factory()->create(['role' => 'ADVOGADO']);
        $payload = $this->validCasePayload(Client::factory()->make());
        $payload['clientId'] = '00000000-0000-4000-8000-000000000001';

        $this->actingAsSpa($user)
            ->postJson('/api/cases', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['clientId']);

        $this->assertDatabaseCount('cases', 0);
    }

    /** @return array<string, mixed> */
    private function validCasePayload(Client $client): array
    {
        return [
            'caseNumber' => '0001234-56.2026.8.26.0001',
            'title' => 'Civil contract dispute',
            'description' => 'Contract review and claim',
            'type' => 'CIVIL',
            'status' => 'ATIVO',
            'court' => 'First Civil Court',
            'jurisdiction' => 'Civil',
            'judge' => 'Judge Silva',
            'value' => 1500.50,
            'startDate' => '2026-02-01',
            'clientId' => $client->id,
        ];
    }

    private function actingAsSpa(User $user): static
    {
        return $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/',
        ])->actingAs($user, 'web');
    }
}
