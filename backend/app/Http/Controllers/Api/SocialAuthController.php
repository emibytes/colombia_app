<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    private const ALLOWED_PROVIDERS = ['google', 'facebook'];

    public function redirect(string $provider): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        if (! in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            return response()->json(['message' => 'Proveedor no soportado.'], 422);
        }

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback(string $provider): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        if (! in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            return response()->json(['message' => 'Proveedor no soportado.'], 422);
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Throwable) {
            return redirect(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')) . '/auth/callback?error=oauth_failed');
        }

        $idField = $provider . '_id';

        $user = User::where($idField, $socialUser->getId())
                    ->orWhere('email', $socialUser->getEmail())
                    ->first();

        $needsConsent = false;

        if (! $user) {
            $user = User::create([
                'name'     => $socialUser->getName() ?? $socialUser->getEmail(),
                'email'    => $socialUser->getEmail(),
                $idField   => $socialUser->getId(),
                'role'     => 'user',
            ]);
            $needsConsent = true;
        } elseif (! $user->$idField) {
            $user->update([$idField => $socialUser->getId()]);

            if (! $user->data_treatment_accepted_at) {
                $needsConsent = true;
            }
        }

        $user->tokens()->delete();
        $token = $user->createToken('api')->plainTextToken;

        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));

        return redirect($frontendUrl . '/auth/callback?token=' . $token . '&needs_consent=' . ($needsConsent ? '1' : '0'));
    }
}
