import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getPortfolio } from '../services/investmentService';

const Portfolio = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await getPortfolio();
      setData(res);
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Portfolio Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-black tracking-widest uppercase text-xs">Loading Assets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Portfolio</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${loading ? 'bg-amber-400 animate-ping' : 'bg-green-400 animate-ping'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${loading ? 'bg-amber-500' : 'bg-green-500'}`}></span>
              </span>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {loading ? "Syncing Market Data..." : "Market Feed Active"}
                {lastSynced && <span className="ml-2 text-gray-500 italic">— Last updated: {lastSynced}</span>}
              </p>
            </div>
          </div>
          
          <button 
            onClick={fetchPortfolio}
            disabled={loading}
            className="bg-white border border-gray-200 px-5 py-2 rounded-2xl text-xs font-black text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
                <>
                  <div className="h-3 w-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  SYNCING...
                </>
            ) : "REFRESH PRICES"}
          </button>
        </header>

        {/* Portfolio Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Portfolio Value</p>
            <p className="text-3xl font-black">₹{(data?.current_value ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total P&L</p>
            <p className={`text-2xl font-black ${(data?.profit_loss ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(data?.profit_loss ?? 0) >= 0 ? '+' : ''}₹{(data?.profit_loss ?? 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Units</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Avg Price</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Live Price</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.investments?.map((inv) => {
                const currentVal = inv.current_value ?? 0;
                const costBasis = inv.cost_basis ?? 1;
                const units = inv.units ?? 0;
                
                const livePrice = units > 0 ? (currentVal / units) : 0;
                const pnlPercent = (((currentVal - costBasis) / costBasis) * 100).toFixed(2);
                
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/40 transition-colors group">
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 uppercase tracking-tight">{inv.symbol}</span>
                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">{inv.asset_type}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center font-bold text-slate-600">{units}</td>
                    <td className="p-5 text-right font-medium text-slate-400 italic">
                      ₹{(inv.avg_buy_price ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`font-black ${livePrice > 0 ? 'text-slate-900' : 'text-amber-500 italic text-xs'}`}>
                          {livePrice > 0 ? `₹${livePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : "Updating..."}
                        </span>
                        <div className={`h-1.5 w-1.5 rounded-full ${livePrice > 0 ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`}></div>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-slate-800">₹{currentVal.toLocaleString('en-IN')}</span>
                        <span className={`text-[10px] font-black ${parseFloat(pnlPercent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                           {livePrice > 0 ? `${pnlPercent}%` : '--'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Portfolio;