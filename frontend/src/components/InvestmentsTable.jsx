import React from "react";

function InvestmentsTable({ investments, onEdit, onDelete, fetchInvestments }) {

  // refresh button (calls backend)
  const refreshPrice = async () => {
    try {
      await fetch("http://localhost:8000/investments/refresh-prices", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      fetchInvestments();

    } catch (error) {
      console.error("Refresh failed", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-bold mb-4">
        Investments
      </h2>

      <table className="w-full">

        <thead>
          <tr className="border-b">
            <th>Symbol</th>
            <th>Units</th>
            <th>Buy Price</th>
            <th>Cost Basis</th>
            <th>Live Price</th>
            <th>Value</th>
            <th>P/L</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {investments.map(inv => {

            const livePrice = inv.last_price || 0;

            const costBasis = inv.units * inv.avg_buy_price;

            const value = inv.current_value || 0;

            const profitLoss = value - costBasis;

            return (
              <tr key={inv.id} className="border-b">

                <td>{inv.symbol}</td>
                <td>{inv.units}</td>
                <td>₹{inv.avg_buy_price}</td>
                <td>₹{costBasis.toFixed(2)}</td>

                <td>₹{livePrice.toFixed(2)}</td>

                <td>₹{value.toFixed(2)}</td>

                <td className={profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
                  ₹{profitLoss.toFixed(2)}
                </td>

                <td className="flex gap-2">

                  <button
                    onClick={() => onEdit(inv)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(inv.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
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
  );
}

export default InvestmentsTable;