<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    //*******register
    public function register(Request $request)
    {
        // 1) validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // 2) create user (use Hash facade)
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // 3. Fire the Registered event (for email verification or other listeners)
        event(new Registered($user));

        // 4) create sanctum token
        $token = $user->createToken('api-token')->plainTextToken;

        // 5) return response (201 Created)
        return response()->json([
            'message' => 'User registered successfully.',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer'
        ], 201);
    }

    //****Login
public function login(Request $request)
{
    // Validate input
    $validated = $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    // **CHANGE:** Use the standard Auth::attempt() for credential check
    if (!Auth::attempt($validated)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }
    
    // User is now authenticated, retrieve the user object
    $user = $request->user();

    // Revoke old tokens (Good security practice!)
    $user->tokens()->delete();

    // Create a new token
    $token = $user->createToken('api-token')->plainTextToken;

    // Return JSON response
    return response()->json([
        'message' => 'Login successful',
        'user' => $user,
        'token' => $token, // ⬅️ CRUCIAL: Returning the token
        'token_type' => 'Bearer' // Best practice to include
    ], 200);
}
    // ****User profile check

    public function me(Request $request)
{
    return response()->json($request->user());
}

    // ****Update profile
public function updateProfile(Request $request)
    {
        $user = $request->user(); // Get the currently logged-in user

        // 1. Validation: Use 'sometimes' for optional updates
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            // Check for email uniqueness, ignoring the current user's email
            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
            // Password update requires both new password and confirmation
            'password' => 'sometimes|nullable|string|min:6|confirmed',
        ]);

        // 2. Handle Password Update (if present)
        if (isset($validated['password'])) {
            // Hash the new password before storing
            $validated['password'] = Hash::make($validated['password']);
        }
        
        // 3. Update only the fields that were passed and validated
        $user->update($validated);

        // 4. Return the updated user object
        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user,
        ], 200);
    }
    // ****Logout 
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete(); 

    return response()->json([
        'message' => 'Successfully logged out and token revoked.'
    ], 200);
}

}
