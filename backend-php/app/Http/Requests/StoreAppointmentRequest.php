<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAppointmentRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', Rule::in(['AUDIENCIA', 'REUNIAO', 'ATENDIMENTO', 'DILIGENCIA'])],
            'date' => ['required', 'string', function (string $attribute, mixed $value, Closure $fail): void {
                if (! $this->hasValidCalendarDate($value)) {
                    $fail('Informe uma data válida no formato DD/MM/AAAA ou AAAA-MM-DD.');
                }
            }],
            'startTime' => ['required', 'date_format:H:i'],
            'endTime' => ['required', 'date_format:H:i', 'after:startTime'],
            'location' => ['nullable', 'string', 'max:255'],
            'participants' => ['nullable', 'string'],
            'isRecurring' => ['sometimes', 'boolean'],
            'recurrence' => ['nullable', 'string', 'max:255'],
        ];
    }

    private function hasValidCalendarDate(mixed $value): bool
    {
        if (! is_string($value)) {
            return false;
        }

        $format = str_contains($value, '/') ? '!d/m/Y' : '!Y-m-d';
        $date = \DateTimeImmutable::createFromFormat($format, $value);
        $errors = \DateTimeImmutable::getLastErrors();

        return $date !== false && ($errors === false || ($errors['warning_count'] === 0 && $errors['error_count'] === 0));
    }
}
