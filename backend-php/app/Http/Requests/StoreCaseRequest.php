<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCaseRequest extends FormRequest
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
            'caseNumber' => ['required', 'string', 'max:50', Rule::unique('cases', 'case_number')],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', Rule::in([
                'TRABALHISTA', 'CIVIL', 'CRIMINAL', 'TRIBUTARIO', 'FAMILIA',
                'PREVIDENCIARIO', 'EMPRESARIAL', 'CONSUMIDOR', 'OUTROS',
            ])],
            'status' => ['sometimes', Rule::in(['ATIVO', 'ARQUIVADO', 'SUSPENSO', 'ENCERRADO'])],
            'court' => ['nullable', 'string', 'max:255'],
            'jurisdiction' => ['nullable', 'string', 'max:255'],
            'judge' => ['nullable', 'string', 'max:255'],
            'value' => ['nullable', 'numeric', 'min:0'],
            'startDate' => ['sometimes', 'date'],
            'endDate' => ['nullable', 'date', 'after_or_equal:startDate'],
            'clientId' => ['required', 'uuid', Rule::exists('clients', 'id')],
            'responsibleId' => ['sometimes', 'nullable', 'uuid', Rule::exists('users', 'id')],
        ];
    }
}
