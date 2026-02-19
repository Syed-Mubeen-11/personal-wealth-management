import React, { useState } from 'react';
import api from '../api';

function Recommendations() {
    const [risk, setRisk] = useState('medium');
    const [advice, setAdvice] = useState([]);
    const [loading, setLoading] = useState(false);

    const getAdvice = async () => {
        setLoading(true);
        try {
            // Connects to your FastAPI AI endpoint
            const res = await api.get(`/recommendations/?risk=${risk}`);
            setAdvice(res.data);
        } catch (err) {
            alert("Could not fetch advice.");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800">AI Investment Advice</h1>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
                <label className="block text-gray-700 font-bold mb-4">Select Your Risk Tolerance:</label>
                <div className="flex gap-4">
                    <select 
                        className="p-3 border rounded bg-gray-50 flex-1 outline-none focus:border-blue-500"
                        value={risk} 
                        onChange={(e) => setRisk(e.target.value)}
                    >
                        <option value="low">Low Risk (Conservative)</option>
                        <option value="medium">Medium Risk (Balanced)</option>
                        <option value="high">High Risk (Aggressive)</option>
                    </select>
                    <button 
                        onClick={getAdvice} 
                        className="bg-blue-600 text-white px-8 py-3 rounded font-bold hover:bg-blue-700 transition"
                    >
                        {loading ? "Analyzing..." : "Get AI Advice"}
                    </button>
                </div>
            </div>

            {/* Advice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {advice.map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                                {item.symbol}
                            </span>
                        </div>
                        <p className="text-gray-600 mb-4">{item.reason}</p>
                        <div className="text-right">
                            <span className="text-sm font-bold text-gray-500 uppercase">Recommended Allocation: </span>
                            <span className="text-lg font-bold text-blue-600">{item.allocation}%</span>
                        </div>
                    </div>
                ))}
            </div>
            
            {advice.length === 0 && !loading && (
                <div className="text-center text-gray-400 mt-10">
                    <p>Select a risk level and click "Get AI Advice" to see recommendations.</p>
                </div>
            )}
        </div>
    );
}

export default Recommendations;