// src/api/axios.js (UPDATED for Stateless Token Auth)

import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Note: Changed back to include /api
    // ⬅️ REMOVE: withCredentials: true
    // ⬅️ REMOVE: getCsrfCookie export
    headers: {
        'Accept': 'application/json',
    }
});

// ⬅️ NO LONGER NEEDED: getCsrfCookie function

// Global configuration for protected routes (will be set after login)
const setAuthToken = (token) => {
    if (token) {
        // Set the Authorization header globally for all subsequent requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('authToken', token);
    } else {
        // Clear the header and token on logout
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('authToken');
    }
}

// Check for existing token on app load
const initialToken = localStorage.getItem('authToken');
if (initialToken) {
    setAuthToken(initialToken);
}

export { setAuthToken };
export default api;