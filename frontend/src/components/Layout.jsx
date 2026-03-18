import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LogOut, 
    Home, 
    PieChart as PieChartIcon, 
    TrendingUp, 
    Activity, 
    Bot, 
    Target 
} from "lucide-react";

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("jwt");
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#F0F2F5] flex">
            {/* GLOBAL SIDEBAR */}
            <aside className="w-64 bg-[#1B3C53] text-white flex flex-col p-6 hidden md:flex h-screen sticky top-0">
                <h2 className="text-2xl font-bold mb-10 text-center">WEALTH.AI</h2>
                
                <nav className="flex-1 space-y-2">
                    <Link to="/" className={`flex items-center gap-3 p-3 rounded-lg transition ${isActive('/') ? 'bg-[#234C6A]' : 'text-gray-300 hover:text-white hover:bg-[#234C6A]'}`}>
                        <Home size={20} /> Dashboard
                    </Link>
                    <Link to="/portfolio" className={`flex items-center gap-3 p-3 rounded-lg transition ${isActive('/portfolio') ? 'bg-[#234C6A]' : 'text-gray-300 hover:text-white hover:bg-[#234C6A]'}`}>
                        <TrendingUp size={20} /> Investments
                    </Link>
                    <Link to="/simulator" className={`flex items-center gap-3 p-3 rounded-lg transition ${isActive('/simulator') ? 'bg-[#234C6A]' : 'text-gray-300 hover:text-white hover:bg-[#234C6A]'}`}>
                        <Activity size={20} /> Simulator Charts
                    </Link>
                    <Link to="/ai-advice" className={`flex items-center gap-3 p-3 rounded-lg transition ${isActive('/ai-advice') ? 'bg-[#234C6A]' : 'text-gray-300 hover:text-white hover:bg-[#234C6A]'}`}>
                        <Bot size={20} /> AI Advice
                    </Link>
                    <Link to="/profile" className={`flex items-center gap-3 p-3 rounded-lg transition ${isActive('/profile') ? 'bg-[#234C6A]' : 'text-gray-300 hover:text-white hover:bg-[#234C6A]'}`}>
                        <PieChartIcon size={20} /> Profile & Risk
                    </Link>
                    <Link to="/goals" className={`flex items-center gap-3 p-3 rounded-lg transition ${isActive('/goals') ? 'bg-[#234C6A]' : 'text-gray-300 hover:text-white hover:bg-[#234C6A]'}`}>
                        <Target size={20} /> Goals
                    </Link>
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 mt-8 bg-red-500 hover:bg-red-600 text-white rounded-lg transition justify-center font-bold"
                >
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* DYNAMIC PAGE CONTENT */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}