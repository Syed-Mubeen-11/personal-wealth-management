import React, { useState } from 'react';
import api from '../api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Simulator() {
    const [formData, setFormData] = useState({ monthly_investment: 1000, years: 10 });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        setLoading(true);
        setResult(null); // Clear previous results to avoid confusion
        try {
            // 1. Start the task
            const res = await api.post(`/simulate/start/?monthly_investment=${formData.monthly_investment}&years=${formData.years}`);
            const taskId = res.data.task_id;

            // 2. Poll for results every 1 second
            const interval = setInterval(async () => {
                try {
                    const pollRes = await api.get(`/simulate/result/${taskId}`);
                    if (pollRes.data.status === 'Completed') {
                        clearInterval(interval);
                        setResult(pollRes.data.result);
                        setLoading(false);
                    }
                } catch (pollErr) {
                    console.error("Polling error", pollErr);
                    clearInterval(interval);
                    setLoading(false);
                }
            }, 1000);
        } catch (err) {
            alert("Simulation failed to start.");
            setLoading(false);
        }
    };

    // --- SAFELY PREPARE CHART DATA ---
    // The checks (result && result.year_breakdown) prevent the crash
    const yearsLabel = result && result.year_breakdown ? result.year_breakdown.map(r => `Year ${r.year}`) : [];
    const valuesData = result && result.year_breakdown ? result.year_breakdown.map(r => r.value) : [];

    const chartData = {
        labels: yearsLabel,
        datasets: [
            {
                label: 'Projected Wealth ($)',
                data: valuesData,
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.5)',
                tension: 0.3
            }
        ]
    };

    return (
        <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Wealth Growth Simulator</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* INPUT FORM */}
                <div className="bg-white p-6 rounded-lg shadow-sm h-fit border border-gray-100">
                    <label className="block text-gray-700 font-bold mb-2">Monthly Investment ($)</label>
                    <input 
                        type="number" 
                        value={formData.monthly_investment}
                        onChange={(e) => setFormData({...formData, monthly_investment: e.target.value})}
                        className="w-full border p-3 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <label className="block text-gray-700 font-bold mb-2">Duration (Years)</label>
                    <input 
                        type="number" 
                        value={formData.years}
                        onChange={(e) => setFormData({...formData, years: e.target.value})}
                        className="w-full border p-3 rounded mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                        onClick={handleSimulate}
                        disabled={loading}
                        className={`w-full py-3 rounded font-bold text-white transition ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? "Calculating..." : "Run Simulation"}
                    </button>
                </div>

                {/* RESULTS CHART */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    {result ? (
                        <>
                            <div className="mb-6 border-b pb-4">
                                <p className="text-gray-500 text-sm uppercase font-bold">Total Projected Wealth</p>
                                <p className="text-4xl font-extrabold text-green-600">
                                    ${result.total_value ? result.total_value.toLocaleString() : "0"}
                                </p>
                            </div>
                            <div className="h-80">
                                <Line 
                                    data={chartData} 
                                    options={{ 
                                        responsive: true, 
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'top' },
                                            tooltip: { mode: 'index', intersect: false }
                                        }
                                    }} 
                                />
                            </div>
                        </>
                    ) : (
                        <div className="h-80 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                            <p>Enter details and click Run to see your future.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Simulator;