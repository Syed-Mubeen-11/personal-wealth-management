import React, { useEffect, useState } from "react";
import { FaUser, FaWallet, FaSignOutAlt, FaBullseye } from "react-icons/fa";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const [income] = useState(50000);
  const [expenses] = useState(20000);
  const savings = income - expenses;

  // Goals Data
  const goalTarget = 500000;
  const goalAchieved = 210000;
  const goalRemaining = goalTarget - goalAchieved;

  const contributionData = [
    { month: "Jan", amount: 10000 },
    { month: "Feb", amount: 15000 },
    { month: "Mar", amount: 12000 },
    { month: "Apr", amount: 18000 },
    { month: "May", amount: 20000 },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (!storedUser) {
      navigate("/");
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
              <Link to="profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 font-medium">
                <FaUser />
                Profile & Risk
              </Link>
            </li>

            <li>
              <Link to="portfolio" className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 font-medium">
                <FaWallet />
                Portfolio
              </Link>
            </li>

            <li>
              <Link to="transactions" className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 font-medium">
                <FaWallet />
                Transactions
              </Link>
            </li>

            <li>
              <Link to="goals" className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 font-medium">
                <FaBullseye />
                Goals
              </Link>
            </li>
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 font-semibold px-4 py-3 rounded-xl hover:bg-red-600 hover:text-white"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-sky-300 via-purple-200 to-purple-400 p-8 overflow-y-auto">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-800">
            Welcome, {username} 👋
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-gray-500">Income</h2>
            <p className="text-2xl font-bold text-green-600">₹{income}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-gray-500">Expenses</h2>
            <p className="text-2xl font-bold text-red-600">₹{expenses}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-gray-500">Savings</h2>
            <p className="text-2xl font-bold text-blue-600">₹{savings}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-gray-500">Balance</h2>
            <p className="text-2xl font-bold text-purple-600">₹{savings}</p>
          </div>

        </div>

        {/* Goals Dashboard */}
        <div className="bg-white p-8 rounded-3xl shadow-xl mb-8">

          <h2 className="text-2xl font-bold text-purple-700 mb-6">
            Goals Dashboard 🎯
          </h2>

          {/* Goal Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">

            <div className="bg-purple-50 p-6 rounded-xl">
              <p className="text-gray-500">Target</p>
              <h3 className="text-xl font-bold text-purple-700">
                ₹{goalTarget}
              </h3>
            </div>

            <div className="bg-green-50 p-6 rounded-xl">
              <p className="text-gray-500">Achieved</p>
              <h3 className="text-xl font-bold text-green-600">
                ₹{goalAchieved}
              </h3>
            </div>

            <div className="bg-red-50 p-6 rounded-xl">
              <p className="text-gray-500">Remaining</p>
              <h3 className="text-xl font-bold text-red-600">
                ₹{goalRemaining}
              </h3>
            </div>

          </div>

          {/* Contribution Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#7C3AED" radius={[10,10,0,0]} />
            </BarChart>
          </ResponsiveContainer>

        </div>

        {/* Nested Pages */}
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl min-h-[400px]">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;