import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Portfolio = () => {
  // --- Portfolio Overview Data ---
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
  const COLORS = ["#7e22ce", "#a855f7", "#c084fc", "#e9d5ff"];

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

  const paginatedPositions = positions.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  // --- Transaction Management ---
  const [transactions, setTransactions] = useState([
    { id: 1, type: "Buy", symbol: "AAPL", quantity: 5, price: 150, date: "2026-02-01" },
    { id: 2, type: "Sell", symbol: "GOOGL", quantity: 2, price: 260, date: "2026-02-02" },
  ]);

  const [transactionForm, setTransactionForm] = useState({ type: "Buy", symbol: "", quantity: "", price: "", date: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filteredTransactions = transactions.filter(
    (t) =>
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (!transactionForm.symbol || !transactionForm.quantity) return alert("Please fill details");
    const newTransaction = { id: transactions.length + 1, ...transactionForm };
    setTransactions([...transactions, newTransaction]);
    setTransactionForm({ type: "Buy", symbol: "", quantity: "", price: "", date: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Portfolio Overview Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-purple-800 mb-6">Portfolio Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Value", val: `₹${portfolioValue}`, color: "text-purple-700" },
            { label: "Today's Change", val: `+₹${performanceToday}`, color: "text-green-600" },
            { label: "Overall Gain", val: `₹${overallGainLoss}`, color: "text-blue-600" },
            { label: "Cost Basis", val: `₹${totalCostBasis}`, color: "text-gray-700" },
          ].map((item) => (
            <div key={item.label} className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">{item.label}</p>
              <p className={`text-xl font-bold ${item.color}`}>{item.val}</p>
            </div>
          ))}
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={assetAllocationData}
                dataKey="value"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
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

      {/* Current Positions Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Current Positions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-400 text-sm uppercase">
                <th className="pb-2 pl-2">Symbol</th>
                <th className="pb-2">Quantity</th>
                <th className="pb-2">Price</th>
                <th className="pb-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPositions.map((pos) => (
                <tr key={pos.id} className="bg-gray-50 hover:bg-purple-50 transition-colors">
                  <td className="py-3 pl-4 rounded-l-xl font-bold text-purple-700">{pos.symbol}</td>
                  <td className="py-3">{pos.quantity}</td>
                  <td className="py-3 text-gray-600">₹{pos.price}</td>
                  <td className="py-3 rounded-r-xl font-semibold">₹{pos.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button 
            disabled={currentPage === 0} 
            onClick={() => setCurrentPage(v => v - 1)}
            className="px-4 py-1.5 text-sm bg-gray-100 rounded-lg disabled:opacity-50"
          >
            Prev
          </button>
          <button 
            disabled={currentPage === totalPages - 1} 
            onClick={() => setCurrentPage(v => v + 1)}
            className="px-4 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Transaction Management */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Transactions</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-400 outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              onClick={() => setShowForm(true)}
              className="bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-800"
            >
              + Add
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-purple-50 rounded-2xl border border-purple-100 grid grid-cols-2 md:grid-cols-5 gap-3">
            <select 
              className="p-2 rounded-lg border bg-white"
              value={transactionForm.type}
              onChange={e => setTransactionForm({...transactionForm, type: e.target.value})}
            >
              <option>Buy</option>
              <option>Sell</option>
            </select>
            <input type="text" placeholder="Symbol" className="p-2 rounded-lg border" onChange={e => setTransactionForm({...transactionForm, symbol: e.target.value})} />
            <input type="number" placeholder="Qty" className="p-2 rounded-lg border" onChange={e => setTransactionForm({...transactionForm, quantity: e.target.value})} />
            <input type="number" placeholder="Price" className="p-2 rounded-lg border" onChange={e => setTransactionForm({...transactionForm, price: e.target.value})} />
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 bg-purple-700 text-white rounded-lg font-bold">Save</button>
              <button onClick={() => setShowForm(false)} className="px-3 bg-gray-200 rounded-lg">X</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-gray-400 text-xs uppercase border-b">
              <tr>
                <th className="py-2">Type</th>
                <th className="py-2">Symbol</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Price</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="text-sm">
                  <td className={`py-4 font-bold ${t.type === 'Buy' ? 'text-green-600' : 'text-red-500'}`}>{t.type}</td>
                  <td className="py-4 font-semibold">{t.symbol}</td>
                  <td className="py-4">{t.quantity}</td>
                  <td className="py-4">₹{t.price}</td>
                  <td className="py-4 text-gray-500">{t.date}</td>
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