import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function TransactionManagement() {

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this transaction?")) return;

    try {

      await api.delete(`/transactions/${id}`);

      setTransactions(
        transactions.filter((tx) => tx.id !== id)
      );

    } catch (err) {
      alert("Error deleting transaction");
      console.error(err);
    }
  };

  const badgeColor = (type) => {

    switch (type) {

      case "buy":
        return "bg-green-500/20 text-green-400";

      case "sell":
        return "bg-red-500/20 text-red-400";

      case "dividend":
        return "bg-blue-500/20 text-blue-400";

      case "contribution":
        return "bg-purple-500/20 text-purple-400";

      case "withdrawal":
        return "bg-yellow-500/20 text-yellow-400";

      default:
        return "bg-gray-500/20 text-gray-400";
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
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition"
        >
          + Add Transaction
        </Link>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full text-left">

          <thead className="border-b border-slate-700 text-slate-400">

            <tr>
              <th className="py-3">Date</th>
              <th>Type</th>
              <th>Asset</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Fees</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {transactions.map((tx) => (

              <tr
                key={tx.id}
                className="border-b border-slate-800 hover:bg-slate-800/50 transition"
              >

                <td className="py-4">
                  {new Date(tx.executed_at).toISOString().split("T")[0]}
                </td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${badgeColor(
                      tx.type
                    )}`}
                  >
                    {tx.type}
                  </span>
                </td>

                <td>{tx.symbol}</td>

                <td>{tx.quantity || "-"}</td>

                <td>₹ {tx.price || "-"}</td>

                <td>₹ {tx.fees || "-"}</td>

                <td>

                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}

export default TransactionManagement;