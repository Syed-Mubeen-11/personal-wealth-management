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
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="ml-64 p-8 w-full flex items-center justify-center">
          <div className="text-xl font-bold text-gray-400 animate-pulse">Syncing your wealth data...</div>
        </div>
      </div>
    );
  }

  // Helper for Asset Colors
  const getAssetStyle = (asset) => {
    const config = {
      stock: { bar: 'bg-blue-600', text: 'text-blue-600' },
      crypto: { bar: 'bg-purple-600', text: 'text-purple-600' },
      gold: { bar: 'bg-amber-500', text: 'text-amber-600' },
      mutual_fund: { bar: 'bg-emerald-600', text: 'text-emerald-600' }
    };
    return config[asset.toLowerCase()] || { bar: 'bg-indigo-500', text: 'text-indigo-600' };
  };

  const StatCard = ({ title, value, color, subtitle }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <h3 className="text-gray-400 text-[10px] font-black mb-1 uppercase tracking-widest">{title}</h3>
      <p className={`text-2xl font-black ${color}`}>₹{value?.toLocaleString()}</p>
      {subtitle && <p className="text-[10px] text-gray-400 mt-1 font-bold">{subtitle}</p>}
    </div>
  );

  // Calculate Return %
  const returnPercentage = data?.total_invested > 0 
    ? ((data.profit_loss / data.total_invested) * 100).toFixed(2) 
    : 0;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Financial Overview</h1>
            <p className="text-gray-500 font-medium">Tracking your journey toward financial freedom.</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Worth Estimate</p>
            <p className="text-xl font-black text-slate-900">₹{(data?.savings + data?.portfolio_value).toLocaleString()}</p>
          </div>
        </header>

        <SmartAdvisor />

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Monthly Income" value={data?.total_income} color="text-green-600" />
          <StatCard title="Monthly Expenses" value={data?.total_expenses} color="text-red-500" />
          <StatCard 
            title="Net Savings" 
            value={data?.savings} 
            color="text-indigo-600" 
            subtitle={`${data?.total_income > 0 ? ((data.savings / data.total_income) * 100).toFixed(0) : 0}% Savings Rate`}
          />
          <StatCard title="Active Goals" value={data?.goal_count} color="text-purple-600" subtitle="Financial milestones" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portfolio Performance Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-800 tracking-tight">Portfolio Performance</h2>
              <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-tighter ${data?.profit_loss >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {returnPercentage}% Total Return
              </span>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Market Value</p>
                  <p className="text-3xl font-black text-slate-900">₹{data?.portfolio_value.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cost Basis</p>
                  <p className="text-lg font-bold text-gray-600 italic">₹{data?.total_invested.toLocaleString()}</p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl flex justify-between items-center ${data?.profit_loss >= 0 ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
                <span className="text-sm font-bold text-gray-500 uppercase">Total Profit/Loss</span>
                <span className={`text-xl font-black ${data?.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data?.profit_loss >= 0 ? '+' : ''}₹{data?.profit_loss.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Asset Allocation Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-gray-800 tracking-tight mb-6">Asset Allocation</h2>
            <div className="space-y-5">
              {Object.entries(data?.asset_allocation || {}).length > 0 ? (
                Object.entries(data?.asset_allocation).map(([asset, percent]) => {
                  const style = getAssetStyle(asset);
                  return (
                    <div key={asset} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-black uppercase tracking-widest ${style.text}`}>{asset}</span>
                        <span className="text-sm font-black text-slate-700">{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div 
                          className={`${style.bar} h-full rounded-full transition-all duration-1000 ease-out`} 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 italic text-sm">No investments found to track allocation.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expense Breakdown Mini-Grid */}
        <div className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-black text-gray-800 tracking-tight mb-6">Expense Breakdown</h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(data?.expense_breakdown || {}).map(([category, amount]) => (
              <div key={category} className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{category}</p>
                <p className="text-lg font-black text-gray-700">₹{amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;