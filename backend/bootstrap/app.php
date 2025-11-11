<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        
        // 1. DEFINE API MIDDLEWARE GROUP: Now configured for STATLESS API TOKEN AUTH.
        $middleware->api(prepend: [
            // ❌ REMOVED: \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            // By removing this, the API group is stateless and WILL NOT perform CSRF checks.
        ]);
        
        // 2. DEFINE WEB MIDDLEWARE GROUP (Standard configuration)
        $middleware->web(append: [
            // Note: The VerifyCsrfToken middleware is usually implicitly added here 
            // by default when using $middleware->web(), but you can explicitly add it 
            // here if your web routes require it.
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        ]);


        // Fix API authentication - return JSON (401) instead of redirecting (for API routes)
        $middleware->redirectGuestsTo(function ($request) {
            if ($request->is('api/*')) {
                return null; // Do not redirect guests on API routes
            }
            return route('login'); // Redirect to login for web routes
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();