import React, { useContext } from "react";
import { ThemeContext } from "../context/Themecontext";

function PortfolioSummary({ investments = [] }) {
  const { darkMode } = useContext(ThemeContext);

  const totalInvested = investments.reduce(
    (sum, inv) => sum + Number(inv.cost_basis || 0),
    0
  );

  const totalValue = investments.reduce(
    (sum, inv) => sum + Number(inv.current_value || inv.cost_basis || 0),
    0
  );

  const profit = totalValue - totalInvested;

  const card = `p-6 rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`;
  const title = `text-lg font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`;
  const value = `text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

      <div className={card}>
        <h2 className={title}>Total Invested</h2>
        <p className={value}>₹{totalInvested}</p>
      </div>

      <div className={card}>
        <h2 className={title}>Portfolio Value</h2>
        <p className={value}>₹{totalValue}</p>
      </div>

      <div className={card}>
        <h2 className={title}>Profit / Loss</h2>
        <p className={`text-2xl font-bold ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>
          ₹{profit}
        </p>
      </div>

    </div>
  );
}

export default PortfolioSummary;