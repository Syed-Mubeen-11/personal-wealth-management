import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TransactionManagement from "./TransactionManagement";
import api from "../../services/api";

function PortfolioOverview() {
  const [investments, setInvestments] = useState([]);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const res = await api.get("/investments");
      setInvestments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this investment?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/investments/${id}`);
      setInvestments(investments.filter((item) => item.id !== id));
    } catch (err) {
      alert("Error deleting investment");
    }
  };

  const calculatePL = (investment) => {
    const currentValue = investment.units * investment.last_price;
    const invested = investment.units * investment.avg_buy_price;
    return (currentValue - invested).toFixed(2);
  };

  return (
    <div className="space-y-8 text-white">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Portfolio Overview
        </h1>
        

        <Link
          to="/portfolio/create"
          className="px-5 py-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition"
          >
          + Add Investment
          </Link>
      </div>


      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700 p-6">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-slate-700 text-slate-400">
              <tr>
                <th className="py-3">Type</th>
                <th>Symbol</th>
                <th>Units</th>
                <th>Avg Buy</th>
                <th>Last Price</th>
                <th>P/L</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {investments.map((inv) => {
                const pl = calculatePL(inv);
                const isProfit = pl >= 0;

                return (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition"
                  >
                    <td className="py-4 capitalize">
                      {inv.asset_type}
                    </td>
                    <td>{inv.symbol}</td>
                    <td>{inv.units}</td>
                    <td>₹ {inv.avg_buy_price}</td>
                    <td>₹ {inv.last_price}</td>
                    <td
                      className={`font-semibold ${
                        isProfit ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      ₹ {pl}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

      <TransactionManagement />

    </div>
  );
}

export default PortfolioOverview;