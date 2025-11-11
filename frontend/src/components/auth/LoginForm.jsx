// src/components/LoginForm.jsx (FINAL INTEGRATION)

import React, { useState } from "react";
// Import the custom Axios instance (not strictly needed here, but kept for reference)
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function LoginForm() {
  // ... (state declarations and hooks)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((s) => !s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // 1. Make the POST request to the backend to get the token and user
      const response = await api.post("/login", {
        email,
        password,
      });

      const token = response.data.token;

      if (token) {
        // 2. Delegate full token processing and verification to the context.
        // The AuthContext's login function will now:
        //    a) Call setAuthToken(token)
        //    b) Call api.get('/user/me')
        //    c) Update the global user state
        const result = await login(token);

        if (result.success) {
          setIsLoggedIn(true); // Navigate ONLY after the token is set and verified
          navigate("/dashboard");
        } else {
          // If the backend token was good but verification (/user/me) failed
          setError(
            result.error || "Login failed: Could not verify user session."
          );
        }
      } else {
        setError(
          "Login failed: Token not received from server. Check backend response."
        );
      }
    } catch (err) {
      // Handle backend-reported errors (401 Invalid Credentials, 422 Validation)
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        "Invalid credentials or an unexpected error occurred.";
      setError(errorMessage);
      console.error("Login error:", err);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
           {" "}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md"
      >
               {" "}
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6 border-b-2 border-green-500 pb-3">
                    User Login        {" "}
        </h2>
               {" "}
        {error && (
          <p className="p-3 mb-4 text-sm text-red-800 rounded-lg bg-red-50 text-center">
                        ⚠️ {error}         {" "}
          </p>
        )}
               {" "}
        <div className="mb-5">
                   {" "}
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
                        Email          {" "}
          </label>
                   {" "}
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
            placeholder="you@example.com"
          />
                 {" "}
        </div>
               {" "}
        <div className="mb-6">
                   {" "}
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
                        Password          {" "}
          </label>
                   {" "}
          <div className="relative">
                       {" "}
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
              placeholder="********"
            />
                       {" "}
            <button
              type="button"
              onClick={toggleShowPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
                           {" "}
              {showPassword ? (
                // eye-off icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                                   {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-1.42M9.88 5.88A10.44 10.44 0 0121 12.5c-1.2 2.2-3.1 4-5.4 5.2M3.98 6.17A10.43 10.43 0 003 12.5c1.2 2.2 3.1 4 5.4 5.2"
                  />
                                 {" "}
                </svg>
              ) : (
                // eye icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                                   {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                                   {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                                 {" "}
                </svg>
              )}
                         {" "}
            </button>
                     {" "}
          </div>
                 {" "}
        </div>
               {" "}
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out transform hover:scale-[1.01]"
        >
                    Log In        {" "}
        </button>
               {" "}
        <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?          {" "}
          <a
            href="/register"
            className="text-green-600 hover:text-green-700 font-medium"
          >
                        Register here          {" "}
          </a>
                    .        {" "}
        </p>
             {" "}
      </form>
         {" "}
    </div>
  );
}

export default LoginForm;
