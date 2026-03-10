import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getDashboardData } from '../services/dashboardService';
import SmartAdvisor from '../components/SmartAdvisor';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardData();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="ml-64 p-8 text-xl font-bold">Loading Dashboard...</div>;

  const StatCard = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-gray-500 text-sm font-semibold mb-1 uppercase">{title}</h3>
      <p className={`text-2xl font-bold ${color}`}>₹{value.toLocaleString()}</p>
    </div>
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Financial Overview</h1>
          <p className="text-gray-500">Welcome back! Here is what's happening with your wealth.</p>
        </header>

        <SmartAdvisor />

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Income" value={data?.total_income} color="text-green-600" />
          <StatCard title="Total Expenses" value={data?.total_expenses} color="text-red-600" />
          <StatCard title="Total Savings" value={data?.savings} color="text-blue-600" />
          <StatCard title="Active Goals" value={data?.goal_count} color="text-purple-600" />
        </div>

        {/* Portfolio Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Portfolio Performance</h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span>Current Value</span>
                <span className="font-bold text-slate-800">₹{data?.portfolio_value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Total Invested</span>
                <span>₹{data?.total_invested.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Profit/Loss</span>
                <span className={`font-bold ${data?.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{data?.profit_loss.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Asset Allocation Placeholder */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Asset Allocation</h2>
            <div className="space-y-2">
              {Object.entries(data?.asset_allocation || {}).map(([asset, percent]) => (
                <div key={asset} className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 font-medium capitalize">{asset}</span>
                  <div className="flex items-center space-x-2 w-2/3">
                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 min-w-max">{percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;