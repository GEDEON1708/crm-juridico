<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_creates_a_session_and_returns_a_public_user(): void
    {
        $user = User::factory()->create();

        $response = $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/',
        ])->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.user.email', $user->email)
            ->assertJsonMissingPath('data.user.password')
            ->assertJsonMissingPath('data.accessToken');
        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_session_authenticates_the_current_user_on_a_following_request(): void
    {
        $user = User::factory()->create();

        $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/',
        ])->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        $this->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.user.email', $user->email);
    }

    public function test_login_returns_401_for_invalid_credentials(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertUnauthorized()
            ->assertJsonPath('message', 'Credenciais inválidas');
        $this->assertGuest('web');
    }

    public function test_login_returns_501_for_accounts_with_unmigrated_two_factor_authentication(): void
    {
        $user = User::factory()->create(['two_factor_enabled' => true]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(501)
            ->assertJsonPath('message', 'A autenticação de dois fatores ainda não foi migrada para este backend.');
        $this->assertGuest('web');
    }

    public function test_current_user_returns_401_without_a_session(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_logout_invalidates_the_authenticated_session(): void
    {
        $user = User::factory()->create();

        $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/',
        ])->actingAs($user, 'web')
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('status', 'success');

        $this->assertGuest('web');
    }
}
