<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Deadline;
use App\Models\Document;
use App\Models\Fee;
use App\Models\LegalCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'totalClients' => Client::query()->count(),
                'totalCases' => LegalCase::query()->count(),
                'activeCases' => LegalCase::query()->where('status', 'ATIVO')->count(),
                'pendingDeadlines' => Deadline::query()->where('is_completed', false)->count(),
                'upcomingHearings' => Appointment::query()
                    ->where('type', 'AUDIENCIA')
                    ->where('start_time', '>=', now())
                    ->count(),
                'pendingFees' => (float) Fee::query()
                    ->whereIn('status', ['PENDENTE', 'ATRASADO'])
                    ->sum('amount'),
                'totalDocuments' => Document::query()->count(),
                'totalRevenue' => (float) Fee::query()->sum('amount'),
                'paidRevenue' => (float) Fee::query()->where('status', 'PAGO')->sum('amount'),
            ],
        ]);
    }

    public function caseTypeDistribution(): JsonResponse
    {
        $distribution = LegalCase::query()
            ->select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->orderBy('type')
            ->get();

        return response()->json(['status' => 'success', 'data' => $distribution]);
    }

    public function monthlyActivity(): JsonResponse
    {
        $startOfYear = now()->startOfYear();
        $endOfYear = now()->endOfYear();
        $caseCounts = array_fill(0, 12, 0);
        $hearingCounts = array_fill(0, 12, 0);

        LegalCase::query()
            ->whereBetween('created_at', [$startOfYear, $endOfYear])
            ->get(['created_at'])
            ->each(function (LegalCase $case) use (&$caseCounts): void {
                $caseCounts[(int) $case->created_at->format('n') - 1]++;
            });

        Appointment::query()
            ->where('type', 'AUDIENCIA')
            ->whereBetween('start_time', [$startOfYear, $endOfYear])
            ->get(['start_time'])
            ->each(function (Appointment $appointment) use (&$hearingCounts): void {
                $hearingCounts[(int) $appointment->start_time->format('n') - 1]++;
            });

        $months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        $activity = array_map(fn (string $month, int $index): array => [
            'month' => $month,
            'cases' => $caseCounts[$index],
            'hearings' => $hearingCounts[$index],
        ], $months, array_keys($months));

        return response()->json(['status' => 'success', 'data' => $activity]);
    }
}
