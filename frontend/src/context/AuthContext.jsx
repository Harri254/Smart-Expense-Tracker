import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../api/axios'; // ⬅️ Import API instance and token setter
import { useNavigate } from 'react-router-dom'; // ⬅️ Used for redirection after logout
import { storage } from '../api'; // Assuming storage handles localStorage operations

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Initial State: Retrieve user and token from storage on load
    const initialUser = storage.getUser() || null;
    const [user, setUser] = useState(initialUser);
    const isAuthenticated = !!user;

    const nav = useNavigate();

    // 2. Lifecycle Hook: Bootstrap token and defaults on mount
    useEffect(() => {
        // The setAuthToken call in src/api/axios.js should handle loading 
        // the token from storage when the app first loads, but we can ensure 
        // the user state is synced here.
        
        // You can remove the old bootstrapDefaults call if it's not needed for other reasons
        // bootstrapDefaults(); 
    }, []);

    // 3. Login Function: Handles API call, saves token/user
const login = async (token) => { // ⬅️ Expect only the token here
    try {
        if (!token) {
            return { success: false, error: "Authentication token missing." };
        }
        
        // 1. Set the token on Axios instantly (This is crucial)
        setAuthToken(token); 

        // 2. Fetch authenticated user data using the new token
        // This confirms the token is valid and sets the complete user object.
        const userMeResponse = await api.get('/user/me'); 
        const userData = userMeResponse.data; // Assuming '/user/me' returns {id, name, email}

        // 3. Update local state and storage with complete data
        storage.saveUser(userData);
        setUser(userData);
        
        return { success: true };

    } catch (error) {
        console.error("Login synchronization failed. Token may be invalid:", error);
        // Clear token if /user/me fails, as the token is likely bad
        setAuthToken(null); 
        return { success: false, error: "Failed to verify user session." };
    }
};
    
    // 4. Logout Function: Handles API call to revoke token and clears local state
    const logout = async () => {
        try {
            // Call the protected backend logout route to revoke the token
            await api.post('/logout'); 

        } catch (error) {
            console.error("Logout backend call failed (Token may already be invalid):", error);
            // Proceed with local cleanup regardless of backend response
        } finally {
            // Clear token from Axios headers and localStorage
            setAuthToken(null); 
            
            // Clear user state and storage
            storage.removeUser();
            setUser(null);
            
            // Redirect user after logout
            nav('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);