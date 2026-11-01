<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $this->getJson('/api/appointments')->assertUnauthorized();
    }

    public function test_regular_user_sees_only_their_appointments(): void
    {
        $owner = User::factory()->create(['role' => 'ADVOGADO']);
        $otherUser = User::factory()->create(['role' => 'ADVOGADO']);
        $owned = Appointment::factory()->create(['user_id' => $owner->id]);
        Appointment::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAsSpa($owner)->getJson('/api/appointments');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $owned->id);
    }

    public function test_appointment_creation_returns_derived_calendar_fields(): void
    {
        $user = User::factory()->create(['role' => 'ADVOGADO']);

        $response = $this->actingAsSpa($user)->postJson('/api/appointments', [
            'title' => 'Client meeting',
            'description' => 'Discuss the case',
            'date' => '24/03/2026',
            'startTime' => '09:00',
            'endTime' => '10:00',
            'type' => 'REUNIAO',
            'location' => 'Room 2',
            'participants' => 'Client, Lawyer',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Client meeting')
            ->assertJsonPath('data.date', '2026-03-24')
            ->assertJsonPath('data.startTime', '09:00')
            ->assertJsonPath('data.endTime', '10:00')
            ->assertJsonPath('data.userId', $user->id)
            ->assertJsonPath('data.type', 'REUNIAO');
        $this->assertDatabaseHas('appointments', [
            'title' => 'Client meeting',
            'user_id' => $user->id,
        ]);
    }

    public function test_appointment_creation_returns_422_when_end_time_is_not_after_start(): void
    {
        $user = User::factory()->create();

        $this->actingAsSpa($user)->postJson('/api/appointments', [
            'title' => 'Invalid meeting',
            'date' => '24/03/2026',
            'startTime' => '10:00',
            'endTime' => '09:00',
            'type' => 'REUNIAO',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['endTime']);

        $this->assertDatabaseCount('appointments', 0);
    }

    public function test_regular_user_cannot_download_another_users_ics(): void
    {
        $owner = User::factory()->create(['role' => 'ADVOGADO']);
        $otherUser = User::factory()->create(['role' => 'ADVOGADO']);
        $appointment = Appointment::factory()->create(['user_id' => $otherUser->id]);

        $this->actingAsSpa($owner)
            ->get('/api/appointments/'.$appointment->id.'/ics')
            ->assertNotFound();
    }

    public function test_user_can_download_an_ics_file_for_their_appointment(): void
    {
        $user = User::factory()->create(['role' => 'ADVOGADO']);
        $appointment = Appointment::factory()->create([
            'title' => 'Review, contract',
            'user_id' => $user->id,
        ]);

        $this->actingAsSpa($user)
            ->get('/api/appointments/'.$appointment->id.'/ics')
            ->assertOk()
            ->assertHeaderContains('Content-Type', 'text/calendar')
            ->assertSee('BEGIN:VCALENDAR', false)
            ->assertSee('SUMMARY:Review\\, contract', false);
    }

    private function actingAsSpa(User $user): static
    {
        return $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/',
        ])->actingAs($user, 'web');
    }
}
