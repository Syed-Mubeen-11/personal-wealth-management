import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TransactionManagement from "./TransactionManagement";
import api from "../../services/api";

function PortfolioOverview() {
  const [investments, setInvestments] = useState([]);
  // FE Dev 1: Added loading and timestamp states
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    // FE Dev 1: Start loading state
    setIsLoading(true);
    try {
      const res = await api.get("/investments");
      setInvestments(res.data);
      
      // FE Dev 1: Pull last_price_at from the database records
      if (res.data.length > 0 && res.data[0].last_price_at) {
        setLastUpdated(res.data[0].last_price_at);
      } else {
        setLastUpdated(new Date().toISOString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      // FE Dev 1: Ensure loading screen is removed
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this investment?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/investments/${id}`);
      setInvestments(investments.filter((item) => item.id !== id));
    } catch (err) {
      alert("Error deleting investment");
    }
  };

  const calculatePL = (investment) => {
    const currentValue = investment.units * investment.last_price;
    const invested = investment.units * investment.avg_buy_price;
    return (currentValue - invested).toFixed(2);
  };

  return (
    <div className="space-y-8 text-white">

      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Portfolio Overview
          </h1>
          {/* FE Dev 1: Requirement p. 4 - Added Last Updated timestamp display */}
          <p className="text-xs text-slate-500 mt-1">
            {lastUpdated 
              ? `Market Sync: ${new Date(lastUpdated).toLocaleString()}` 
              : "Market Sync: Initializing..."}
          </p>
        </div>
        
        <Link
          to="/portfolio/create"
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition shadow-lg shadow-purple-500/20"
          >
          + Add Investment
        </Link>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700 p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-700 text-slate-400">
              <tr>
                <th className="py-3">Type</th>
                <th>Symbol</th>
                <th>Units</th>
                <th>Avg Buy</th>
                <th>Last Price</th>
                <th>P/L</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {/* FE Dev 1: Requirement - Handle Loading States with Skeleton Rows */}
              {isLoading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className="border-b border-slate-800 animate-pulse">
                    <td className="py-4"><div className="h-4 w-16 bg-slate-800 rounded"></div></td>
                    <td><div className="h-4 w-12 bg-slate-800 rounded"></div></td>
                    <td><div className="h-4 w-8 bg-slate-800 rounded"></div></td>
                    <td><div className="h-4 w-20 bg-slate-800 rounded"></div></td>
                    <td><div className="h-4 w-20 bg-slate-800 rounded"></div></td>
                    <td><div className="h-4 w-16 bg-slate-800 rounded"></div></td>
                    <td><div className="h-4 w-12 bg-slate-800 rounded"></div></td>
                  </tr>
                ))
              ) : (
                investments.map((inv) => {
                  const pl = calculatePL(inv);
                  const isProfit = pl >= 0;

                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-slate-800 hover:bg-slate-800/50 transition"
                    >
                      <td className="py-4 capitalize text-slate-300">
                        {inv.asset_type}
                      </td>
                      <td className="font-medium text-purple-300">{inv.symbol}</td>
                      <td>{inv.units}</td>
                      <td>₹ {inv.avg_buy_price.toLocaleString('en-IN')}</td>
                      
                      {/* FE Dev 1: Requirement p. 3 - Added Live indicator next to prices */}
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">₹ {inv.last_price.toLocaleString('en-IN')}</span>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                        </div>
                      </td>

                      <td
                        className={`font-semibold ${
                          isProfit ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {isProfit ? "+" : ""}₹ {parseFloat(pl).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="text-red-400 hover:text-red-300 transition text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {!isLoading && investments.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-500">No investments found. Add your first one above!</p>
            </div>
          )}
        </div>
      </div>

      <TransactionManagement />

    </div>
  );
}

export default PortfolioOverview;