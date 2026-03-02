import React, { useEffect, useState } from "react";
import { FaUser, FaWallet, FaSignOutAlt } from "react-icons/fa";
import { Link, Outlet, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [income] = useState(50000);
  const [expenses] = useState(20000);
  const savings = income - expenses;

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (!storedUser) navigate("/");
    else setUsername(storedUser);
  }, [navigate]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-700 mb-6">Dashboard</h1>
          <ul>
            <li className="mb-4 flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-purple-100">
              <FaUser className="text-purple-700" />
              <Link to="profile" className="font-semibold text-purple-700">
                Profile & Risk
              </Link>
            </li>
            <li className="mb-4 flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-purple-100">
              <FaWallet className="text-purple-700" />
              <Link to="portfolio" className="font-semibold text-purple-700">
                Portfolio & Transactions
              </Link>
            </li>
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-sky-300 via-purple-200 to-purple-400 p-6">
        {/* Welcome */}
        <h1 className="text-3xl font-bold text-purple-700 mb-6">
          Welcome, {username} 👋
        </h1>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-gray-500">Total Income</h2>
            <p className="text-2xl font-bold text-green-600">₹{income}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-gray-500">Total Expenses</h2>
            <p className="text-2xl font-bold text-red-600">₹{expenses}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-gray-500">Savings</h2>
            <p className="text-2xl font-bold text-blue-600">₹{savings}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-gray-500">Remaining Balance</h2>
            <p className="text-2xl font-bold text-purple-600">₹{savings}</p>
          </div>
        </div>

        {/* Nested Pages */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <Outlet /> {/* ProfileRisk or Portfolio will render here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;