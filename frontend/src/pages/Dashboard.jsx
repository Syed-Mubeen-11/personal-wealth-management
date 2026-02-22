
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Home, PieChart } from "lucide-react";

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            navigate("/login");
        } else {
            // Decode token properly or fetch user data here
            // For now we just mock a user based on token existence
            setUser({ name: "User", email: "user@example.com" });
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("jwt");
        navigate("/login");
    };

    if (!user) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#F0F2F5] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1B3C53] text-white flex flex-col p-6 hidden md:flex">
                <h2 className="text-2xl font-bold mb-10">WealthTracker</h2>
                <nav className="flex-1 space-y-4">
                    <Link to="/" className="flex items-center gap-3 p-3 bg-[#234C6A] rounded-lg">
                        <Home size={20} /> Dashboard
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 p-3 text-gray-300 hover:text-white rounded-lg hover:bg-[#234C6A] transition">
                        <PieChart size={20} /> Profile & Risk
                    </Link>
                </nav>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 text-red-300 hover:text-red-100 mt-auto"
                >
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-[#1B3C53]">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#234C6A] rounded-full flex items-center justify-center text-white font-bold">
                            {user.name[0]}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                    </div>
                </header>

                {/* Content Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm mb-1">Total Balance</h3>
                        <p className="text-3xl font-bold text-[#1B3C53]">$124,500</p>
                        <span className="text-green-500 text-sm font-medium">+2.5% today</span>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm mb-1">Active Goals</h3>
                        <p className="text-3xl font-bold text-[#1B3C53]">3</p>
                        <span className="text-blue-500 text-sm font-medium">On track</span>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm mb-1">Monthly Savings</h3>
                        <p className="text-3xl font-bold text-[#1B3C53]">$2,400</p>
                        <span className="text-green-500 text-sm font-medium">+10% vs last month</span>
                    </div>
                </div>

                <div className="mt-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
                    Chart Placeholder
                </div>
            </main>
        </div>
    );
}
