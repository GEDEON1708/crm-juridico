<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\LegalCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_upload_a_pdf_document_to_private_storage(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['role' => 'ADVOGADO']);
        $case = LegalCase::factory()->create(['responsible_id' => $user->id]);

        $response = $this->actingAsSpa($user)->post('/api/documents', [
            'file' => UploadedFile::fake()->create('petition.pdf', 10, 'application/pdf'),
            'title' => 'Initial petition',
            'description' => 'Filing copy',
            'type' => 'PETICAO',
            'caseId' => $case->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Initial petition')
            ->assertJsonPath('data.fileName', 'petition.pdf')
            ->assertJsonPath('data.case.id', $case->id);
        $this->assertDatabaseHas('documents', [
            'title' => 'Initial petition',
            'uploaded_by' => $user->id,
        ]);

        $document = Document::query()->firstOrFail();
        Storage::disk('local')->assertExists($document->file_path);
    }

    public function test_upload_rejects_non_pdf_files(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();

        $this->actingAsSpa($user)->postJson('/api/documents', [
            'file' => UploadedFile::fake()->create('script.txt', 10, 'text/plain'),
            'title' => 'Not a PDF',
            'type' => 'OUTROS',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['file']);

        $this->assertDatabaseCount('documents', 0);
    }

    public function test_document_download_requires_authentication_and_returns_pdf(): void
    {
        Storage::fake('local');
        $file = UploadedFile::fake()->create('petition.pdf', 10, 'application/pdf');
        $path = $file->store('documents', 'local');
        $document = Document::factory()->create([
            'file_name' => 'petition.pdf',
            'file_path' => $path,
            'mime_type' => 'application/pdf',
        ]);

        $this->getJson('/api/documents/'.$document->id.'/file')->assertUnauthorized();

        $response = $this->actingAsSpa(User::factory()->create())
            ->get('/api/documents/'.$document->id.'/file');

        $response->assertOk()
            ->assertHeaderContains('Content-Type', 'application/pdf')
            ->assertDownload('petition.pdf');
    }

    private function actingAsSpa(User $user): static
    {
        return $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Referer' => 'http://localhost:3000/',
        ])->actingAs($user, 'web');

    }
}
