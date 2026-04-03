import React, { useContext } from "react";
import { ThemeContext } from "../context/Themecontext";

function TransactionsTable({ transactions = [], onEdit, onDelete, showActions = true }) {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={`rounded-2xl shadow-sm border p-6 ${
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
    }`}>
      <h3 className={`text-lg font-semibold mb-6 ${
        darkMode ? "text-white" : "text-gray-900"
      }`}>
        Transactions
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={`${
              darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}>
              <th className={`p-3 text-left text-sm font-semibold ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}>Symbol</th>
              <th className={`p-3 text-left text-sm font-semibold ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}>Type</th>
              <th className={`p-3 text-left text-sm font-semibold ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}>Quantity</th>
              <th className={`p-3 text-left text-sm font-semibold ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}>Price</th>
              <th className={`p-3 text-left text-sm font-semibold ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}>Date</th>
              <th className={`p-3 text-left text-sm font-semibold ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}>Status</th>
              {showActions && (
                <th className={`p-3 text-left text-sm font-semibold ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}>Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {transactions.map((tx, index) => (
              <tr 
                key={tx.id} 
                className={`border-t ${
                  darkMode 
                    ? "border-gray-700 hover:bg-gray-700/50" 
                    : "border-gray-200 hover:bg-gray-50"
                } transition-colors duration-150`}
              >
                <td className={`p-3 text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>{tx.symbol}</td>
                <td className={`p-3 text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    tx.type === "buy" 
                      ? darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700"
                      : tx.type === "sell"
                      ? darkMode ? "bg-red-900/50 text-red-300" : "bg-red-100 text-red-700"
                      : darkMode ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700"
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className={`p-3 text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>{tx.quantity}</td>
                <td className={`p-3 text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>₹{tx.price}</td>
                <td className={`p-3 text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>{new Date(tx.executed_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`flex items-center gap-2 text-sm font-semibold ${
                    tx.last_price_at 
                      ? darkMode ? "text-green-400" : "text-green-600"
                      : darkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      tx.last_price_at 
                        ? "bg-green-500 animate-pulse" 
                        : darkMode ? "bg-gray-500" : "bg-gray-400"
                    }`}></span>
                    {tx.last_price_at ? "LIVE" : "OLD"}
                  </span>
                </td>

                {showActions && (
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => onEdit(tx)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        darkMode 
                          ? "bg-yellow-600 hover:bg-yellow-700 text-white" 
                          : "bg-yellow-500 hover:bg-yellow-600 text-white"
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(tx.id)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        darkMode 
                          ? "bg-red-600 hover:bg-red-700 text-white" 
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionsTable;