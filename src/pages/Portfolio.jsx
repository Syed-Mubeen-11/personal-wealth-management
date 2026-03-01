import React from "react";

const Portfolio = () => {
  const positions = [
    { asset: "TCS", qty: 10, price: 3500 },
    { asset: "Bitcoin", qty: 0.5, price: 3000000 },
    { asset: "Gold ETF", qty: 5, price: 5000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-950 text-white p-8 relative overflow-hidden">

      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-6">Portfolio 📊</h2>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/10 text-gray-300">
              <tr>
                <th className="p-4">Asset</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Price</th>
                <th className="p-4">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((item, index) => (
                <tr key={index} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-4">{item.asset}</td>
                  <td className="p-4">{item.qty}</td>
                  <td className="p-4">₹{item.price.toLocaleString()}</td>
                  <td className="p-4 text-green-400">
                    ₹{(item.qty * item.price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Portfolio;