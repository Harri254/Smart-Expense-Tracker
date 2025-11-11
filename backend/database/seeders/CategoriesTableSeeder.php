<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriesTableSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks (so truncation won't fail)
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('categories')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $categories = [
            ['category_name' => 'Food'],
            ['category_name' => 'Transport'],
            ['category_name' => 'Bills'],
            ['category_name' => 'Entertainment'],
            ['category_name' => 'Health'],
        ];

        DB::table('categories')->insert($categories);
    }
}
