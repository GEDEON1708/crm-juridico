<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeadlineRequest;
use App\Http\Requests\UpdateDeadlineRequest;
use App\Http\Resources\DeadlineResource;
use App\Models\AuditLog;
use App\Models\Deadline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeadlineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $page = max(1, $request->integer('page', 1));
        $limit = min(100, max(1, $request->integer('limit', 10)));
        $query = Deadline::query()->with(['case:id,case_number,title']);

        if ($request->filled('caseId')) {
            $query->where('case_id', $request->string('caseId')->toString());
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->string('priority')->toString());
        }

        if ($request->input('status') === 'CONCLUIDO') {
            $query->where('is_completed', true);
        } elseif ($request->input('status') === 'PENDENTE') {
            $query->where('is_completed', false)->where('due_date', '>=', now());
        } elseif ($request->input('status') === 'ATRASADO') {
            $query->where('is_completed', false)->where('due_date', '<', now());
        }

        $deadlines = $query->orderBy('due_date')->orderBy('id')
            ->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'status' => 'success',
            'data' => [
                'deadlines' => DeadlineResource::collection($deadlines)->resolve($request),
                'pagination' => [
                    'page' => $deadlines->currentPage(),
                    'limit' => $deadlines->perPage(),
                    'total' => $deadlines->total(),
                    'pages' => $deadlines->lastPage(),
                ],
            ],
        ]);
    }

    public function store(StoreDeadlineRequest $request): JsonResponse
    {
        $deadline = Deadline::query()->create($this->deadlineAttributes($request->validated()));
        $this->writeAuditLog($request, 'CREATE', $deadline);

        return response()->json([
            'status' => 'success',
            'data' => (new DeadlineResource($deadline->load('case')))->resolve($request),
        ], 201);
    }

    public function show(Deadline $deadline, Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => (new DeadlineResource($deadline->load('case')))->resolve($request),
        ]);
    }

    public function update(UpdateDeadlineRequest $request, Deadline $deadline): JsonResponse
    {
        $validated = $request->validated();
        $attributes = $this->deadlineAttributes($validated);

        if (($validated['status'] ?? null) === 'CONCLUIDO') {
            $attributes['is_completed'] = true;
            $attributes['completed_at'] = $validated['completedAt'] ?? now();
        } elseif (($validated['status'] ?? null) === 'PENDENTE') {
            $attributes['is_completed'] = false;
            $attributes['completed_at'] = null;
        } elseif (array_key_exists('isCompleted', $validated)) {
            $attributes['is_completed'] = $validated['isCompleted'];
            $attributes['completed_at'] = $validated['isCompleted']
                ? ($validated['completedAt'] ?? now())
                : null;
        } elseif (array_key_exists('completedAt', $validated)) {
            $attributes['completed_at'] = $validated['completedAt'];
        }

        $deadline->update($attributes);
        $this->writeAuditLog($request, 'UPDATE', $deadline);

        return response()->json([
            'status' => 'success',
            'data' => (new DeadlineResource($deadline->refresh()->load('case')))->resolve($request),
        ]);
    }

    public function destroy(Deadline $deadline, Request $request): JsonResponse
    {
        $deadlineId = (string) $deadline->id;
        $deadline->delete();
        $this->writeAuditLog($request, 'DELETE', $deadline, $deadlineId);

        return response()->json([
            'status' => 'success',
            'message' => 'Prazo excluído com sucesso',
        ]);
    }

    /** @param array<string, mixed> $validated */
    private function deadlineAttributes(array $validated): array
    {
        $fieldMap = [
            'title' => 'title',
            'description' => 'description',
            'dueDate' => 'due_date',
            'priority' => 'priority',
            'caseId' => 'case_id',
            'isCompleted' => 'is_completed',
            'completedAt' => 'completed_at',
        ];

        $attributes = [];
        foreach ($fieldMap as $input => $column) {
            if (array_key_exists($input, $validated)) {
                $attributes[$column] = $validated[$input];
            }
        }

        return $attributes;
    }

    private function writeAuditLog(Request $request, string $action, Deadline $deadline, ?string $deadlineId = null): void
    {
        AuditLog::query()->create([
            'action' => $action,
            'entity' => 'Deadline',
            'entity_id' => $deadlineId ?? (string) $deadline->id,
            'user_id' => $request->user()->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => 'Prazo '.$deadline->title,
        ]);
    }
}
