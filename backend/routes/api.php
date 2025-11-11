<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BudgetController;

// Public routes - Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Authenticated user info
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user/me', [AuthController::class, 'me']);
    Route::put('/user/updateProfile', [AuthController::class, 'updateProfile']);

    // Expenses CRUD
    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::get('/expenses/{id}', [ExpenseController::class, 'show']);
    Route::post('/expenses', [ExpenseController::class, 'store']);
    Route::put('/expenses/{id}', [ExpenseController::class, 'update']);
    Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);

    // Categories CRUD
    Route::apiResource('categories', CategoryController::class);

    // Budgets CRUD
    Route::apiResource('budgets', BudgetController::class);

    // Analytics Routes
    Route::get('/analytics/monthly-expenses', [AnalyticsController::class, 'monthlyExpenses']);
    Route::get('/analytics/category-expenses', [AnalyticsController::class, 'expensesByCategory']);
    Route::get('/analytics/recent-expenses', [AnalyticsController::class, 'recentExpenses']);
    Route::get('/analytics/budget-vs-actual', [AnalyticsController::class, 'budgetVsActual']);
});