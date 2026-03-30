import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Incomes', path: '/incomes', icon: '💰' },
    { name: 'Expenses', path: '/expenses', icon: '📉' },
    { name: 'Goals', path: '/goals', icon: '🎯' },
    { name: 'Investments', path: '/investments', icon: '🏦' },
    { name: 'Portfolio', path: '/analytics', icon: '📈' },
    { name: 'Trade History', path: '/transactions', icon: '📜' },
    { name: 'Profile', path: '/profile', icon: '👤' },
    { name: 'Simulation', path: '/simulation', icon: '🧪' },
    { name: 'Recommendations', path: '/recommendations', icon: '🧠' },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 text-2xl font-bold border-b border-slate-700 text-blue-400">
        WealthTrack
      </div>

      <nav className="flex-grow p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 text-slate-300'
              }`
            }
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 text-red-400 hover:bg-slate-800 rounded-lg transition"
        >
          <span className="mr-3">🚪</span> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;