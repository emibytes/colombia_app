<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'email', 'unique:users,email'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'data_treatment_accepted' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'data_treatment_accepted.required' => 'Debes aceptar la política de tratamiento de datos.',
            'data_treatment_accepted.accepted'  => 'Debes aceptar la política de tratamiento de datos.',
        ];
    }
}
