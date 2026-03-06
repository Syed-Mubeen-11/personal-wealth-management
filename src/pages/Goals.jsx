import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const Goals = () => {

  const targetAmount = 500000;
  const achievedAmount = 210000;
  const remainingAmount = targetAmount - achievedAmount;
  const targetDate = "31 Dec 2026";

  // Daily Contribution
  const dailyData = [
    { name: "Mon", amount: 2000 },
    { name: "Tue", amount: 2500 },
    { name: "Wed", amount: 3000 },
    { name: "Thu", amount: 2200 },
    { name: "Fri", amount: 3500 },
    { name: "Sat", amount: 4000 },
    { name: "Sun", amount: 1500 },
  ];

  // Weekly Contribution
  const weeklyData = [
    { name: "Week 1", amount: 15000 },
    { name: "Week 2", amount: 20000 },
    { name: "Week 3", amount: 18000 },
    { name: "Week 4", amount: 25000 },
  ];

  // Monthly Contribution (12 Months)
  const monthlyData = [
    { name: "Jan", amount: 10000 },
    { name: "Feb", amount: 15000 },
    { name: "Mar", amount: 12000 },
    { name: "Apr", amount: 18000 },
    { name: "May", amount: 20000 },
    { name: "Jun", amount: 22000 },
    { name: "Jul", amount: 25000 },
    { name: "Aug", amount: 24000 },
    { name: "Sep", amount: 26000 },
    { name: "Oct", amount: 28000 },
    { name: "Nov", amount: 30000 },
    { name: "Dec", amount: 35000 },
  ];

  // Yearly Contribution
  const yearlyData = [
    { name: "2022", amount: 120000 },
    { name: "2023", amount: 180000 },
    { name: "2024", amount: 210000 },
    { name: "2025", amount: 260000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-950 text-white p-8 relative overflow-hidden">

      {/* Glow Background */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="relative z-10">

        <h2 className="text-3xl font-bold mb-6">Goals Dashboard 🎯</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
            <p className="text-gray-400 text-sm">Target Amount</p>
            <h3 className="text-2xl font-bold mt-2">₹{targetAmount}</h3>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
            <p className="text-gray-400 text-sm">Achieved</p>
            <h3 className="text-2xl font-bold mt-2">₹{achievedAmount}</h3>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
            <p className="text-gray-400 text-sm">Remaining</p>
            <h3 className="text-2xl font-bold mt-2 text-red-400">₹{remainingAmount}</h3>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
            <p className="text-gray-400 text-sm">Target Date</p>
            <h3 className="text-xl font-bold mt-2 text-green-400">{targetDate}</h3>
          </div>

        </div>

        {/* Daily Chart */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg mb-10">
          <h3 className="text-lg font-semibold mb-4">Daily Contribution</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Chart */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg mb-10">
          <h3 className="text-lg font-semibold mb-4">Weekly Contribution</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Chart */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg mb-10">
          <h3 className="text-lg font-semibold mb-4">Monthly Contribution</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="amount" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Yearly Chart */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Yearly Contribution</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearlyData}>
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Goals;