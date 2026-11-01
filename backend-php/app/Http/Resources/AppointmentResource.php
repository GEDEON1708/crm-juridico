<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $startTime = $this->start_time;
        $endTime = $this->end_time;
        $googleDate = static fn ($value): string => $value->utc()->format('Ymd\THis\Z');
        $googleCalendarUrl = 'https://calendar.google.com/calendar/render?'.http_build_query([
            'action' => 'TEMPLATE',
            'text' => $this->title,
            'dates' => $googleDate($startTime).'/'.$googleDate($endTime),
            'details' => $this->description ?? '',
            'location' => $this->location ?? '',
        ]);

        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'startDateTime' => $startTime->toISOString(),
            'endDateTime' => $endTime->toISOString(),
            'date' => $startTime->format('Y-m-d'),
            'dateLabel' => $startTime->format('d/m/Y'),
            'startTime' => $startTime->format('H:i'),
            'endTime' => $endTime->format('H:i'),
            'location' => $this->location,
            'participants' => $this->participants,
            'userId' => (string) $this->user_id,
            'user' => $this->whenLoaded('user', fn (): array => [
                'id' => (string) $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'isRecurring' => $this->is_recurring,
            'recurrence' => $this->recurrence,
            'googleCalendarUrl' => $googleCalendarUrl,
            'icsUrl' => '/api/appointments/'.$this->id.'/ics',
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
