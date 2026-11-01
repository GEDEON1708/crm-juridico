<?php

namespace App\Http\Requests;

use App\Models\Fee;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $fee = $this->route('fee');

        return $fee instanceof Fee && ($this->user()?->can('update', $fee) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'description' => ['sometimes', 'required', 'string', 'max:255'],
            'amount' => ['sometimes', 'required', 'numeric', 'gt:0'],
            'dueDate' => ['sometimes', 'date'],
            'paidDate' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', Rule::in(['PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO'])],
            'type' => ['sometimes', 'required', 'string', 'max:50'],
            'caseId' => ['sometimes', 'required', 'uuid', Rule::exists('cases', 'id')],
        ];
    }
}
