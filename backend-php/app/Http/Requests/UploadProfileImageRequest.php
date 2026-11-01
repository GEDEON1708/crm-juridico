<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadProfileImageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $targetId = $this->route('user');

        return $this->user()?->id === $targetId || $this->user()?->role === 'SOCIO';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'profileImage' => [
                'required', 'image', 'mimes:jpeg,jpg,png,gif,webp',
                'extensions:jpg,jpeg,png,gif,webp', 'max:10240',
            ],
        ];
    }
}
