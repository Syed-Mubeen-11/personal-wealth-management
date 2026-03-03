import React from "react";

const Transactions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-purple-200 to-purple-400 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg">
        <h2 className="text-3xl font-bold text-purple-700 mb-6">Transaction History</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b px-4 py-2">Date</th>
              <th className="border-b px-4 py-2">Type</th>
              <th className="border-b px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b px-4 py-2">01-03-2026</td>
              <td className="border-b px-4 py-2">Buy</td>
              <td className="border-b px-4 py-2">$1000</td>
            </tr>
            <tr>
              <td className="border-b px-4 py-2">02-03-2026</td>
              <td className="border-b px-4 py-2">Sell</td>
              <td className="border-b px-4 py-2">$500</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;