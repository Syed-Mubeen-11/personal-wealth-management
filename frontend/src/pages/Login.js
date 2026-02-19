import React, { useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom'; // Import Link for navigation

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/login', { email, password });
            localStorage.setItem('token', res.data.access_token);
            // Redirect to dashboard instead of reload for smoother experience
            window.location.href = '/dashboard'; 
        } catch (err) { 
            alert("Invalid Credentials"); 
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-900">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-xl w-96 space-y-4">
                <h2 className="text-2xl font-bold text-center text-gray-800">Wealth Tracker Login</h2>
                
                <input 
                    type="email" 
                    placeholder="Email" 
                    className="w-full border p-3 rounded bg-gray-50 outline-none focus:border-blue-500" 
                    onChange={e => setEmail(e.target.value)} 
                    required
                />
                
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full border p-3 rounded bg-gray-50 outline-none focus:border-blue-500" 
                    onChange={e => setPassword(e.target.value)} 
                    required
                />
                
                <button className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 transition">
                    Sign In
                </button>

                {/* --- NEW REGISTER LINK --- */}
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 font-bold hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Login;