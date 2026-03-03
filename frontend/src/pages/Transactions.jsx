import React, { useState, useContext } from "react";
import { ThemeContext } from "../context/Themecontext";

const dummyTransactions = [
  { date: "2026-03-01", asset: "Apple", type: "Buy", quantity: 5, price: 170, status: "Completed" },
  { date: "2026-02-25", asset: "Tesla", type: "Sell", quantity: 2, price: 640, status: "Completed" },
  { date: "2026-02-20", asset: "HDFC Bank", type: "Buy", quantity: 10, price: 1500, status: "Pending" },
];

const Transactions = () => {
  const { darkMode } = useContext(ThemeContext);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  const filteredTransactions = dummyTransactions.filter((tx) => {
    const matchesSearch = tx.asset.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className={`space-y-8 ${darkMode ? "bg-gray-900 text-white" : ""} min-h-screen p-4 md:p-6`}>
      
      {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Transaction History
            </h2>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mt-1`}>
              Monitor, search, and filter all your asset transactions in one place.
            </p>
          </div>

        <button className="mt-4 md:mt-0 px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition">
          + Add Transaction
        </button>
      </div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by asset..."
          className={`px-4 py-2 border rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900"
          }`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className={`px-4 py-2 border rounded-lg w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
          }`}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Buy">Buy</option>
          <option value="Sell">Sell</option>
        </select>
      </div>

      {/* Table */}
      <div className={`p-6 rounded-xl shadow-sm overflow-x-auto ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}>
        <table className="min-w-full text-sm text-left">
          <thead className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <tr>
              <th className="py-2">Date</th>
              <th className="py-2">Asset</th>
              <th className="py-2">Type</th>
              <th className="py-2">Quantity</th>
              <th className="py-2">Price</th>
              <th className="py-2">Total</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map((tx, index) => {
              const total = tx.quantity * tx.price;
              return (
                <tr key={index} className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <td className="py-3">{tx.date}</td>
                  <td>{tx.asset}</td>
                  <td className={tx.type === "Buy" ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    {tx.type}
                  </td>
                  <td>{tx.quantity}</td>
                  <td>${tx.price}</td>
                  <td>${total}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        tx.status === "Completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Transactions;