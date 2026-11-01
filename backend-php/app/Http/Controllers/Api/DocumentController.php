<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Document::class);

        $query = Document::query()->with(['case', 'uploader'])->latest();
        if ($request->filled('type')) {
            $query->where('type', $request->string('type')->toString());
        }
        if ($request->filled('caseId')) {
            $query->where('case_id', $request->string('caseId')->toString());
        }

        $limit = min(200, max(1, $request->integer('limit', 100)));

        return response()->json([
            'status' => 'success',
            'data' => DocumentResource::collection($query->limit($limit)->get())->resolve($request),
        ]);
    }

    public function store(StoreDocumentRequest $request): JsonResponse
    {
        /** @var UploadedFile $file */
        $file = $request->file('file');
        $path = $file->store('documents', 'local');

        $document = Document::query()->create([
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'type' => $request->validated('type'),
            'file_name' => basename($file->getClientOriginalName()),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType() ?? 'application/pdf',
            'case_id' => $request->validated('caseId'),
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Documento enviado com sucesso',
            'data' => (new DocumentResource($document->load(['case', 'uploader'])))->resolve($request),
        ], 201);
    }

    public function show(Document $document, Request $request): JsonResponse
    {
        Gate::authorize('view', $document);

        return response()->json([
            'status' => 'success',
            'data' => (new DocumentResource($document->load(['case', 'uploader'])))->resolve($request),
        ]);
    }

    public function update(UpdateDocumentRequest $request, Document $document): JsonResponse
    {
        $document->update($this->documentAttributes($request->validated()));

        return response()->json([
            'status' => 'success',
            'message' => 'Documento atualizado com sucesso',
            'data' => (new DocumentResource($document->refresh()->load(['case', 'uploader'])))->resolve($request),
        ]);
    }

    public function destroy(Document $document): JsonResponse
    {
        Gate::authorize('delete', $document);
        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return response()->json(['status' => 'success', 'message' => 'Documento excluído com sucesso']);
    }

    public function download(Document $document): StreamedResponse
    {
        Gate::authorize('view', $document);
        abort_unless(Storage::disk('local')->exists($document->file_path), 404, 'Arquivo não encontrado');

        return Storage::disk('local')->download($document->file_path, $document->file_name, [
            'Content-Type' => $document->mime_type,
        ]);
    }

    /** @param array<string, mixed> $validated */
    private function documentAttributes(array $validated): array
    {
        $fieldMap = [
            'title' => 'title',
            'description' => 'description',
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
