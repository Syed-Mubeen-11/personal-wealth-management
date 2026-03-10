import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getAnalytics } from '../services/investmentService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAnalytics();
        console.log("Analytics API Response:", res);
        setData(res);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="ml-64 p-8">Loading Analytics...</div>;

  // Map your API key "allocation" to the chart format
  const allocationData = data?.allocation 
    ? Object.entries(data.allocation).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Portfolio Analytics</h1>

        {/* Updated Stats based on your API keys */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Invested</p>
            <p className="text-2xl font-bold text-slate-800">₹{data?.total_invested?.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Current Value</p>
            <p className="text-2xl font-bold text-blue-600">₹{data?.current_value?.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Profit / Loss</p>
            <p className={`text-2xl font-bold ${data?.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{data?.profit_loss?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart with FIXED HEIGHT PARENT */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Asset Allocation</h2>
            {/* This div MUST have a height for ResponsiveContainer to work */}
            <div className="h-72 w-full"> 
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Portfolio Insights</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-sm">
                {allocationData.length > 0 
                  ? `Your portfolio is primarily concentrated in ${allocationData[0].name}.`
                  : "Add more investments to see detailed distribution."}
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600">
                Data is synced with live market rates (if configured in backend).
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;