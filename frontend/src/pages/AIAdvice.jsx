import React, { useState, useEffect } from 'react';
import api from '../api';

function AIAdvice() {
    const [profile, setProfile] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        loadAdvice();
    }, []);

    const loadAdvice = async () => {
        try {
            // 1. Get User Risk Profile
            const userRes = await api.get('/profile/');
            setProfile(userRes.data);

            // 2. Get Recommendations based on that risk
            const recRes = await api.get(`/recommendations/?risk=${userRes.data.risk_profile}`);
            setRecommendations(recRes.data);
        } catch (err) {
            console.error("Failed to load advice");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Investment Advice</h1>
            <p className="text-gray-600 mb-8">Personalized strategy based on your <strong>{profile?.risk_profile}</strong> risk profile.</p>

            <div className="grid gap-6">
                {recommendations.map((rec, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{rec.symbol} - {rec.name}</h3>
                            <p className="text-gray-500 mt-1">Allocation Strategy</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-3xl font-bold text-blue-600">{rec.allocation}%</span>
                            <span className="text-sm text-gray-400">of portfolio</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-2">Why this strategy?</h3>
                <p className="text-blue-700 text-sm">
                    Based on your <strong>{profile?.risk_profile}</strong> profile, our AI suggests a mix of 
                    {profile?.risk_profile === 'conservative' ? " stable bonds and blue-chip stocks to preserve capital." : 
                     profile?.risk_profile === 'aggressive' ? " high-growth tech assets and crypto for maximum returns." : 
                     " balanced ETFs to grow wealth steadily while managing risk."}
                </p>
            </div>
        </div>
    );
}
export default AIAdvice;