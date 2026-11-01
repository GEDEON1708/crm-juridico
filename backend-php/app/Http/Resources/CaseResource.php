<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CaseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'caseNumber' => $this->case_number,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'status' => $this->status,
            'court' => $this->court,
            'jurisdiction' => $this->jurisdiction,
            'judge' => $this->judge,
            'value' => $this->value,
            'startDate' => $this->start_date?->toISOString(),
            'endDate' => $this->end_date?->toISOString(),
            'clientId' => (string) $this->client_id,
            'responsibleId' => (string) $this->responsible_id,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'client' => ClientResource::make($this->whenLoaded('client')),
            'responsible' => $this->whenLoaded('responsible', fn (): array => [
                'id' => (string) $this->responsible->id,
                'name' => $this->responsible->name,
                'email' => $this->responsible->email,
            ]),
        ];
    }
}
