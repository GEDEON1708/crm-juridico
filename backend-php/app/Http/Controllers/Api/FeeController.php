<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeeRequest;
use App\Http\Requests\UpdateFeeRequest;
use App\Http\Resources\FeeResource;
use App\Models\Fee;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Fee::query()->with(['case.client'])->orderBy('due_date');

        if ($request->filled('caseId')) {
            $query->where('case_id', $request->string('caseId')->toString());
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type')->toString());
        }

        if ($request->input('status') === 'ATRASADO') {
            $query->where(function (Builder $builder): void {
                $builder->where('status', 'ATRASADO')
                    ->orWhere(function (Builder $pending): void {
                        $pending->where('status', 'PENDENTE')->where('due_date', '<', now());
                    });
            });
        } elseif ($request->filled('status')) {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('limit')) {
            $query->limit(min(200, max(1, $request->integer('limit', 100))));
        }

        return response()->json([
            'success' => true,
            'data' => FeeResource::collection($query->get())->resolve($request),
        ]);
    }

    public function stats(): JsonResponse
    {
        $fees = Fee::query()->get(['amount', 'status', 'due_date']);
        $stats = [
            'totalPendente' => 0,
            'totalPago' => 0,
            'totalAtrasado' => 0,
            'valorPendente' => 0.0,
            'valorPago' => 0.0,
            'valorAtrasado' => 0.0,
        ];

        foreach ($fees as $fee) {
            if ($fee->status === 'PAGO') {
                $stats['totalPago']++;
                $stats['valorPago'] += $fee->amount;
            } elseif ($fee->status === 'ATRASADO' || ($fee->status === 'PENDENTE' && $fee->due_date->isPast())) {
                $stats['totalAtrasado']++;
                $stats['valorAtrasado'] += $fee->amount;
            } elseif ($fee->status === 'PENDENTE') {
                $stats['totalPendente']++;
                $stats['valorPendente'] += $fee->amount;
            }
        }

        return response()->json(['success' => true, 'data' => $stats]);
    }

    public function store(StoreFeeRequest $request): JsonResponse
    {
        $fee = Fee::query()->create($this->feeAttributes($request->validated()));

        return response()->json([
            'success' => true,
            'data' => (new FeeResource($fee->load('case.client')))->resolve($request),
        ], 201);
    }

    public function show(Fee $fee, Request $request): JsonResponse
    {
        $this->authorize('view', $fee);

        return response()->json([
            'success' => true,
            'data' => (new FeeResource($fee->load('case.client')))->resolve($request),
        ]);
    }

    public function update(UpdateFeeRequest $request, Fee $fee): JsonResponse
    {
        $fee->update($this->feeAttributes($request->validated()));

        return response()->json([
            'success' => true,
            'data' => (new FeeResource($fee->refresh()->load('case.client')))->resolve($request),
        ]);
    }

    public function destroy(Fee $fee): JsonResponse
    {
        $this->authorize('delete', $fee);
        $fee->delete();

        return response()->json(['success' => true, 'message' => 'Honorário excluído com sucesso']);
    }

    /** @param array<string, mixed> $validated */
    private function feeAttributes(array $validated): array
    {
        $fieldMap = [
            'description' => 'description',
            'amount' => 'amount',
            'dueDate' => 'due_date',
            'paidDate' => 'paid_date',
            'status' => 'status',
            'type' => 'type',
            'caseId' => 'case_id',
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
