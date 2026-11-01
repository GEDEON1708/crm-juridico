<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCaseRequest;
use App\Http\Requests\UpdateCaseRequest;
use App\Http\Resources\CaseResource;
use App\Models\LegalCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CaseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $page = max(1, $request->integer('page', 1));
        $limit = min(100, max(1, $request->integer('limit', 10)));
        $query = LegalCase::query()->with(['client', 'responsible']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type')->toString());
        }

        $cases = $query->orderByDesc('created_at')->orderByDesc('id')
            ->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'status' => 'success',
            'data' => [
                'cases' => CaseResource::collection($cases)->resolve($request),
                'pagination' => [
                    'page' => $cases->currentPage(),
                    'limit' => $cases->perPage(),
                    'total' => $cases->total(),
                    'totalPages' => $cases->lastPage(),
                ],
            ],
        ]);
    }

    public function store(StoreCaseRequest $request): JsonResponse
    {
        $attributes = $this->caseAttributes($request->validated());
        $attributes['responsible_id'] ??= $request->user()->id;
        $case = LegalCase::query()->create($attributes);

        return response()->json([
            'status' => 'success',
            'message' => 'Processo criado com sucesso',
            'data' => ['case' => (new CaseResource($case->load(['client', 'responsible'])))->resolve($request)],
        ], 201);
    }

    public function show(LegalCase $case, Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => ['case' => (new CaseResource($case->load(['client', 'responsible'])))->resolve($request)],
        ]);
    }

    public function update(UpdateCaseRequest $request, LegalCase $case): JsonResponse
    {
        $case->update($this->caseAttributes($request->validated()));

        return response()->json([
            'status' => 'success',
            'message' => 'Processo atualizado com sucesso',
            'data' => ['case' => (new CaseResource($case->refresh()->load(['client', 'responsible'])))->resolve($request)],
        ]);
    }

    public function destroy(LegalCase $case): JsonResponse
    {
        $case->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Processo excluído com sucesso',
        ]);
    }

    /** @param array<string, mixed> $validated */
    private function caseAttributes(array $validated): array
    {
        $fieldMap = [
            'caseNumber' => 'case_number',
            'title' => 'title',
            'description' => 'description',
            'type' => 'type',
            'status' => 'status',
            'court' => 'court',
            'jurisdiction' => 'jurisdiction',
            'judge' => 'judge',
            'value' => 'value',
            'startDate' => 'start_date',
            'endDate' => 'end_date',
            'clientId' => 'client_id',
            'responsibleId' => 'responsible_id',
        ];

        $attributes = [];
        foreach ($fieldMap as $input => $column) {
            if (array_key_exists($input, $validated)) {
                $attributes[$column] = $validated[$input];
            }
        }

        return $attributes;
    }
}
