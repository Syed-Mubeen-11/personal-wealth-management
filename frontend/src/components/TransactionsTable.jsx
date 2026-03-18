import React from "react";

function TransactionsTable({ transactions = [], onEdit, onDelete, showActions = true }) {

  return (

    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">

      <h2 className="text-xl font-bold mb-4">
        Transactions
      </h2>

      <table className="w-full border">

        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Symbol</th>
            <th className="p-2">Type</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Price</th>
            <th className="p-2">Date</th>
            {showActions && <th className="p-2">Actions</th>}
          </tr>
        </thead>

        <tbody>

          {transactions.map(tx => (

            <tr key={tx.id} className="text-center border-t">

              <td>{tx.symbol}</td>
              <td>{tx.type}</td>
              <td>{tx.quantity}</td>
              <td>₹{tx.price}</td>
              <td>{new Date(tx.executed_at).toLocaleDateString()}</td>

              {showActions && (
                <td className="space-x-2">

                  <button
                    onClick={() => onEdit(tx)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(tx.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>

                </td>
              )}

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}

export default TransactionsTable; 