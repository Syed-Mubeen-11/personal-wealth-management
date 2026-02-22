import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Dashboard = () => {
  const lineData = [
    { name: "Jan", value: 100000 },
    { name: "Feb", value: 140000 },
    { name: "Mar", value: 130000 },
    { name: "Apr", value: 170000 },
    { name: "May", value: 190000 },
    { name: "Jun", value: 210000 },
  ];

  const pieData = [
    { name: "Stocks", value: 40 },
    { name: "Crypto", value: 20 },
    { name: "Savings", value: 25 },
    { name: "Gold", value: 15 },
  ];

  const COLORS = ["#8B5CF6", "#06B6D4", "#10B981", "#F97316"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-950 text-white p-8 relative overflow-hidden">

      {/* Glow Background Effect */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500 opacity-20 blur-3xl rounded-full"></div>

      {/* Greeting */}
      <div className="flex justify-between items-center mb-10 relative z-10">
        <div>
          <h2 className="text-3xl font-bold">
            Welcome Back 👋
          </h2>
          <p className="text-gray-400">
            Here’s your financial overview
          </p>
        </div>

        <button className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition">
          + Add Transaction
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 relative z-10">
        
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg hover:scale-105 transition">
          <p className="text-sm text-gray-400">Total Net Worth</p>
          <h3 className="text-2xl font-bold mt-2">₹2,50,000</h3>
          <span className="text-green-400 text-sm">+2.4%</span>
        </div>

        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg hover:scale-105 transition">
          <p className="text-sm text-gray-400">Investments</p>
          <h3 className="text-2xl font-bold mt-2">₹80,000</h3>
          <span className="text-green-400 text-sm">+2.4%</span>
        </div>

        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg hover:scale-105 transition">
          <p className="text-sm text-gray-400">Income</p>
          <h3 className="text-2xl font-bold mt-2">₹50,000</h3>
          <span className="text-green-400 text-sm">+2.4%</span>
        </div>

        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg hover:scale-105 transition">
          <p className="text-sm text-gray-400">Expenses</p>
          <h3 className="text-2xl font-bold mt-2">₹30,000</h3>
          <span className="text-red-400 text-sm">-1.2%</span>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">

        {/* Line Chart */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            Net Worth Growth
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8B5CF6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            Asset Allocation
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;