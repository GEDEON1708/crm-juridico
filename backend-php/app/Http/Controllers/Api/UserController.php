<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UploadProfileImageRequest;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => User::query()->orderBy('name')->get()->map(fn (User $user): array => $this->publicUser($user)),
        ]);
    }

    public function show(string $user): JsonResponse
    {
        $record = User::query()->findOrFail($user);

        return response()->json(['status' => 'success', 'data' => $this->publicUser($record)]);
    }

    public function update(UpdateUserRequest $request, string $user): JsonResponse
    {
        $record = User::query()->findOrFail($user);
        $validated = $request->validated();
        $attributes = array_intersect_key($validated, array_flip(['name', 'email', 'phone']));

        if (array_key_exists('password', $validated)) {
            if (! Hash::check($validated['currentPassword'], $record->password)) {
                throw ValidationException::withMessages([
                    'currentPassword' => ['A senha atual está incorreta.'],
                ]);
            }

            $attributes['password'] = Hash::make($validated['password']);
        }

        $record->update($attributes);
        $this->writeAuditLog($request, $record, 'UPDATE', 'Perfil atualizado');

        return response()->json(['status' => 'success', 'data' => $this->publicUser($record->refresh())]);
    }

    public function uploadProfileImage(UploadProfileImageRequest $request, string $user): JsonResponse
    {
        $record = User::query()->findOrFail($user);
        /** @var UploadedFile $image */
        $image = $request->file('profileImage');

        if ($record->profile_image) {
            Storage::disk('local')->delete($record->profile_image);
        }

        $record->profile_image = $image->store('profiles', 'local');
        $record->save();
        $this->writeAuditLog($request, $record, 'UPDATE', 'Foto de perfil atualizada');

        return response()->json([
            'status' => 'success',
            'message' => 'Foto de perfil atualizada com sucesso',
            'data' => $this->publicUser($record),
        ]);
    }

    public function profileImage(string $user, Request $request): StreamedResponse
    {
        abort_unless($request->user()->id === $user || $request->user()->role === 'SOCIO', 403);
        $record = User::query()->findOrFail($user);
        abort_unless($record->profile_image && Storage::disk('local')->exists($record->profile_image), 404);

        return Storage::disk('local')->response($record->profile_image);
    }

    public function destroy(Request $request, string $user): JsonResponse
    {
        abort_unless($request->user()->role === 'SOCIO', 403);
        $record = User::query()->findOrFail($user);
        $record->update(['is_active' => false]);
        $this->writeAuditLog($request, $record, 'DELETE', 'Usuário desativado');

        return response()->json(['status' => 'success', 'message' => 'Usuário desativado com sucesso']);
    }

    /** @return array<string, mixed> */
    private function publicUser(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'cpf' => $user->cpf,
            'oab' => $user->oab,
            'phone' => $user->phone,
            'role' => $user->role,
            'isActive' => $user->is_active,
            'twoFactorEnabled' => $user->two_factor_enabled,
            'profileImage' => $user->profile_image ? '/api/users/'.$user->id.'/profile-image' : null,
            'createdAt' => $user->created_at?->toISOString(),
            'updatedAt' => $user->updated_at?->toISOString(),
        ];
    }

    private function writeAuditLog(Request $request, User $user, string $action, string $details): void
    {
        AuditLog::query()->create([
            'action' => $action,
            'entity' => 'User',
            'entity_id' => (string) $user->id,
            'user_id' => $request->user()->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => $details,
        ]);
    }
}
