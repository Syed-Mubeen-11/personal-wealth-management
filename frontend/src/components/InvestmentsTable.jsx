import React, { useState, useEffect } from 'react';
import { useContext } from "react";
import { ThemeContext } from "../context/Themecontext";
import API from "../services/api";

// ────────────────────────────────────────────────────────────────────────────

function InvestmentsTable({ investments, onEdit, onDelete, fetchInvestments }) {
  const { darkMode } = useContext(ThemeContext);

  const [rebalanceData, setRebalanceData] = useState(null);

  useEffect(() => {
    const fetchRebalanceData = async () => {
      try {
        const response = await API.get('/recommendations/rebalance');
        setRebalanceData(response.data);
        } catch (error) {
      console.error('Failed to fetch rebalance data', error);
  }
    };
    fetchRebalanceData();
  }, []);

  const getDriftForAsset = (assetType) => {
    if (!rebalanceData?.currentWeights) return null;
    const current = rebalanceData.currentWeights[assetType] || 0;
    const target = rebalanceData.targetWeights[assetType] || 0;
    return (current - target) * 100;
  };

  const getDriftIcon = (drift) => {
    if (drift === null) return { icon: '?', color: 'text-gray-400', tooltip: 'No data' };
    if (drift > 2) return { icon: '↑', color: 'text-red-600', tooltip: `Overweight by ${drift.toFixed(1)}%` };
    if (drift < -2) return { icon: '↓', color: 'text-green-600', tooltip: `Underweight by ${Math.abs(drift).toFixed(1)}%` };
    return { icon: '●', color: 'text-gray-400', tooltip: 'Balanced' };
  };

  const refreshPrice = async () => {
    try {
      await API.post("/investments/refresh-prices");
      fetchInvestments();
    } catch (error) {
      console.error("Refresh failed", error);
    }
  };

  return (
    <div className={`rounded-xl shadow p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Investments</h2>
        <button
          onClick={refreshPrice}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition shadow-sm"
        >
          Refresh All Prices
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <th className={`text-left py-2 px-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Symbol</th>
              <th className={`text-left py-2 px-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Asset Type</th>
              <th className={`text-left py-2 px-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Units</th>
              <th className={`text-left py-2 px-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Buy Price</th>
              <th className={`text-left py-2 px-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Cost Basis</th>
              <th className={`text-left py-2 px-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Live Price</th>
              <th className={`text-left py-2 px-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Value</th>
              <th className={`text-left py-2 px-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>P/L</th>
              <th className={`text-left py-2 px-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Drift</th>
              <th className={`text-left py-2 px-2 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {investments.map(inv => {
              const livePrice = inv.last_price || 0;
              const costBasis = inv.units * inv.avg_buy_price;
              const value = inv.current_value || 0;
              const profitLoss = value - costBasis;
              const drift = getDriftForAsset(inv.asset_type);
              const { icon, color, tooltip } = getDriftIcon(drift);

              return (
                <tr key={inv.id} className={`border-b ${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-100 hover:bg-gray-50"}`}>
                  <td className={`py-2 px-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{inv.symbol}</td>
                  <td className={`py-2 px-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{inv.asset_type?.replace(/_/g, ' ')}</td>
                  <td className={`py-2 px-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{inv.units}</td>
                  <td className={`py-2 px-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                    {inv.avg_buy_price > 0 ? (
                      `₹${inv.avg_buy_price}`
                    ) : (
                      <span className="text-red-500 font-semibold">Missing</span>
                    )}
                  </td>
                  <td className={`py-2 px-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>₹{costBasis.toFixed(2)}</td>
                  <td className={`py-2 px-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>₹{livePrice.toFixed(2)}</td>
                  <td className={`py-2 px-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>₹{value.toFixed(2)}</td>
                  <td className={`py-2 ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{profitLoss.toFixed(2)}
                  </td>
                  <td className="py-2">
                    <div className="relative group inline-block">
                      <span className={`cursor-help ${color} text-lg font-bold`}>{icon}</span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {tooltip}
                      </div>
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(inv)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(inv.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {investments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No investments yet. Create one above.
        </div>
      )}
    </div>
  );
}

export default InvestmentsTable;