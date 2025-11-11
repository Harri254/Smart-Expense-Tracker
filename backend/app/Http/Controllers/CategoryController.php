<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; //Must import Auth facade
use Illuminate\Validation\Rule; // Must import Rule facade

class CategoryController extends Controller
{
    /**
     * READ: Display a listing of categories for the authenticated user.
     */
public function index()
{
    $userId = Auth::id();

    // 1. Fetch categories where user_id matches the authenticated user (user-specific categories)
    // 2. OR, fetch categories where user_id is NULL (global categories)
    $categories = Category::where('user_id', $userId)
                          ->orWhereNull('user_id') // ⬅️ CRITICAL FIX: Include global categories
                          ->orderBy('category_name', 'asc')
                          ->get();

    return response()->json($categories, 200); 
}

    /**
     * CREATE: Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        // 1. Validation: Use the actual database column name: 'category_name'
        $validated = $request->validate([
            'category_name' => [ // ⬅️ FIX: Validation key must be 'category_name'
                'required', 
                'string', 
                'max:255',
                // Ensure the category name is unique only for the current user's categories
                Rule::unique('categories')->where(function ($query) {
                    return $query->where('user_id', Auth::id());
                }),
            ],
        ]);

        // 2. Attach the user_id before creating
        $category = Category::create([
            'user_id' => Auth::id(),
            'category_name' => $validated['category_name'], // ⬅️ FIX: Mass assignment key must be 'category_name'
        ]);

        return response()->json([
            'message' => 'Category created successfully!',
            'data' => $category,
        ], 201);
    }
    
    // --- Remaining CRUD Methods ---

    /**
     * UPDATE: Update the specified category in storage.
     */
    public function update(Request $request, Category $category)
    {
        if ($category->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }
        
        $validated = $request->validate([
            'category_name' => [ // ⬅️ FIX: Validation key must be 'category_name'
                'required', 
                'string', 
                'max:255',
                Rule::unique('categories')->ignore($category->id)->where(function ($query) {
                    return $query->where('user_id', Auth::id());
                }),
            ],
        ]);

        // ⬅️ CRITICAL FIX: The update data must use the database column name
        $category->update(['category_name' => $validated['category_name']]); 

        return response()->json([
            'message' => 'Category updated successfully!',
            'data' => $category,
        ], 200);
    }
    
    // The destroy method does not need changes.
        public function destroy(Category $category)
    {
        // 1. CRITICAL SECURITY: Enforce ownership before deletion.
        if ($category->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.',
        ], 200);
    }
}