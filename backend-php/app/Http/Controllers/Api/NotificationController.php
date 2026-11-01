<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $limit = min(100, max(1, $request->integer('limit', 10)));
        $query = Notification::query()->where('user_id', $userId);

        if ($request->boolean('unreadOnly')) {
            $query->where('is_read', false);
        }

        $notifications = $query->latest()->limit($limit)->get();
        $unreadCount = Notification::query()->where('user_id', $userId)->where('is_read', false)->count();

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function markAsRead(string $notification, Request $request): JsonResponse
    {
        $record = Notification::query()
            ->where('user_id', $request->user()->id)
            ->whereKey($notification)
            ->firstOrFail();
        $record->update(['is_read' => true]);

        return response()->json(['success' => true, 'message' => 'Notificação marcada como lida']);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::query()
            ->where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['success' => true, 'message' => 'Todas as notificações foram marcadas como lidas']);
    }

    public function destroy(string $notification, Request $request): JsonResponse
    {
        Notification::query()
            ->where('user_id', $request->user()->id)
            ->whereKey($notification)
            ->firstOrFail()
            ->delete();

        return response()->json(['success' => true, 'message' => 'Notificação excluída']);
    }
}
