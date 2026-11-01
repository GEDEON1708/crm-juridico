<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCaseRequest extends FormRequest
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
            'caseNumber' => [
                'sometimes', 'required', 'string', 'max:50',
                Rule::unique('cases', 'case_number')->ignore($this->route('case')),
            ],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'type' => ['sometimes', 'required', Rule::in([
                'TRABALHISTA', 'CIVIL', 'CRIMINAL', 'TRIBUTARIO', 'FAMILIA',
                'PREVIDENCIARIO', 'EMPRESARIAL', 'CONSUMIDOR', 'OUTROS',
            ])],
            'status' => ['sometimes', Rule::in(['ATIVO', 'ARQUIVADO', 'SUSPENSO', 'ENCERRADO'])],
            'court' => ['sometimes', 'nullable', 'string', 'max:255'],
            'jurisdiction' => ['sometimes', 'nullable', 'string', 'max:255'],
            'judge' => ['sometimes', 'nullable', 'string', 'max:255'],
            'value' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'startDate' => ['sometimes', 'date'],
            'endDate' => ['sometimes', 'nullable', 'date', 'after_or_equal:startDate'],
            'clientId' => ['sometimes', 'required', 'uuid', Rule::exists('clients', 'id')],
            'responsibleId' => ['sometimes', 'nullable', 'uuid', Rule::exists('users', 'id')],
        ];
    }
}
