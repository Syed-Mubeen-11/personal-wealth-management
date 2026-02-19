import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [riskProfile, setRiskProfile] = useState('moderate');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Sending all fields so they don't show as NULL in pgAdmin
            await api.post('/register', { 
                email, 
                password, 
                name, 
                risk_profile: riskProfile 
            });
            
            alert("Registration Successful! Please Login.");
            navigate('/login');
        } catch (error) {
            console.error("Registration Error:", error);
            alert("Registration failed. Email might be taken.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Create Account</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Full Name Input */}
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        className="w-full border p-2 rounded"
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />

                    {/* Email Input */}
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="w-full border p-2 rounded"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />

                    {/* Password Input */}
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="w-full border p-2 rounded"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />

                    {/* Risk Profile Selection */}
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">Risk Profile</label>
                        <select 
                            className="w-full border p-2 rounded bg-white"
                            value={riskProfile}
                            onChange={(e) => setRiskProfile(e.target.value)}
                        >
                            <option value="conservative">Conservative (Low Risk)</option>
                            <option value="moderate">Moderate (Balanced)</option>
                            <option value="aggressive">Aggressive (High Risk)</option>
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Already have an account? <Link to="/login" className="text-blue-600 font-bold">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;