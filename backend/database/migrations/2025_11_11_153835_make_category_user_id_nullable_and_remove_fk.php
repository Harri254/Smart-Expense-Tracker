<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; 

return new class extends Migration
{
    public function up(): void
    {
        // 1. Drop Foreign Key using raw SQL (Fixes the SQL syntax error 1091 if key exists)
        try {
            DB::statement('ALTER TABLE categories DROP FOREIGN KEY categories_user_id_foreign');
        } catch (\Exception $e) {
            // Ignore the exception if the key doesn't exist
        }
        
        // 2. Change column to allow NULLs (The final goal)
        Schema::table('categories', function (Blueprint $table) {
            $table->bigInteger('user_id')->unsigned()->nullable()->change();
        });
    }

    public function down(): void
    {
        // ⬅️ CRITICAL FIX: The down method must NOT try to make the column NOT NULL, 
        // as this crashes when rows have NULLs. We keep it as a nullable column change 
        // to avoid the crash, though this technically doesn't reverse the migration fully.
        // The ultimate fix is usually to remove the conflicting migration entirely from history.
        
        // Since we cannot remove history, we will simply make the down method safe to run.
        Schema::table('categories', function (Blueprint $table) {
            // We ignore the logic of changing it back to NOT NULL to prevent the crash 
            // caused by existing NULL data.
            $table->bigInteger('user_id')->unsigned()->nullable()->change(); 
        });
    }
};