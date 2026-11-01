<?php

namespace App\Models;

use Database\Factories\LegalCaseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'case_number',
    'title',
    'description',
    'type',
    'status',
    'court',
    'jurisdiction',
    'judge',
    'value',
    'start_date',
    'end_date',
    'client_id',
    'responsible_id',
])]
class LegalCase extends Model
{
    /** @use HasFactory<LegalCaseFactory> */
    use HasFactory, HasUuids;

    protected $table = 'cases';

    protected function casts(): array
    {
        return [
            'value' => 'float',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function responsible(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_id');
    }

    public function deadlines(): HasMany
    {
        return $this->hasMany(Deadline::class, 'case_id');
    }

    public function fees(): HasMany
    {
        return $this->hasMany(Fee::class, 'case_id');
    }
}
