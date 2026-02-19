import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
    const [summary, setSummary] = useState({ balance: 0, income: 0, expense: 0 });
    const [user, setUser] = useState({ name: 'User' });
    const [portfolio, setPortfolio] = useState({ summary: { current_value: 0, total_profit: 0 } });
    
    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        try {
            const [sumRes, userRes, portRes] = await Promise.all([
                api.get('/summary/'),
                api.get('/profile/'),
                api.get('/portfolio/')
            ]);
            setSummary(sumRes.data);
            setUser(userRes.data);
            setPortfolio(portRes.data);
        } catch (err) {
            console.error("Error loading dashboard", err);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const pieData = {
        labels: ['Income', 'Expenses'],
        datasets: [{
            data: [summary.income, summary.expense],
            backgroundColor: ['#22c55e', '#ef4444'],
        }]
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.name || 'User'}!</h1>
                <p className="text-gray-500 mt-1">{new Date().toLocaleDateString()}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pt-8 border-t border-gray-100">
                    <div>
                        <p className="text-gray-400 text-sm font-bold uppercase">Total Assets</p>
                        <p className="text-3xl font-bold text-gray-900">${portfolio.summary.current_value.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-bold uppercase">Net Worth</p>
                        <p className="text-3xl font-bold text-gray-900">${summary.balance.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-bold uppercase">Investment Gain/Loss</p>
                        <p className={`text-3xl font-bold ${portfolio.summary.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {portfolio.summary.total_profit >= 0 ? '+' : ''}${portfolio.summary.total_profit.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Cash Flow Overview</h2>
                    <div className="h-64 flex justify-center">
                        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button 
                            onClick={() => navigate('/portfolio')} 
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                        >
                            + Buy New Stock
                        </button>
                        {/* THIS BUTTON NOW WORKS */}
                        <button 
                            onClick={() => navigate('/goals')} 
                            className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition"
                        >
                            + Add New Goal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;