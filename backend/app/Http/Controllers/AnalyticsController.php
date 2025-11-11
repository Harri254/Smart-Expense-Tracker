<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Expense;
use App\Models\Budget;
use App\Models\Category;

class AnalyticsController extends Controller
{
    // Get total expenses per month for the authenticated user
  // app/Http/Controllers/AnalyticsController.php

public function monthlyExpenses(Request $request)
{
    $userId = $request->user()->id;

    $monthlyExpenses = Expense::selectRaw('DATE_FORMAT(date, "%Y-%m") as month_year, SUM(amount) as total')
        ->where('user_id', $userId)
        ->groupBy('month_year')
        ->orderBy('month_year', 'asc') // Changed to asc for chart rendering order
        ->get()
        ->map(function ($item) {
            // Clean up the output structure
            return [
                'month' => $item->month_year,
                'total' => (float) $item->total,
            ];
        });

    return response()->json($monthlyExpenses);
}
    // Get expenses grouped by category for the authenticated user
  // app/Http/Controllers/AnalyticsController.php

public function expensesByCategory(Request $request)
{
    $userId = $request->user()->id;

    $categoryExpenses = Expense::selectRaw('categories.category_name, SUM(expenses.amount) as total')        ->join('categories', 'expenses.category_id', '=', 'categories.id') // ⬅️ Join is better for this query
        ->where('expenses.user_id', $userId)
        ->groupBy('category_name')
        ->orderBy('total', 'desc')
        ->get()
        ->map(function ($item) {
            // Clean up the output structure
            return [
                'category' => $item->category_name,
                'total' => (float) $item->total,
            ];
        });

    return response()->json($categoryExpenses);
}
// app/Http/Controllers/AnalyticsController.php

public function recentExpenses(Request $request)
{
    $userId = $request->user()->id;

    // Get the 5 most recent expenses with category info
    $recentExpenses = Expense::with('category')
        ->where('user_id', $userId)
        ->orderBy('date', 'desc')
        ->take(5)
        ->get()
        ->map(function ($expense) {
             // Clean up the output to be readily usable by the frontend table
            return [
                'id' => $expense->id,
                'description' => $expense->description,
                'amount' => (float) $expense->amount,
                'date' => $expense->date->format('Y-m-d'),
                'category' => $expense->category->name ?? 'Uncategorized', // Get category name
            ];
        });

    // ⬅️ Return the clean array directly
    return response()->json($recentExpenses); 
}


    // Compare budget vs actual spending for each category
   // app/Http/Controllers/AnalyticsController.php

public function budgetVsActual(Request $request)
{
    $userId = $request->user()->id;
    // Define the current month/year for filtering expenses
    $currentYear = now()->year;
    $currentMonth = now()->month;

    // 1. Get total spending per category for the current month efficiently
    $spentByCategory = Expense::selectRaw('category_id, SUM(amount) as spent')
        ->where('user_id', $userId)
        ->whereYear('date', $currentYear)
        ->whereMonth('date', $currentMonth)
        ->groupBy('category_id')
        ->pluck('spent', 'category_id'); // Pluck into an associative array [category_id => spent_amount]

    // 2. Fetch all budgets for the user for the current month
    $budgets = Budget::where('user_id', $userId)
        ->where('month', date('Y-m-01')) // Assuming 'month' column stores the first day of the month
        ->with('category')
        ->get();

    // 3. Map budgets and merge with calculated spending
    $data = $budgets->map(function ($budget) use ($spentByCategory) {
        $spent = $spentByCategory->get($budget->category_id, 0); // Get spent amount or 0 if not found
        $budgetAmount = (float) $budget->amount;

        return [
            'category' => $budget->category->name, // Assuming the Category model has a 'name' field
            'budget' => $budgetAmount,
            'spent' => $spent,
            'remaining' => max(0, $budgetAmount - $spent), // Remaining cannot be negative for display
            'overspent' => max(0, $spent - $budgetAmount),
        ];
    });

    return response()->json($data);
}


}
