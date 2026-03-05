import { useEffect, useState } from "react";
import axios from "axios";

export default function PortfolioTransactions() {
  const [data, setData] = useState({ overview: {}, positions: [], transactions: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Fetch all financial data from your Python/Backend server
        const [ovRes, posRes, transRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/portfolio/overview"),
          axios.get("http://127.0.0.1:8000/portfolio/positions"),
          axios.get("http://127.0.0.1:8000/transactions"),
        ]);
        setData({ 
          overview: ovRes.data, 
          positions: posRes.data, 
          transactions: transRes.data 
        });
      } catch (err) {
        console.error("Data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Filter logic for transactions
  const filteredTransactions = data.transactions.filter((t) =>
    t.asset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800 p-6 hidden md:block">
        <div className="flex items-center gap-2 mb-10 px-2 font-bold text-lg text-white">
          <div className="w-6 h-6 bg-purple-600 rounded"></div> Wealth Management
        </div>
        <nav className="space-y-4">
          <div className="text-slate-500 hover:text-white cursor-pointer text-sm">Profile & Risk</div>
          <div className="text-slate-500 hover:text-white cursor-pointer text-sm">Goals</div>
          <div className="text-white font-semibold text-sm border-l-2 border-purple-500 pl-4">Portfolio & Transactions</div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Portfolio & Transactions</h1>
        </header>

        {loading ? (
          <div className="text-center mt-20 text-slate-400">Loading your financial data...</div>
        ) : (
          <>
            {/* OVERVIEW SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <section className="lg:col-span-3 bg-slate-900 p-8 rounded-xl border border-slate-800">
                <h3 className="text-slate-400 text-xs font-bold uppercase mb-6">Portfolio Overview</h3>
                <div className="flex flex-wrap gap-12">
                  <div><p className="text-slate-500 text-xs mb-1">Total Value</p><p className="text-3xl font-bold">${data.overview.total_value}</p></div>
                  <div><p className="text-slate-500 text-xs mb-1">Performance</p><p className="text-3xl font-bold text-green-400">+{data.overview.performance}</p></div>
                  <div><p className="text-slate-500 text-xs mb-1">Overall Gain</p><p className="text-3xl font-bold text-purple-400">+{data.overview.gain_loss}</p></div>
                </div>
              </section>
            </div>

            {/* POSITIONS TABLE */}
            <section className="bg-slate-900 rounded-xl border border-slate-800 mb-8 overflow-hidden">
              <div className="p-5 border-b border-slate-800 font-bold">Current Positions</div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/50 text-slate-500 uppercase text-[10px]">
                  <tr><th className="p-4">Symbol</th><th className="p-4">Company</th><th className="p-4">Units</th><th className="p-4">Avg Buy</th><th className="p-4">Mkt Value</th><th className="p-4 text-right">Gain</th></tr>
                </thead>
                <tbody>
                  {data.positions.map((pos, i) => (
                    <tr key={i} className="border-t border-slate-800">
                      <td className="p-4 font-bold text-purple-400">{pos.symbol}</td>
                      <td className="p-4 text-slate-400">{pos.company}</td>
                      <td className="p-4">{pos.units}</td>
                      <td className="p-4">${pos.avg_buy_price}</td>
                      <td className="p-4">${pos.market_value}</td>
                      <td className="p-4 text-right text-green-400">{pos.gain}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* TRANSACTIONS */}
            <section className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-800 font-bold">Transaction Management</div>
              <div className="p-4 border-b border-slate-800">
                <input 
                  type="text" 
                  placeholder="Search assets..." 
                  className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs text-slate-400" 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/50 text-slate-500 uppercase text-[10px]">
                  <tr><th className="p-4">Date</th><th className="p-4">Type</th><th className="p-4">Asset</th><th className="p-4 text-right">Amount</th></tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t, i) => (
                    <tr key={i} className="border-t border-slate-800">
                      <td className="p-4 text-slate-400">{t.date}</td>
                      <td className="p-4"><span className="bg-slate-800 px-2 py-1 rounded text-[10px]">{t.type}</span></td>
                      <td className="p-4 font-bold">{t.asset}</td>
                      <td className="p-4 text-right font-mono">${t.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}