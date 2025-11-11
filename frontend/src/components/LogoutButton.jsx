// src/components/LogoutButton.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; 
// ⬅️ Removed 'useNavigate' hook import as context handles navigation

function LogoutButton() {
    const { logout, isAuthenticated } = useAuth(); 
    const [isLoading, setIsLoading] = useState(false);
    // ⬅️ Removed 'navigate' hook instance

    if (!isAuthenticated) {
        return null;
    }

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            // ⬅️ Calls context function which handles API call and redirection internally
            await logout(); 
        } catch (error) {
            // Log error, but rely on the context's 'finally' block to clear state/redirect
            console.error('Logout process failed on the client side:', error);
        } finally {
            // The context handles navigation, so the user will be redirected regardless of the error.
            setIsLoading(false);
        }
    };

    return (
        <button 
            onClick={handleLogout}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 shadow-md flex items-center space-x-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
        </button>
    );
}

export default LogoutButton;