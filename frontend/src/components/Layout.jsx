import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LogOut, 
    Home, 
    PieChart as PieChartIcon, 
    TrendingUp, 
    Activity, 
    Bot, 
    Target,
    Zap,
    FileText,
    Moon,
    Sun,
    Menu,
    X
} from "lucide-react";
import { useTheme } from '../ThemeContext';

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { dark, toggle } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("jwt");
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { to: '/', icon: Home, label: 'Dashboard' },
        { to: '/portfolio', icon: TrendingUp, label: 'Investments' },
        { to: '/simulator', icon: Activity, label: 'Simulator' },
        { to: '/ai-advice', icon: Bot, label: 'AI Advice' },
        { to: '/recommendations', icon: Zap, label: 'Recommendations' },
        { to: '/profile', icon: PieChartIcon, label: 'Profile & Risk' },
        { to: '/goals', icon: Target, label: 'Goals' },
        { to: '/reports', icon: FileText, label: 'Reports' },
    ];

    const SidebarContent = () => (
        <>
            <h2 className="text-2xl font-bold mb-10 text-center">WEALTH.AI</h2>
            
            <nav className="flex-1 space-y-2">
                {navLinks.map(({ to, icon: Icon, label }) => (
                    <Link
                        key={to}
                        to={to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-lg transition ${isActive(to) ? 'bg-[#234C6A]' : 'text-gray-300 hover:text-white hover:bg-[#234C6A]'}`}
                    >
                        <Icon size={20} /> {label}
                    </Link>
                ))}
            </nav>

            <button
                onClick={toggle}
                className="flex items-center gap-3 p-3 text-gray-300 hover:text-white hover:bg-[#234C6A] rounded-lg transition"
                aria-label="Toggle dark mode"
            >
                {dark ? <Sun size={20} /> : <Moon size={20} />}
                {dark ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 mt-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition justify-center font-bold"
            >
                <LogOut size={20} /> Logout
            </button>
        </>
    );

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-900 flex transition-colors duration-300">
            {/* Mobile top bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#1B3C53] flex items-center justify-between px-4 py-3">
                <h2 className="text-lg font-bold text-white">WEALTH.AI</h2>
                <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white">
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
            )}

            {/* Mobile slide-out sidebar */}
            <aside className={`md:hidden fixed top-0 left-0 h-full w-64 bg-[#1B3C53] text-white flex flex-col p-6 z-50 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>

            {/* Desktop sidebar */}
            <aside className="w-64 bg-[#1B3C53] text-white flex-col p-6 hidden md:flex h-screen sticky top-0">
                <SidebarContent />
            </aside>

            {/* DYNAMIC PAGE CONTENT */}
            <main className="flex-1 p-4 pt-16 md:p-8 md:pt-8 overflow-y-auto dark:text-gray-100 transition-colors duration-300">
                {children}
            </main>
        </div>
    );
}