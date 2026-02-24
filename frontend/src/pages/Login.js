import React, { useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

function Login() {
    // 1. YOUR BACKEND STATES
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // 2. TEAMMATE'S UI STATES (For the eye icon and red error text)
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // 3. YOUR API LOGIC
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        try {
            const res = await api.post('/login', { email, password });
            
            // Saved as 'jwt' so the new Dashboard recognizes it!
            localStorage.setItem('jwt', res.data.access_token);
            
            // Redirects directly to the dashboard page
            window.location.href = '/'; 
        } catch (err) { 
            // Routes your alert into the teammate's clean red UI text
            setError("Invalid Credentials"); 
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E3E3E3] p-8">
            {/* TEAMMATE'S DESIGN: Card Container */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-[#1B3C53]">Wealth Tracker Login</h2>

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* YOUR INPUT: Email */}
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#234C6A] outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {/* YOUR INPUT: Password (with Teammate's Show/Hide Icon) */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#234C6A] outline-none pr-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* TEAMMATE'S DESIGN: Error Message Display */}
                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    {/* YOUR SUBMIT BUTTON */}
                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg bg-[#1B3C53] text-white font-bold hover:bg-[#234C6A] transition"
                    >
                        Sign In
                    </button>

                    {/* TEAMMATE'S DESIGN: Register Link */}
                    <p className="text-center text-sm text-gray-600 mt-4">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-[#1B3C53] font-bold hover:underline">
                            Create Account
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;