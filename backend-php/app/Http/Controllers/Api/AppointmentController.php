<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::query()->with('user');

        if ($request->user()->role !== 'SOCIO') {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type')->toString());
        }

        if ($request->filled('dateFrom')) {
            $query->where('start_time', '>=', $request->dateFrom.' 00:00:00');
        }

        if ($request->filled('dateTo')) {
            $query->where('start_time', '<=', $request->dateTo.' 23:59:59');
        }

        return response()->json([
            'status' => 'success',
            'data' => AppointmentResource::collection($query->orderBy('start_time')->get())->resolve($request),
        ]);
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $attributes = $this->appointmentAttributes($request->validated());
        [$attributes['start_time'], $attributes['end_time']] = $this->dateTimes($request->validated());
        $attributes['user_id'] = $request->user()->id;
        $appointment = Appointment::query()->create($attributes);
        $this->writeAuditLog($request, 'CREATE', $appointment);

        return response()->json([
            'status' => 'success',
            'message' => 'Compromisso criado com sucesso.',
            'data' => (new AppointmentResource($appointment->load('user')))->resolve($request),
        ], 201);
    }

    public function show(string $appointment, Request $request): JsonResponse
    {
        $appointment = $this->findAccessible($request, $appointment)->load('user');

        return response()->json([
            'status' => 'success',
            'data' => (new AppointmentResource($appointment))->resolve($request),
        ]);
    }

    public function update(UpdateAppointmentRequest $request, string $appointment): JsonResponse
    {
        $appointment = $this->findAccessible($request, $appointment);
        $validated = $request->validated();
        $attributes = $this->appointmentAttributes($validated);

        if (array_key_exists('date', $validated) || array_key_exists('startTime', $validated) || array_key_exists('endTime', $validated)) {
            [$attributes['start_time'], $attributes['end_time']] = $this->dateTimes($validated, $appointment);
        }

        $appointment->update($attributes);
        $this->writeAuditLog($request, 'UPDATE', $appointment);

        return response()->json([
            'status' => 'success',
            'message' => 'Compromisso atualizado com sucesso.',
            'data' => (new AppointmentResource($appointment->refresh()->load('user')))->resolve($request),
        ]);
    }

    public function destroy(string $appointment, Request $request): JsonResponse
    {
        $record = $this->findAccessible($request, $appointment);
        $record->delete();
        $this->writeAuditLog($request, 'DELETE', $record);

        return response()->json([
            'status' => 'success',
            'message' => 'Compromisso excluído com sucesso.',
        ]);
    }

    public function ics(string $appointment, Request $request): JsonResponse|Response
    {
        $record = $this->findAccessible($request, $appointment);
        $escape = static fn (?string $value): string => str_replace(
            ['\\', "\n", ',', ';'],
            ['\\\\', '\\n', '\\,', '\\;'],
            $value ?? ''
        );
        $toIcsDate = static fn ($value): string => $value->utc()->format('Ymd\THis\Z');

        $ics = implode("\r\n", [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//CRM Juridico//Appointments//PT-BR',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'UID:'.$record->id.'@crm-juridico.local',
            'DTSTAMP:'.$toIcsDate(now()),
            'DTSTART:'.$toIcsDate($record->start_time),
            'DTEND:'.$toIcsDate($record->end_time),
            'SUMMARY:'.$escape($record->title),
            'DESCRIPTION:'.$escape($record->description),
            'LOCATION:'.$escape($record->location),
            'END:VEVENT',
            'END:VCALENDAR',
            '',
        ]);

        return response($ics)
            ->header('Content-Type', 'text/calendar; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="compromisso-'.$record->id.'.ics"');
    }

    private function findAccessible(Request $request, string $id): Appointment
    {
        $query = Appointment::query();
        if ($request->user()->role !== 'SOCIO') {
            $query->where('user_id', $request->user()->id);
        }

        return $query->whereKey($id)->firstOrFail();
    }

    /** @param array<string, mixed> $validated */
    private function appointmentAttributes(array $validated): array
    {
        $fieldMap = [
            'title' => 'title',
            'description' => 'description',
            'type' => 'type',
            'location' => 'location',
            'participants' => 'participants',
            'isRecurring' => 'is_recurring',
            'recurrence' => 'recurrence',
        ];

        $attributes = [];
        foreach ($fieldMap as $input => $column) {
            if (array_key_exists($input, $validated)) {
                $attributes[$column] = $validated[$input];
            }
        }

        return $attributes;
    }

    /** @param array<string, mixed> $validated
     * @return array{0: Carbon, 1: Carbon}
     */
    private function dateTimes(array $validated, ?Appointment $existing = null): array
    {
        if ($existing && ! array_key_exists('date', $validated)) {
            $date = $existing->start_time->format('Y-m-d');
        } else {
            $date = $validated['date'] ?? '';
        }

        $format = str_contains($date, '/') ? 'd/m/Y H:i' : 'Y-m-d H:i';
        $startTime = $validated['startTime'] ?? $existing?->start_time->format('H:i');
        $endTime = $validated['endTime'] ?? $existing?->end_time->format('H:i');
        $start = Carbon::createFromFormat($format, $date.' '.$startTime);
        $end = Carbon::createFromFormat($format, $date.' '.$endTime);

        if (! $start || ! $end || $end->lessThanOrEqualTo($start)) {
            throw ValidationException::withMessages([
                'endTime' => ['Horário final precisa ser maior que o horário inicial.'],
            ]);
        }

        return [$start, $end];
    }

    private function writeAuditLog(Request $request, string $action, Appointment $appointment): void
    {
        AuditLog::query()->create([
            'action' => $action,
            'entity' => 'Appointment',
            'entity_id' => (string) $appointment->id,
            'user_id' => $request->user()->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => 'Compromisso '.$appointment->title,
        ]);
    }
}
