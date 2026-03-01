import React from "react";
import { goalsData } from "../data/mockData";
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
  const contributionData = [
    { name: "Jan", monthly: 10000 },
    { name: "Feb", monthly: 15000 },
    { name: "Mar", monthly: 12000 },
    { name: "Apr", monthly: 18000 },
    { name: "May", monthly: 20000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-950 text-white p-8 relative overflow-hidden">
      
      {/* Glow Effect */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-6">Goals Dashboard 🎯</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
            <p className="text-gray-400 text-sm">Target Amount</p>
            <h3 className="text-2xl font-bold mt-2">₹5,00,000</h3>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
            <p className="text-gray-400 text-sm">Achieved</p>
            <h3 className="text-2xl font-bold mt-2">₹2,10,000</h3>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
            <p className="text-gray-400 text-sm">Remaining</p>
            <h3 className="text-2xl font-bold mt-2 text-red-400">₹2,90,000</h3>
          </div>

        </div>

        {/* Contribution Chart */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Monthly Contributions</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contributionData}>
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="monthly" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Goals;