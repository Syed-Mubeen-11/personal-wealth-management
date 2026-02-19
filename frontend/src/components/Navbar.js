import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Helper to make active link bold/blue
    const isActive = (path) => {
        return location.pathname === path ? "text-blue-200 font-bold border-b-2 border-blue-200" : "text-white hover:text-blue-200";
    };

    return (
        <nav className="bg-blue-900 shadow-lg p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                
                {/* LOGO */}
                <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-white tracking-wide">WEALTH.AI</h1>
                </div>

                {/* NAVIGATION LINKS */}
                <div className="hidden md:flex space-x-8">
                    <Link to="/dashboard" className={`${isActive('/dashboard')} transition duration-200`}>
                        Dashboard
                    </Link>
                    
                    {/* UPDATED: Points to /portfolio */}
                    <Link to="/portfolio" className={`${isActive('/portfolio')} transition duration-200`}>
                        Investments
                    </Link>

                    {/* UPDATED: Points to /simulator */}
                    <Link to="/simulator" className={`${isActive('/simulator')} transition duration-200`}>
                        Simulator
                    </Link>

                    {/* UPDATED: Points to /ai-advice (Was likely missing or wrong) */}
                    <Link to="/ai-advice" className={`${isActive('/ai-advice')} transition duration-200`}>
                        AI Advice
                    </Link>

                    <Link to="/profile" className={`${isActive('/profile')} transition duration-200`}>
                        Profile & Risk
                    </Link>
                    
                    <Link to="/goals" className={`${isActive('/goals')} transition duration-200`}>
                        Goals
                    </Link>
                </div>

                {/* LOGOUT BUTTON */}
                <button 
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-bold transition shadow-md"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;