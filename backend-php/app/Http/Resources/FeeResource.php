<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $status = $this->status === 'PENDENTE' && $this->due_date->isPast()
            ? 'ATRASADO'
            : $this->status;

        return [
            'id' => (string) $this->id,
            'description' => $this->description,
            'amount' => $this->amount,
            'dueDate' => $this->due_date?->toISOString(),
            'paidDate' => $this->paid_date?->toISOString(),
            'status' => $status,
            'type' => $this->type,
            'caseId' => (string) $this->case_id,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'case' => $this->whenLoaded('case', fn (): array => [
                'id' => (string) $this->case->id,
                'caseNumber' => $this->case->case_number,
                'title' => $this->case->title,
                'client' => ClientResource::make($this->case->client),
            ]),
        ];
    }
}
