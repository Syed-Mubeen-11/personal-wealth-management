import React from "react";
import { FaExchangeAlt, FaArrowUp, FaArrowDown } from "react-icons/fa";

const Transactions = () => {
  // Sample data - in a real app, this would come from an API or LocalStorage
  const transactionHistory = [
    { id: 1, date: "01-03-2026", type: "Buy", symbol: "AAPL", amount: 1000, status: "Completed" },
    { id: 2, date: "02-03-2026", type: "Sell", symbol: "GOOGL", amount: 500, status: "Completed" },
    { id: 3, date: "03-03-2026", type: "Buy", symbol: "TSLA", amount: 1200, status: "Pending" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <FaExchangeAlt className="text-purple-600" /> Transaction History
          </h2>
          <p className="text-gray-500 text-sm">Review your recent investment activities.</p>
        </div>
        <button className="text-sm font-bold text-purple-700 hover:underline">
          Download Statement
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-purple-50">
              <th className="px-6 py-4 text-sm font-bold text-purple-700 uppercase">Date</th>
              <th className="px-6 py-4 text-sm font-bold text-purple-700 uppercase">Asset</th>
              <th className="px-6 py-4 text-sm font-bold text-purple-700 uppercase">Type</th>
              <th className="px-6 py-4 text-sm font-bold text-purple-700 uppercase">Amount</th>
              <th className="px-6 py-4 text-sm font-bold text-purple-700 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactionHistory.map((trx) => (
              <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-600 text-sm">{trx.date}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{trx.symbol}</td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 font-semibold text-sm ${
                    trx.type === "Buy" ? "text-green-600" : "text-red-500"
                  }`}>
                    {trx.type === "Buy" ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                    {trx.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-gray-700">₹{trx.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    trx.status === "Completed" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {trx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactionHistory.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No transactions found.</p>
        </div>
      )}
    </div>
  );
};

export default Transactions;