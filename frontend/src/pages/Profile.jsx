import React, { useState, useEffect } from 'react';
import api from '../api';

function Profile() {
    const [user, setUser] = useState({
        name: '',
        email: '',
        phone_number: '',
        residential_address: '',
        date_of_birth: '',
        risk_profile: 'moderate',
        kyc_status: 'unverified'
    });
    const [loading, setLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);

    // Fetch existing profile data on load
    useEffect(() => {
        const fetchProfile = async () => {
            setIsPageLoading(true);
            try {
                const res = await api.get('/profile/');
                setUser(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setIsPageLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleRiskSelect = (level) => {
        setUser({ ...user, risk_profile: level });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Force standard date format (YYYY-MM-DD)
            let formattedDate = user.date_of_birth;
            if (formattedDate && formattedDate.includes('-')) {
                const parts = formattedDate.split('-');
                // If it looks like DD-MM-YYYY, flip it
                if (parts[0].length === 2) {
                    formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }

            const payload = {
                name: user.name || null,
                phone_number: user.phone_number || null,
                residential_address: user.residential_address || null,
                risk_profile: user.risk_profile || 'moderate',
                date_of_birth: formattedDate || null
            };

            console.log("Payload sent to server:", payload);

            const response = await api.put('/profile/', payload);
            console.log("Server response:", response.data);
            alert("Profile Updated Successfully!");
            
        } catch (err) {
            // Logs the exact validation error from FastAPI to your browser console (F12)
            console.error("Full Error Object:", err);
            if (err.response) {
                console.error("Backend Error Detail:", err.response.data);
                alert(`Failed: ${JSON.stringify(err.response.data.detail)}`);
            } else {
                alert("Failed to update: Check if your Backend server is running.");
            }
        }
        setLoading(false);
    };

    if (isPageLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-blue-800 font-bold">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile & Risk Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Personal Details */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">User Profile Details</h2>
                    <p className="text-gray-500 mb-6 text-sm">View and update your personal information.</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                            <input 
                                type="text" name="name" 
                                value={user.name || ''} onChange={handleChange}
                                className="w-full border p-3 rounded bg-gray-50"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                            <input 
                                type="email" value={user.email || ''} disabled
                                className="w-full border p-3 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                            <input 
                                type="text" name="phone_number" 
                                value={user.phone_number || ''} onChange={handleChange}
                                className="w-full border p-3 rounded bg-gray-50"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Residential Address</label>
                            <input 
                                type="text" name="residential_address" 
                                value={user.residential_address || ''} onChange={handleChange}
                                className="w-full border p-3 rounded bg-gray-50"
                                placeholder="123 Wealthy Street, NY"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth</label>
                            <input 
                                type="date" name="date_of_birth" 
                                value={user.date_of_birth || ''} onChange={handleChange}
                                className="w-full border p-3 rounded bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Risk & KYC */}
                <div className="md:col-span-1 space-y-6">
                    
                    {/* Risk Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Risk Profile Selection</h2>
                        
                        <div className="space-y-3">
                            {['conservative', 'moderate', 'aggressive'].map((level) => (
                                <div 
                                    key={level}
                                    onClick={() => handleRiskSelect(level)}
                                    className={`p-4 border rounded cursor-pointer transition flex items-center gap-3
                                        ${user.risk_profile === level ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center
                                        ${user.risk_profile === level ? 'border-blue-600' : 'border-gray-400'}`}>
                                        {user.risk_profile === level && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                                    </div>
                                    <div>
                                        <p className="font-bold capitalize text-gray-800">{level}</p>
                                        <p className="text-xs text-gray-500">
                                            {level === 'conservative' && 'Prioritizes capital preservation.'}
                                            {level === 'moderate' && 'Balances growth with risk.'}
                                            {level === 'aggressive' && 'Seeks high growth, accepts risk.'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KYC Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">KYC Status</h2>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                ${user.kyc_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {user.kyc_status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Your Know Your Customer (KYC) verification is {user.kyc_status}.
                        </p>
                        <button className="w-full border border-gray-300 py-2 rounded text-sm font-bold text-gray-700 hover:bg-gray-50">
                            Update KYC
                        </button>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end gap-4">
                <button className="px-6 py-3 border rounded font-bold text-gray-700 hover:bg-gray-100">Cancel</button>
                <button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="px-6 py-3 bg-blue-700 text-white rounded font-bold hover:bg-blue-800 transition shadow-sm"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}

export default Profile;