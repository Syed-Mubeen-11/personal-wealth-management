import React, { useEffect, useState } from "react";
import { FaUser, FaWallet, FaSignOutAlt } from "react-icons/fa";
import { Link, Outlet, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  // Sample data - we can connect this to your Python backend later
  const [income] = useState(50000);
  const [expenses] = useState(20000);
  const savings = income - expenses;

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (!storedUser) {
      navigate("/"); // Redirect to login if no username is found
    } else {
      setUsername(storedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white p-6 shadow-xl flex flex-col justify-between border-r border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-purple-700 mb-8 px-2">Sahayak</h1>
          <ul className="space-y-2">
            <li>
              <Link 
                to="profile" 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-all font-medium"
              >
                <FaUser className="text-lg" />
                <span>Profile & Risk</span>
              </Link>
            </li>
            <li>
              <Link 
                to="portfolio" 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-all font-medium"
              >
                <FaWallet className="text-lg" />
                <span>Portfolio</span>
              </Link>
            </li>
            <li>
              <Link 
                to="riskprofile" 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-all font-medium"
              >
                <FaWallet className="text-lg" />
                <span>RiskProfile</span>
              </Link>
            </li>
            <li>
              <Link 
                to="transactions" 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-all font-medium"
              >
                <FaWallet className="text-lg" />
                <span>Transactions</span>
              </Link>
            </li>
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 font-semibold px-4 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-sky-300 via-purple-200 to-purple-400 p-8 overflow-y-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-800">
            Welcome, {username} 👋
          </h1>
          <p className="text-purple-700 opacity-80">Here is your wealth summary for today.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Income</h2>
            <p className="text-2xl font-bold text-green-600 mt-1">₹{income.toLocaleString()}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Expenses</h2>
            <p className="text-2xl font-bold text-red-600 mt-1">₹{expenses.toLocaleString()}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Savings</h2>
            <p className="text-2xl font-bold text-blue-600 mt-1">₹{savings.toLocaleString()}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Balance</h2>
            <p className="text-2xl font-bold text-purple-600 mt-1">₹{savings.toLocaleString()}</p>
          </div>
        </div>

        {/* Nested Content Area */}
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl min-h-[400px]">
          <Outlet /> 
        </div>
      </div>
    </div>
  );
};

export default Dashboard;