import React from "react";

function InvestmentsTable({ investments = [], onEdit, onDelete }) {

  return (

    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">

      <h2 className="text-xl font-bold mb-4">
        Portfolio Positions
      </h2>

      <table className="w-full border">

        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Symbol</th>
            <th className="p-2">Asset Type</th>
            <th className="p-2">Units</th>
            <th className="p-2">Avg Price</th>
            <th className="p-2">Cost Basis</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>

          {investments.map(inv => {

            const cost = inv.units * inv.avg_buy_price;

            return (

              <tr key={inv.id} className="text-center border-t">

                <td>{inv.symbol}</td>
                <td>{inv.asset_type}</td>
                <td>{inv.units}</td>
                <td>₹{inv.avg_buy_price}</td>
                <td>₹{cost}</td>

                <td className="space-x-2">

                  <button
                    onClick={() => onEdit(inv)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(inv.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
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