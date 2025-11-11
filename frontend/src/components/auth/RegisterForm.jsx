import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    
    // NEW: Toggle password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { login } = useAuth(); 
    const nav = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setValidationErrors({});
        setLoading(true);

        try {
            const response = await api.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            if (response.status === 201 && response.data.token) {
                login(email);
                nav('/dashboard');
            } else {
                setError('Registration failed with an unexpected response.');
            }

        } catch (err) {
            console.error('Registration error:', err);
            
            if (err.response && err.response.status === 422) {
                setValidationErrors(err.response.data.errors);
                setError('Please correct the validation errors below.');
            } else {
                const errorMessage = err.response?.data?.message || 'A network error occurred during registration.';
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Create an account</h2>
            <p className="text-sm text-gray-500 mb-6">Start tracking your expenses</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* General Error Display */}
                {error && (
                    <p className="p-3 text-sm text-red-800 rounded-lg bg-red-50 text-center">
                        ⚠️ {error}
                    </p>
                )}

                {/* Name Input */}
                <div>
                    <input 
                        required 
                        placeholder="Full name" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className={`w-full p-3 border rounded focus:ring-green-500 focus:border-green-500 ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`} 
                    />
                    {validationErrors.name && <p className="text-xs text-red-500 mt-1">{validationErrors.name[0]}</p>}
                </div>
                
                {/* Email Input */}
                <div>
                    <input 
                        required 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className={`w-full p-3 border rounded focus:ring-green-500 focus:border-green-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`} 
                    />
                    {validationErrors.email && (
                        <div className="text-xs text-red-500 mt-1 bg-red-50 p-2 rounded border border-red-200">
                            {validationErrors.email.map((err, idx) => (
                                <div key={idx}>
                                    {err.includes('unique') ? '📧 This email is already registered. Please use a different email or try logging in.' : err}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Password Input with Toggle */}
                <div>
                    <div className="relative">
                        <input 
                            required 
                            type={showPassword ? "text" : "password"}
                            placeholder="Password (min 8 chars)" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className={`w-full p-3 pr-12 border rounded focus:ring-green-500 focus:border-green-500 ${validationErrors.password ? 'border-red-500' : 'border-gray-300'}`} 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            {showPassword ? (
                                // eye-off icon
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-1.42M9.88 5.88A10.44 10.44 0 0121 12.5c-1.2 2.2-3.1 4-5.4 5.2M3.98 6.17A10.43 10.43 0 003 12.5c1.2 2.2 3.1 4 5.4 5.2" />
                                </svg>
                            ) : (
                                // eye icon
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {validationErrors.password && <p className="text-xs text-red-500 mt-1">{validationErrors.password[0]}</p>}
                </div>

                {/* Password Confirmation Input with Toggle */}
                <div>
                    <div className="relative">
                        <input 
                            required 
                            type={showPasswordConfirmation ? "text" : "password"}
                            placeholder="Confirm Password" 
                            value={passwordConfirmation} 
                            onChange={e => setPasswordConfirmation(e.target.value)} 
                            className={`w-full p-3 pr-12 border rounded focus:ring-green-500 focus:border-green-500 ${validationErrors.password_confirmation ? 'border-red-500' : 'border-gray-300'}`} 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            aria-label={showPasswordConfirmation ? "Hide password" : "Show password"}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            {showPasswordConfirmation ? (
                                // eye-off icon
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-1.42M9.88 5.88A10.44 10.44 0 0121 12.5c-1.2 2.2-3.1 4-5.4 5.2M3.98 6.17A10.43 10.43 0 003 12.5c1.2 2.2 3.1 4 5.4 5.2" />
                                </svg>
                            ) : (
                                // eye icon
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {validationErrors.password_confirmation && <p className="text-xs text-red-500 mt-1">{validationErrors.password_confirmation[0]}</p>}
                </div>
                
                <div className="flex items-center justify-between pt-2 flex-col-reverse">
                    <Link to="/login" className="text-sm text-gray-600 hover:text-green-600 font-medium">Already have an account?</Link>
                    
                    <button 
                        type="submit"
                        className="px-6 py-2 w-[90%] mb-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition duration-150 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </div>
            </form>
        </div>
    );
}