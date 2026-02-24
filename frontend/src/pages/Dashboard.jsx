import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
    const navigate = useNavigate();

    // --- YOUR BACKEND STATES ---
    const [isAuth, setIsAuth] = useState(false);
    const [summary, setSummary] = useState({ balance: 0, income: 0, expense: 0 });
    const [user, setUser] = useState({ name: 'User', email: '' });
    const [portfolio, setPortfolio] = useState({ summary: { current_value: 0, total_profit: 0 } });

    // --- YOUR API CALLS ---
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

    // --- AUTHENTICATION CHECK ---
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            navigate("/login");
        } else {
            setIsAuth(true);
            loadData();
        }
    }, [navigate, loadData]);

    // --- YOUR CHART DATA ---
    const pieData = {
        labels: ['Income', 'Expenses'],
        datasets: [{
            data: [summary.income, summary.expense],
            backgroundColor: ['#22c55e', '#ef4444'],
        }]
    };

    if (!isAuth) return <div className="p-10 text-center font-bold text-[#1B3C53]">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-[#F0F2F5]">
            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 p-8">
                
                {/* Header (Dynamic User Data) */}
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-[#1B3C53]">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#234C6A] rounded-full flex items-center justify-center text-white font-bold uppercase">
                            {user.name ? user.name[0] : 'U'}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{user.name || 'User'}</p>
                            <p className="text-xs text-gray-500">{user.email || 'Welcome back!'}</p>
                        </div>
                    </div>
                </header>

                {/* KPI Cards (Dynamic Financial Data) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm mb-1 font-bold uppercase">Total Assets</h3>
                        <p className="text-3xl font-bold text-[#1B3C53]">${portfolio.summary.current_value?.toLocaleString() || 0}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm mb-1 font-bold uppercase">Net Worth</h3>
                        <p className="text-3xl font-bold text-[#1B3C53]">${summary.balance?.toLocaleString() || 0}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm mb-1 font-bold uppercase">Investment Gain/Loss</h3>
                        <p className={`text-3xl font-bold ${portfolio.summary.total_profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {portfolio.summary.total_profit >= 0 ? '+' : ''}${portfolio.summary.total_profit?.toLocaleString() || 0}
                        </p>
                    </div>
                </div>

                {/* Bottom Section: Chart and Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    
                    {/* Your Pie Chart embedded in Teammate's container */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Cash Flow Overview</h2>
                        <div className="flex-1 relative flex justify-center">
                            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>

                    {/* Quick Actions Panel */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="space-y-4">
                            <button 
                                onClick={() => navigate('/portfolio')} 
                                className="w-full bg-[#1B3C53] text-white py-3 rounded-lg font-bold hover:bg-[#234C6A] transition shadow-sm"
                            >
                                + Buy New Stock
                            </button>
                            <button 
                                onClick={() => navigate('/goals')} 
                                className="w-full border border-[#1B3C53] text-[#1B3C53] py-3 rounded-lg font-bold hover:bg-gray-50 transition shadow-sm"
                            >
                                + Add New Goal
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}