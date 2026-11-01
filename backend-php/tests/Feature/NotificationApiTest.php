<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_only_receives_their_unread_notifications(): void
    {
        $user = User::factory()->create();
        Notification::factory()->create(['user_id' => $user->id, 'is_read' => false]);
        Notification::factory()->create(['user_id' => $user->id, 'is_read' => true]);
        Notification::factory()->create(['is_read' => false]);

        $response = $this->actingAsSpa($user)->getJson('/api/notifications?unreadOnly=true');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('unreadCount', 1);
    }

    public function test_user_can_mark_all_their_notifications_as_read(): void
    {
        $user = User::factory()->create();
        Notification::factory()->count(2)->create(['user_id' => $user->id, 'is_read' => false]);
        $otherUserNotification = Notification::factory()->create(['is_read' => false]);

        $this->actingAsSpa($user)->putJson('/api/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('notifications', ['user_id' => $user->id, 'is_read' => false]);
        $this->assertDatabaseHas('notifications', ['id' => $otherUserNotification->id, 'is_read' => false]);
    }

    private function actingAsSpa(User $user): static
    {
        return $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/',
        ])->actingAs($user, 'web');
    }
}
