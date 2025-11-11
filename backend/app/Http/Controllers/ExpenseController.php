<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the authenticated user's expenses.
     */
    public function index()
    {
        $userId = Auth::id();

        $expenses = Expense::with('category')
            ->where('user_id', $userId)
            ->orderBy('date', 'desc')
            ->get();

        return response()->json([
            'message' => 'Expenses retrieved successfully',
            'data' => $expenses,
        ], 200);
    }

    /**
     * Store a newly created expense in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')->where(function ($query) {
                    $query->where(function ($q) {
                        $q->where('user_id', Auth::id())
                          ->orWhereNull('user_id');
                    });
                }),
            ],
            'date' => 'required|date',
            'description' => 'nullable|string|max:255',
        ]);

        $validated['user_id'] = Auth::id();

        $expense = Expense::create($validated);
        $expense->load('category');

        return response()->json([
            'message' => 'Expense created successfully!',
            'data' => $expense,
        ], 201);
    }

    /**
     * Display the specified expense.
     */
    public function show(string $id)
    {
        $expense = Expense::with('category')
            ->where('user_id', Auth::id())
            ->where('id', $id)
            ->first();

        if (! $expense) {
            return response()->json(['message' => 'Expense not found or unauthorized'], 404);
        }

        return response()->json([
            'message' => 'Expense retrieved successfully!',
            'data' => $expense,
        ], 200);
    }

    /**
     * Update the specified expense in storage.
     */
    public function update(Request $request, string $id)
    {
        $expense = Expense::where('user_id', Auth::id())
            ->where('id', $id)
            ->first();

        if (! $expense) {
            return response()->json(['message' => 'Expense not found or unauthorized'], 404);
        }

        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0.01',
            'category_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('categories', 'id')->where(function ($query) {
                    $query->where(function ($q) {
                        $q->where('user_id', Auth::id())
                          ->orWhereNull('user_id');
                    });
                }),
            ],
            'date' => 'sometimes|date',
            'description' => 'sometimes|nullable|string|max:255',
        ]);

        $expense->update($validated);
        $expense->load('category');

        return response()->json([
            'message' => 'Expense updated successfully!',
            'data' => $expense,
        ], 200);
    }

    /**
     * Remove the specified expense from storage.
     */
    public function destroy(string $id)
    {
        $expense = Expense::where('user_id', Auth::id())
            ->where('id', $id)
            ->first();

        if (! $expense) {
            return response()->json(['message' => 'Expense not found or unauthorized'], 404);
        }

        $expense->delete();

        return response()->json([
            'message' => 'Expense deleted successfully',
        ], 200);
    }
}