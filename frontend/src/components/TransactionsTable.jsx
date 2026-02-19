import React from "react";

const TransactionsTable = () => {
  const transactions = [
    { id: 1, name: "Salary", amount: "$5000", date: "2026-02-10" },
    { id: 2, name: "Groceries", amount: "-$200", date: "2026-02-12" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Transactions
        </h3>
        <button className="text-sm text-indigo-600 hover:underline">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-sm border-b border-gray-100">
              <th className="pb-3">Name</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition"
              >
                <td className="py-4 font-medium text-gray-800">
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

                <td className="py-4 text-gray-500 text-sm">
                  {t.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default TransactionsTable;
