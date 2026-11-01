<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('description');
            $table->float('amount');
            $table->dateTime('due_date');
            $table->dateTime('paid_date')->nullable();
            $table->string('status')->default('PENDENTE');
            $table->string('type');
            $table->foreignUuid('case_id')->constrained('cases')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fees');
    }
};
