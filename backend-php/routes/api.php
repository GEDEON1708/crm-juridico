<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CaseController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeadlineController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\FeeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'timestamp' => now()->toISOString(),
    ]);
});

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/case-type-distribution', [DashboardController::class, 'caseTypeDistribution']);
    Route::get('/dashboard/monthly-activity', [DashboardController::class, 'monthlyActivity']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}/profile-image', [UserController::class, 'profileImage']);
    Route::post('/users/{user}/profile-image', [UserController::class, 'uploadProfileImage']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('cases', CaseController::class);
    Route::apiResource('deadlines', DeadlineController::class);
    Route::get('/documents/{document}/file', [DocumentController::class, 'download']);
    Route::apiResource('documents', DocumentController::class);
    Route::get('/appointments/{appointment}/ics', [AppointmentController::class, 'ics']);
    Route::apiResource('appointments', AppointmentController::class);
    Route::get('/fees/stats', [FeeController::class, 'stats']);
    Route::apiResource('fees', FeeController::class);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
});
