<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $this->getJson('/api/users')->assertUnauthorized();
    }

    public function test_user_can_update_their_own_profile(): void
    {
        $user = User::factory()->create(['role' => 'ADVOGADO']);

        $response = $this->actingAsSpa($user)->putJson('/api/users/'.$user->id, [
            'name' => 'Updated Name',
            'email' => $user->email,
            'phone' => '11999990000',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.phone', '11999990000');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated Name']);
    }

    public function test_password_change_requires_the_current_password(): void
    {
        $user = User::factory()->create();

        $this->actingAsSpa($user)->putJson('/api/users/'.$user->id, [
            'currentPassword' => 'incorrect',
            'password' => 'new-password-123',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['currentPassword']);

        $this->assertFalse(Hash::check('new-password-123', $user->fresh()->password));
    }

    public function test_user_can_change_password_with_their_current_password(): void
    {
        $user = User::factory()->create();

        $this->actingAsSpa($user)->putJson('/api/users/'.$user->id, [
            'currentPassword' => 'password',
            'password' => 'new-password-123',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
    }

    public function test_user_can_upload_a_profile_image_to_private_storage(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();

        $response = $this->actingAsSpa($user)->post('/api/users/'.$user->id.'/profile-image', [
            'profileImage' => UploadedFile::fake()->image('avatar.png'),
        ]);

        $response->assertOk()
            ->assertJsonPath('data.profileImage', '/api/users/'.$user->id.'/profile-image');
        Storage::disk('local')->assertExists($user->fresh()->profile_image);
    }

    private function actingAsSpa(User $user): static
    {
        return $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/',
        ])->actingAs($user, 'web');
    }
}
