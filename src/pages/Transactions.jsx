import React from "react";

const Transactions = () => {
  const transactions = [
    { date: "01 Mar 2026", type: "Buy", asset: "TCS", amount: 35000 },
    { date: "10 Mar 2026", type: "Sell", asset: "Bitcoin", amount: 50000 },
    { date: "15 Mar 2026", type: "Buy", asset: "Gold ETF", amount: 25000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-950 text-white p-8 relative overflow-hidden">

      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-6">Transactions 💳</h2>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/10 text-gray-300">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Type</th>
                <th className="p-4">Asset</th>
                <th className="p-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item, index) => (
                <tr key={index} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-4">{item.date}</td>
                  <td className={`p-4 ${item.type === "Buy" ? "text-green-400" : "text-red-400"}`}>
                    {item.type}
                  </td>
                  <td className="p-4">{item.asset}</td>
                  <td className="p-4">₹{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Transactions;