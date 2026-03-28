import React, { useEffect, useState } from "react";
import API from "../services/api";
import TransactionsTable from "../components/TransactionsTable";

function Transactions() {

  const [transactions, setTransactions] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [formData, setFormData] = useState({
    type: "",
    quantity: "",
    price: "",
    investment_id: ""
  });

  const [editId, setEditId] = useState(null);

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions/");
      setTransactions(res.data || []);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        window.location.href = "/login";
      } else {
        console.error("Failed to fetch transactions", err);
      }
    }
  };

  const fetchInvestments = async () => {
    try {
      const res = await API.get("/investments/");
      setInvestments(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        window.location.href = "/login";
      } else {
        console.error("Failed to fetch investments", err);
      }
    }
  };

  useEffect(() => {
    fetchInvestments();
    fetchTransactions();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const createTransaction = async (e) => {
    e.preventDefault();
    try {
      await API.post("/transactions/", formData);
      resetForm();
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTransaction = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/transactions/${editId}`, formData);
      resetForm();
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };


  const handleEdit = (tx) => {

    setEditId(tx.id);

    setFormData({
      symbol: tx.symbol,
      type: tx.type,
      quantity: tx.quantity,
      price: tx.price,
      investment_id: tx.investment_id
    });

  };

  const resetForm = () => {

    setEditId(null);

    setFormData({
      symbol: "",
      type: "",
      quantity: "",
      price: "",
      investment_id: ""
    });

  };

  return (

    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">

      <h1 className="text-3xl font-bold mb-6">
        Transactions
      </h1>

      <form
        onSubmit={editId ? updateTransaction : createTransaction}
        className="bg-white p-6 rounded-xl shadow mb-8"
      >

        <div className="grid grid-cols-2 gap-4">

          <select
            name="investment_id"
            value={formData.investment_id}
            onChange={handleChange}
            className="border p-2 rounded"
            required
>
          <option value="">Select Investment</option>

            {investments.map(inv => (

            <option key={inv.id} value={inv.id}>
            {inv.symbol}
            </option>

            ))}

          </select>

          {/* <input
            name="symbol"
            placeholder="Symbol"
            value={formData.symbol}
            onChange={handleChange}
            className="border p-2 rounded"
          /> */}

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Type</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
            <option value="dividend">Dividend</option>
          </select>

          <input
            name="quantity"
            type="number"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="price"
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="border p-2 rounded"
          />

        </div>

        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? "Update Transaction" : "Create Transaction"}
        </button>

      </form>

      <TransactionsTable
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={deleteTransaction}
      />

    </div>

  );

}

export default Transactions; 