import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

const RebalancePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRebalanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get token and verify it exists
    //   const token = localStorage.getItem('token');
    const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      // 2. Fetch with full headers to avoid 401
      const response = await fetch('http://127.0.0.1:8000/api/v1/rebalance/calculate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // 3. Handle specific status codes
      if (response.status === 401) {
        throw new Error('Session Expired (401). Please log out and log back in.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown Server Error' }));
        throw new Error(errorData.detail || 'Failed to fetch data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Rebalance Page Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRebalanceData();
  }, []);

  // LOADING STATE
  if (loading) return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="font-black text-blue-600 text-2xl uppercase tracking-tighter animate-pulse">
          Syncing Market Drift...
        </div>
      </div>
    </div>
  );

  // ERROR STATE
  if (error) return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col justify-center items-center p-10">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-red-100 text-center max-w-lg">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Connection Issue</h2>
          <p className="text-gray-500 font-bold mb-8">{error}</p>
          <button 
            onClick={fetchRebalanceData}
            className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar />
      <main className="ml-64 p-10 w-full">
        {/* HEADER SECTION */}
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-gray-900">Rebalance Engine</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
              Isolated Strategy Optimizer • {data?.risk_profile || 'Standard'} Profile
            </p>
          </div>
          <div className="bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm">
             <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Total Portfolio Value</span>
             <span className="text-2xl font-black text-gray-900">
               ₹{data?.total_value ? data.total_value.toLocaleString() : '0'}
             </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT: DRIFT TABLE */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
                Asset Allocation Comparison
                <div className="h-2 w-2 rounded-full bg-green-500 animate-ping"></div>
              </h3>

              <div className="overflow-hidden rounded-[2rem] border border-gray-50">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                      <th className="p-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Current %</th>
                      <th className="p-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Target %</th>
                      <th className="p-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Drift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data?.drift_report?.length > 0 ? data.drift_report.map((item) => (
                      <tr key={item.category} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-6 font-bold text-gray-700">{item.category}</td>
                        <td className="p-6 text-center font-black text-gray-900">{item.actual}%</td>
                        <td className="p-6 text-center font-bold text-blue-500">{item.target}%</td>
                        <td className={`p-6 text-right font-black ${
                          item.drift > 2 ? 'text-red-500' : item.drift < -2 ? 'text-green-500' : 'text-gray-300'
                        }`}>
                          {item.drift > 0 ? `+${item.drift}` : item.drift}%
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="p-10 text-center text-gray-400 font-bold italic">
                          No investment data found to analyze.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: ACTION CARDS */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Trade Suggestions</h4>
            
            {data?.suggestions?.length > 0 ? data.suggestions.map((s, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-blue-200 transition-all group">
                <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-[10px] font-black ${
                  s.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {s.type}
                </div>
                <p className="font-bold text-gray-800 leading-tight mb-4">{s.message}</p>
                <button className="w-full py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-600 transition-colors">
                  Auto-Execute
                </button>
              </div>
            )) : (
              <div className="bg-gray-100/50 border-2 border-dashed border-gray-200 p-10 rounded-[2.5rem] text-center">
                <p className="text-gray-400 font-bold text-xs italic">Portfolio is currently perfectly balanced.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RebalancePage;