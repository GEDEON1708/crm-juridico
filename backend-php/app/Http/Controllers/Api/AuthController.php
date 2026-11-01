<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! $user->is_active || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Credenciais inválidas',
            ], 401);
        }

        if ($user->two_factor_enabled) {
            return response()->json([
                'status' => 'error',
                'message' => 'A autenticação de dois fatores ainda não foi migrada para este backend.',
            ], 501);
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'status' => 'success',
            'data' => ['user' => $this->publicUser($user)],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => ['user' => $this->publicUser($request->user())],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout realizado com sucesso',
        ]);
    }

    /** @return array<string, bool|string|null> */
    private function publicUser(User $user): array
    {
        return [
            'id' => (string) $user->getKey(),
            'name' => $user->name,
            'email' => $user->email,
            'cpf' => $user->cpf,
            'oab' => $user->oab,
            'phone' => $user->phone,
            'role' => $user->role,
            'profileImage' => $user->profile_image,
            'twoFactorEnabled' => $user->two_factor_enabled,
            'updatedAt' => $user->updated_at?->toISOString(),
        ];
    }
}
