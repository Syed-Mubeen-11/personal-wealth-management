import React, { useContext } from "react";
import SummaryCard from "../components/SummaryCard";
import ChartCard from "../components/ChartCard";
import { ThemeContext } from "../context/Themecontext";

const positions = [
  { asset: "Apple", quantity: 10, avgCost: 150, currentPrice: 175 },
  { asset: "Tesla", quantity: 5, avgCost: 600, currentPrice: 650 },
  { asset: "HDFC Bank", quantity: 20, avgCost: 1400, currentPrice: 1550 },
];

const Portfolio = () => {
  const { darkMode } = useContext(ThemeContext);

  const totalInvested = positions.reduce(
    (acc, item) => acc + item.quantity * item.avgCost,
    0
  );

  const totalValue = positions.reduce(
    (acc, item) => acc + item.quantity * item.currentPrice,
    0
  );

  const totalPL = totalValue - totalInvested;

  return (
    <div className={`space-y-8 ${darkMode ? "text-white" : "text-gray-900"}`}>
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">
          Portfolio Overview
        </h2>
        <p className={`${darkMode ? "text-gray-300" : "text-gray-500"} mt-1`}>
          Track your investments and performance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SummaryCard title="Total Invested" value={`$${totalInvested}`} />
        <SummaryCard title="Current Value" value={`$${totalValue}`} />
        <SummaryCard title="Total Profit / Loss" value={`$${totalPL}`} />
      </div>

      {/* Positions Table */}
      <div className={`p-6 rounded-xl shadow-sm overflow-x-auto ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
          Positions
        </h3>
        <table className="min-w-full text-sm text-left">
          <thead className={`border-b ${darkMode ? "border-gray-600" : "border-gray-300"}`}>
            <tr>
              <th className="py-2">Asset</th>
              <th className="py-2">Quantity</th>
              <th className="py-2">Avg Cost</th>
              <th className="py-2">Current Price</th>
              <th className="py-2">Total Value</th>
              <th className="py-2">P/L</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((item, index) => {
              const invested = item.quantity * item.avgCost;
              const current = item.quantity * item.currentPrice;
              const pl = current - invested;

              return (
                <tr key={index} className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <td className={`${darkMode ? "text-gray-200" : ""} py-3`}>{item.asset}</td>
                  <td className={`${darkMode ? "text-gray-200" : ""}`}>{item.quantity}</td>
                  <td className={`${darkMode ? "text-gray-200" : ""}`}>${item.avgCost}</td>
                  <td className={`${darkMode ? "text-gray-200" : ""}`}>${item.currentPrice}</td>
                  <td className={`${darkMode ? "text-gray-200" : ""}`}>${current}</td>
                  <td className={pl >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    ${pl}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Portfolio Growth" type="line" />
        <ChartCard title="Asset Allocation" type="pie" />
      </div>

    </div>
  );
};

export default Portfolio;