<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDeadlineRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'dueDate' => ['sometimes', 'date'],
            'priority' => ['sometimes', Rule::in(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'])],
            'isCompleted' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in(['PENDENTE', 'CONCLUIDO', 'ATRASADO'])],
            'completedAt' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
