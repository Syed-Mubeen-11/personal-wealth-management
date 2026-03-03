import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Portfolio = () => {
  // --- Portfolio Overview ---
  const [portfolioValue] = useState(50000);
  const [performanceToday] = useState(1200);
  const [overallGainLoss] = useState(7000);
  const [totalCostBasis] = useState(43000);

  const assetAllocationData = [
    { name: "Stocks", value: 25000 },
    { name: "Bonds", value: 10000 },
    { name: "Mutual Funds", value: 10000 },
    { name: "Cash", value: 5000 },
  ];
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

  // --- Current Positions ---
  const initialPositions = [
    { id: 1, symbol: "AAPL", quantity: 10, price: 150, value: 1500 },
    { id: 2, symbol: "GOOGL", quantity: 5, price: 260, value: 1300 },
    { id: 3, symbol: "TSLA", quantity: 2, price: 600, value: 1200 },
    { id: 4, symbol: "AMZN", quantity: 1, price: 3300, value: 3300 },
    { id: 5, symbol: "MSFT", quantity: 3, price: 300, value: 900 },
  ];

  const [positions] = useState(initialPositions);
  const pageSize = 3;
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(positions.length / pageSize);

  const handlePrevious = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };
  const paginatedPositions = positions.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  // --- Transaction Management ---
  const [transactions, setTransactions] = useState([
    { id: 1, type: "Buy", symbol: "AAPL", quantity: 5, price: 150, date: "2026-02-01" },
    { id: 2, type: "Sell", symbol: "GOOGL", quantity: 2, price: 260, date: "2026-02-02" },
  ]);

  const [transactionForm, setTransactionForm] = useState({ type: "", symbol: "", quantity: "", price: "", date: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filteredTransactions = transactions.filter(
    (t) =>
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTransaction = () => {
    setShowForm(true);
  };

  const handleCancel = () => {
    setTransactionForm({ type: "", symbol: "", quantity: "", price: "", date: "" });
    setShowForm(false);
  };

  const handleSave = () => {
    const newTransaction = {
      id: transactions.length + 1,
      ...transactionForm,
    };
    setTransactions([...transactions, newTransaction]);
    handleCancel();
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Overview */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-purple-700 mb-2">Portfolio Overview</h2>
        <p className="text-gray-700 mb-4">A summary of your current investment portfolio</p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-500">Total Portfolio Value</p>
            <p className="text-2xl font-bold">₹{portfolioValue}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-500">Performance Today</p>
            <p className="text-2xl font-bold">₹{performanceToday}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-500">Overall Gain/Loss</p>
            <p className="text-2xl font-bold">₹{overallGainLoss}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-500">Total Cost Basis</p>
            <p className="text-2xl font-bold">₹{totalCostBasis}</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={assetAllocationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {assetAllocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current Positions */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-purple-700 mb-2">Current Positions</h2>
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Symbol</th>
              <th className="border px-4 py-2">Quantity</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPositions.map((pos) => (
              <tr key={pos.id}>
                <td className="border px-4 py-2">{pos.symbol}</td>
                <td className="border px-4 py-2">{pos.quantity}</td>
                <td className="border px-4 py-2">₹{pos.price}</td>
                <td className="border px-4 py-2">₹{pos.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-purple-700 text-white hover:bg-purple-800"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className={`px-4 py-2 rounded-lg ${
              currentPage === totalPages - 1 ? "bg-gray-300 cursor-not-allowed" : "bg-purple-700 text-white hover:bg-purple-800"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Transaction Management */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-purple-700 mb-2">Transaction Management</h2>
        <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-2">
          <button onClick={handleAddTransaction} className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800">
            Add Transaction
          </button>
          <button className="px-4 py-2 bg-gray-300 text-black rounded-lg">All Transactions</button>
          <input
            type="text"
            placeholder="Search transaction..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded-lg w-full md:w-64"
          />
        </div>

        {/* Transaction Table */}
        <table className="min-w-full border-collapse border border-gray-200 mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Symbol</th>
              <th className="border px-4 py-2">Quantity</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id}>
                <td className="border px-4 py-2">{t.type}</td>
                <td className="border px-4 py-2">{t.symbol}</td>
                <td className="border px-4 py-2">{t.quantity}</td>
                <td className="border px-4 py-2">₹{t.price}</td>
                <td className="border px-4 py-2">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add Transaction Form */}
        {showForm && (
          <div className="bg-gray-100 p-4 rounded-lg space-y-2">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Type (Buy/Sell)"
                value={transactionForm.type}
                onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
                className="border p-2 rounded-lg"
              />
              <input
                type="text"
                placeholder="Symbol"
                value={transactionForm.symbol}
                onChange={(e) => setTransactionForm({ ...transactionForm, symbol: e.target.value })}
                className="border p-2 rounded-lg"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={transactionForm.quantity}
                onChange={(e) => setTransactionForm({ ...transactionForm, quantity: e.target.value })}
                className="border p-2 rounded-lg"
              />
              <input
                type="number"
                placeholder="Price"
                value={transactionForm.price}
                onChange={(e) => setTransactionForm({ ...transactionForm, price: e.target.value })}
                className="border p-2 rounded-lg"
              />
              <input
                type="date"
                placeholder="Date"
                value={transactionForm.date}
                onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                className="border p-2 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;