<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'fileName' => $this->file_name,
            'filePath' => '/api/documents/'.$this->id.'/file',
            'fileSize' => $this->file_size,
            'mimeType' => $this->mime_type,
            'version' => $this->version,
            'caseId' => $this->case_id,
            'uploadedBy' => (string) $this->uploaded_by,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'case' => $this->whenLoaded('case', fn (): ?array => $this->case ? [
                'id' => (string) $this->case->id,
                'caseNumber' => $this->case->case_number,
                'title' => $this->case->title,
            ] : null),
            'uploader' => $this->whenLoaded('uploader', fn (): array => [
                'id' => (string) $this->uploader->id,
                'name' => $this->uploader->name,
            ]),
        ];
    }
}
