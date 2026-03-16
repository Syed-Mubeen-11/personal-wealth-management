import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  // FE Dev 1: Added loading state to handle market data fetching
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    // FE Dev 1: Set loading to true before fetching
    setIsLoading(true);
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
      // FE Dev 1: Update sync timestamp
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error(err);
    } finally {
      // FE Dev 1: Ensure loading state is disabled after fetch
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter((tx) => tx.id !== id));
    } catch (err) {
      alert("Error deleting transaction");
      console.error(err);
    }
  };

  const badgeColor = (type) => {
    switch (type) {
      case "buy": return "bg-green-500/20 text-green-400";
      case "sell": return "bg-red-500/20 text-red-400";
      case "dividend": return "bg-blue-500/20 text-blue-400";
      case "contribution": return "bg-purple-500/20 text-purple-400";
      case "withdrawal": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          Transaction Management
        </h2>
        <Link
          to="/transactions/create"
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition text-white font-medium"
        >
          + Add Transaction
        </Link>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-0">
          <thead className="border-b border-slate-700 text-slate-400">
            <tr>
              <th className="py-3 px-2">Date</th>
              <th>Type</th>
              <th>Asset</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Fees</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* FE Dev 1: Requirement - Handle Loading States with Skeleton Rows */}
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td className="py-4 px-2"><div className="h-4 w-20 bg-slate-800 rounded"></div></td>
                  <td><div className="h-6 w-16 bg-slate-800 rounded-full"></div></td>
                  <td><div className="h-4 w-12 bg-slate-800 rounded"></div></td>
                  <td><div className="h-4 w-8 bg-slate-800 rounded"></div></td>
                  <td><div className="h-4 w-20 bg-slate-800 rounded"></div></td>
                  <td><div className="h-4 w-12 bg-slate-800 rounded"></div></td>
                  <td><div className="h-4 w-16 bg-slate-800 rounded"></div></td>
                </tr>
              ))
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition"
                >
                  <td className="py-4 px-2 text-slate-300">
                    {new Date(tx.executed_at).toISOString().split("T")[0]}
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor(tx.type)}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="font-medium">{tx.symbol}</td>
                  <td>{tx.quantity || "-"}</td>
                  
                  {/* FE Dev 1: Requirement p. 3 - Added Live Pulse Indicator next to Price */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">₹ {tx.price?.toLocaleString('en-IN') || "-"}</span>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    </div>
                  </td>

                  <td className="text-slate-400">₹ {tx.fees || "0"}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-red-400 hover:text-red-300 transition text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FE Dev 1: Requirement p. 4 - Data freshness timestamp */}
      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
          {lastUpdated ? `Sync Reference: ${new Date(lastUpdated).toLocaleTimeString()}` : "Waiting for sync..."}
        </p>
      </div>
    </div>
  );
}

export default TransactionManagement;