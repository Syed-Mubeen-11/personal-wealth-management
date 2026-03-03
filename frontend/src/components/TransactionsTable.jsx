import React, { useContext } from "react";
import { ThemeContext } from "../context/Themecontext";

const TransactionsTable = () => {
  const { darkMode } = useContext(ThemeContext);

  const transactions = [
    { id: 1, name: "Salary", amount: "$5000", date: "2026-02-10" },
    { id: 2, name: "Groceries", amount: "-$200", date: "2026-02-12" },
  ];

  return (
    <div
      className={`rounded-2xl shadow-sm border p-6 overflow-x-auto transition-colors duration-300 ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-100 text-gray-900"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Recent Transactions
        </h3>
        <button className="text-sm text-indigo-500 hover:underline">
          View All
        </button>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className={`text-sm border-b pb-3 ${darkMode ? "text-gray-400 border-gray-700" : "text-gray-500 border-gray-100"}`}>
            <th className="pb-3">Name</th>
            <th className="pb-3">Amount</th>
            <th className="pb-3">Date</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => (
            <tr
              key={t.id}
              className={`border-b transition ${
                darkMode
                  ? "border-gray-700 hover:bg-gray-700"
                  : "border-gray-50 hover:bg-gray-50"
              }`}
            >
              <td className={`py-4 font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                {t.name}
              </td>
              <td
                className={`py-4 font-semibold ${
                  t.amount.includes("-")
                    ? "text-red-500"
                    : "text-emerald-500"
                }`}
              >
                {t.amount}
              </td>
              <td className={`py-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {t.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;