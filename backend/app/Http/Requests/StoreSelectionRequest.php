<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSelectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'session_id'        => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z0-9_-]+$/'],
            'squad_players'     => ['required', 'array', 'min:1', 'max:23'],
            'squad_players.*'   => ['required', 'integer', 'exists:players,id'],
            'starting_eleven'   => ['nullable', 'array', 'max:11'],
            'starting_eleven.*' => ['integer', 'exists:players,id'],
            'formation'         => ['required', 'string', 'in:4-3-3,4-4-2,4-2-3-1,3-5-2,4-1-4-1'],
        ];
    }

    public function messages(): array
    {
        return [
            'squad_players.max' => 'No puedes seleccionar más de 23 jugadores.',
            'session_id.regex'  => 'El session_id contiene caracteres inválidos.',
        ];
    }
}
