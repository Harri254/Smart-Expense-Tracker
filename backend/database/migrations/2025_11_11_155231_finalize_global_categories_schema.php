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
        
        // ❌ REMOVE/COMMENT OUT THIS LINE (or the equivalent code):
        // $table->dropForeign(['user_id']); 
        
        // This is the only line needed now:
        $table->bigInteger('user_id')->unsigned()->nullable()->change();
    });
}

public function down(): void
{
    // To reverse the change, you'd make it non-nullable again.
    // We can leave this empty if you don't intend to rollback.
}
};
