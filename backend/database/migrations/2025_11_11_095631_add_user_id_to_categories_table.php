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
    Schema::table('categories', function (Blueprint $table) {
        $table->foreignId('user_id')
              ->nullable() // ⬅️ CRITICAL: This prevents the 1452 violation on existing rows
              ->constrained() 
              ->after('id');
    });
}

    /**
     * Reverse the migrations (used for rolling back).
     */
public function down(): void
{
    Schema::table('categories', function (Blueprint $table) {
        // 1. CRITICAL FIX: Drop the foreign key constraint first
        $table->dropForeign(['user_id']); 
        
        // 2. Then, safely drop the column
        $table->dropColumn('user_id'); 
    });
}
};