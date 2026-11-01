<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeadlineResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $status = $this->is_completed
            ? 'CONCLUIDO'
            : ($this->due_date->isPast() ? 'ATRASADO' : 'PENDENTE');

        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'dueDate' => $this->due_date?->toISOString(),
            'priority' => $this->priority,
            'status' => $status,
            'isCompleted' => $this->is_completed,
            'completedAt' => $this->completed_at?->toISOString(),
            'caseId' => (string) $this->case_id,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'case' => $this->whenLoaded('case', fn (): array => [
                'id' => (string) $this->case->id,
                'caseNumber' => $this->case->case_number,
                'title' => $this->case->title,
            ]),
        ];
    }
}
