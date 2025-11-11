import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import LogoutButton from '../components/LogoutButton'; // ⬅️ Import the dedicated component

export default function Settings() {
    const { user, logout, login } = useAuth();

    // Form State (Initialized with current user data)
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' or 'error'
    const [validationErrors, setValidationErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        setValidationErrors({});

        const payload = {};
        if (name !== user?.name) payload.name = name;
        if (email !== user?.email) payload.email = email;
        if (password) {
            payload.password = password;
            payload.password_confirmation = passwordConfirmation;
        }

        if (Object.keys(payload).length === 0) {
            setStatus({ type: 'error', message: 'No changes detected.' });
            setLoading(false);
            return;
        }

        try {
            // PUT /api/user/updateProfile (Authenticated route)
            const response = await api.put('/user/updateProfile', payload);

            // Assuming a utility handles state update after successful save
            // (You would update your context's user state here if necessary)
            
            // Clear password fields on success
            setPassword('');
            setPasswordConfirmation('');

            setStatus({ type: 'success', message: response.data.message });

        } catch (err) {
            console.error('Profile Update Error:', err);
            if (err.response && err.response.status === 422) {
                setValidationErrors(err.response.data.errors);
                setStatus({ type: 'error', message: 'Please correct the validation errors.' });
            } else {
                setStatus({ type: 'error', message: err.response?.data?.message || 'An unexpected error occurred.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Account Settings</h1>
            
            {/* Status Messages */}
            {status && (
                <div className={`p-3 mb-4 rounded ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status.message}
                </div>
            )}

            {/* Profile Update Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg space-y-5">
                <h3 className="text-xl font-semibold border-b pb-2">Update Profile</h3>
                
                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                        type="text" 
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`mt-1 w-full p-3 border rounded-md focus:ring-green-500 ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {validationErrors.name && <p className="text-xs text-red-500 mt-1">{validationErrors.name[0]}</p>}
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input 
                        type="email" 
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`mt-1 w-full p-3 border rounded-md focus:ring-green-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {validationErrors.email && <p className="text-xs text-red-500 mt-1">{validationErrors.email[0]}</p>}
                </div>
                
                <h3 className="text-xl font-semibold border-b pb-2 pt-4">Change Password (Optional)</h3>
                
                {/* Password Fields */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                    <input 
                        type="password" 
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                        className={`mt-1 w-full p-3 border rounded-md focus:ring-green-500 ${validationErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {validationErrors.password && <p className="text-xs text-red-500 mt-1">{validationErrors.password[0]}</p>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input 
                        type="password" 
                        id="password_confirmation"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className={`mt-1 w-full p-3 border rounded-md focus:ring-green-500 ${validationErrors.password_confirmation ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition duration-150"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
            
            {/* ⬅️ FINAL LOGOUT INTEGRATION */}
            <div className="mt-8 text-right">
                <LogoutButton /> 
            </div>
        </div>
    );
}