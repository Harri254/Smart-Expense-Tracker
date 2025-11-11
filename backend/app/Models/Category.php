<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // ⬅️ Import for clarity

class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * Note: We use the database column names here.
     * * @var array
     */
    protected $fillable = [
        'user_id',       // ⬅️ CRITICAL SECURITY FIX: Must be fillable
        'category_name', // ⬅️ The actual database column name
        'color_code',
        // If you want the controller to use the simpler 'name' key for input/output,
        // you should create an accessor/mutator pair, but sticking to database 
        // column names in $fillable is simpler.
    ];

    /**
     * Define the inverse relationship to the User model (Owner).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Define the relationship to the Expense model.
     */
    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * Define the relationship to the Budget model.
     */
    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }
}