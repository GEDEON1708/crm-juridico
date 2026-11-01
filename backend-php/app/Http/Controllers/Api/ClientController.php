<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Models\AuditLog;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ClientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Client::class);

        $page = max(1, $request->integer('page', 1));
        $limit = min(100, max(1, $request->integer('limit', 10)));
        $query = Client::query()->orderByDesc('created_at')->orderByDesc('id');

        if ($request->filled('search')) {
            $search = mb_strtolower($request->string('search')->toString());
            $like = '%'.$search.'%';

            $query->where(function ($builder) use ($like): void {
                $builder->whereRaw('LOWER(name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(email) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(cpf_cnpj) LIKE ?', [$like]);
            });
        }

        if ($request->has('isActive')) {
            $query->where('is_active', $request->boolean('isActive'));
        }

        $clients = $query->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'status' => 'success',
            'data' => [
                'clients' => ClientResource::collection($clients)->resolve($request),
                'pagination' => [
                    'page' => $clients->currentPage(),
                    'limit' => $clients->perPage(),
                    'total' => $clients->total(),
                    'totalPages' => $clients->lastPage(),
                ],
            ],
        ]);
    }

    public function store(StoreClientRequest $request): JsonResponse
    {
        $client = Client::query()->create($this->clientAttributes($request->validated()));
        $this->writeAuditLog($request, 'CREATE', $client);

        return response()->json([
            'status' => 'success',
            'message' => 'Cliente criado com sucesso',
            'data' => ['client' => (new ClientResource($client))->resolve($request)],
        ], 201);
    }

    public function show(Client $client, Request $request): JsonResponse
    {
        Gate::authorize('view', $client);

        return response()->json([
            'status' => 'success',
            'data' => ['client' => (new ClientResource($client))->resolve($request)],
        ]);
    }

    public function update(UpdateClientRequest $request, Client $client): JsonResponse
    {
        $client->update($this->clientAttributes($request->validated()));
        $this->writeAuditLog($request, 'UPDATE', $client);

        return response()->json([
            'status' => 'success',
            'message' => 'Cliente atualizado com sucesso',
            'data' => ['client' => (new ClientResource($client->refresh()))->resolve($request)],
        ]);
    }

    public function destroy(Client $client, Request $request): JsonResponse
    {
        Gate::authorize('delete', $client);

        if ($client->cases()->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Não é possível excluir cliente com casos associados',
            ], 400);
        }

        $clientId = (string) $client->id;
        $client->delete();
        $this->writeAuditLog($request, 'DELETE', $client, $clientId);

        return response()->json([
            'status' => 'success',
            'message' => 'Cliente excluído com sucesso',
        ]);
    }

    /** @param array<string, mixed> $validated */
    private function clientAttributes(array $validated): array
    {
        $fieldMap = [
            'name' => 'name',
            'email' => 'email',
            'phone' => 'phone',
            'cpfCnpj' => 'cpf_cnpj',
            'type' => 'type',
            'address' => 'address',
            'city' => 'city',
            'state' => 'state',
            'zipCode' => 'zip_code',
            'notes' => 'notes',
            'isActive' => 'is_active',
        ];

        $attributes = [];
        foreach ($fieldMap as $input => $column) {
            if (array_key_exists($input, $validated)) {
                $attributes[$column] = $validated[$input];
            }
        }

        return $attributes;
    }

    private function writeAuditLog(Request $request, string $action, Client $client, ?string $clientId = null): void
    {
        AuditLog::query()->create([
            'action' => $action,
            'entity' => 'Client',
            'entity_id' => $clientId ?? (string) $client->id,
            'user_id' => $request->user()->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
