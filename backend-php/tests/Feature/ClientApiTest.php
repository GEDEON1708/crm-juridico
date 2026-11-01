<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\LegalCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_list_returns_401_without_a_session(): void
    {
        $this->getJson('/api/clients')->assertUnauthorized();
    }

    public function test_client_list_searches_filters_and_returns_pagination(): void
    {
        Client::factory()->create([
            'name' => 'Acme Legal',
            'cpf_cnpj' => '12345678901',
            'is_active' => true,
        ]);
        Client::factory()->create([
            'name' => 'Other Client',
            'cpf_cnpj' => '10987654321',
            'is_active' => false,
        ]);

        $response = $this->actingAsSpa(User::factory()->create(['role' => 'ESTAGIARIO']))
            ->getJson('/api/clients?search=acme&isActive=true&limit=1');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.clients.0.name', 'Acme Legal')
            ->assertJsonPath('data.clients.0.cpfCnpj', '12345678901')
            ->assertJsonPath('data.pagination.page', 1)
            ->assertJsonPath('data.pagination.limit', 1)
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.pagination.totalPages', 1);
    }

    public function test_administrative_user_can_create_a_client_and_audit_entry(): void
    {
        $user = User::factory()->create(['role' => 'ADMINISTRATIVO']);
        $payload = $this->validClientPayload();

        $response = $this->actingAsSpa($user)->postJson('/api/clients', $payload);

        $response->assertCreated()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Cliente criado com sucesso')
            ->assertJsonPath('data.client.name', $payload['name'])
            ->assertJsonPath('data.client.cpfCnpj', $payload['cpfCnpj']);
        $this->assertDatabaseHas('clients', [
            'cpf_cnpj' => $payload['cpfCnpj'],
            'name' => $payload['name'],
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'CREATE',
            'entity' => 'Client',
            'user_id' => $user->id,
        ]);
    }

    public function test_client_creation_returns_422_when_required_fields_are_missing(): void
    {
        $response = $this->actingAsSpa(User::factory()->create(['role' => 'ADVOGADO']))
            ->postJson('/api/clients', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'cpfCnpj', 'type']);
        $this->assertDatabaseCount('clients', 0);
    }

    public function test_intern_cannot_create_a_client(): void
    {
        $this->actingAsSpa(User::factory()->create(['role' => 'ESTAGIARIO']))
            ->postJson('/api/clients', $this->validClientPayload())
            ->assertForbidden();

        $this->assertDatabaseCount('clients', 0);
    }

    public function test_client_creation_returns_422_when_cpf_cnpj_is_already_registered(): void
    {
        Client::factory()->create(['cpf_cnpj' => '12345678901']);

        $payload = $this->validClientPayload();
        $payload['cpfCnpj'] = '12345678901';

        $this->actingAsSpa(User::factory()->create(['role' => 'ADVOGADO']))
            ->postJson('/api/clients', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['cpfCnpj']);

        $this->assertDatabaseCount('clients', 1);
    }

    public function test_administrative_user_can_update_a_client(): void
    {
        $user = User::factory()->create(['role' => 'ADMINISTRATIVO']);
        $client = Client::factory()->create();

        $response = $this->actingAsSpa($user)->putJson('/api/clients/'.$client->id, [
            'name' => 'Updated Client',
            'cpfCnpj' => $client->cpf_cnpj,
            'type' => $client->type,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.client.name', 'Updated Client');
        $this->assertDatabaseHas('clients', [
            'id' => $client->id,
            'name' => 'Updated Client',
        ]);
    }

    public function test_administrative_user_cannot_delete_a_client(): void
    {
        $client = Client::factory()->create();

        $this->actingAsSpa(User::factory()->create(['role' => 'ADMINISTRATIVO']))
            ->deleteJson('/api/clients/'.$client->id)
            ->assertForbidden();

        $this->assertModelExists($client);
    }

    public function test_lawyer_can_delete_a_client_and_audit_the_action(): void
    {
        $user = User::factory()->create(['role' => 'ADVOGADO']);
        $client = Client::factory()->create();

        $this->actingAsSpa($user)
            ->deleteJson('/api/clients/'.$client->id)
            ->assertOk()
            ->assertJsonPath('message', 'Cliente excluído com sucesso');

        $this->assertDatabaseMissing('clients', ['id' => $client->id]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'DELETE',
            'entity' => 'Client',
            'entity_id' => $client->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_client_with_cases_cannot_be_deleted(): void
    {
        $client = Client::factory()->create();
        $user = User::factory()->create(['role' => 'SOCIO']);
        LegalCase::factory()->create([
            'client_id' => $client->id,
            'responsible_id' => $user->id,
        ]);

        $this->actingAsSpa($user)
            ->deleteJson('/api/clients/'.$client->id)
            ->assertBadRequest()
            ->assertJsonPath('message', 'Não é possível excluir cliente com casos associados');

        $this->assertModelExists($client);
    }

    /** @return array<string, string> */
    private function validClientPayload(): array
    {
        return [
            'name' => 'Example Client',
            'email' => 'client@example.com',
            'phone' => '11999990000',
            'cpfCnpj' => '12345678901',
            'type' => 'PESSOA_FISICA',
            'address' => 'Rua Central, 10',
            'city' => 'Sao Paulo',
            'state' => 'SP',
            'zipCode' => '01000-000',
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
