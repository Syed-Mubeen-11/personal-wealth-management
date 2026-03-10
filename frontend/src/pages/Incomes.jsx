import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getIncomes, addIncome, deleteIncome } from '../services/incomeService';

const Incomes = () => {
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({ source: '', amount: '' });
  const [loading, setLoading] = useState(false);

  const fetchIncomes = async () => {
    try {
      const data = await getIncomes();
      setIncomes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addIncome({ 
        source: formData.source, 
        amount: parseInt(formData.amount) 
      });
      setFormData({ source: '', amount: '' });
      fetchIncomes(); // Refresh list
    } catch (err) {
      alert("Error adding income");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this income entry?")) {
      try {
        await deleteIncome(id);
        fetchIncomes();
      } catch (err) {
        alert("Error deleting");
      }
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Income</h1>

        {/* Add Income Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Add New Source</h2>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Source (e.g. Salary, Freelance)"
              className="flex-grow px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Amount (₹)"
              className="w-full md:w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <button
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
            >
              {loading ? 'Adding...' : 'Add Income'}
            </button>
          </form>
        </div>

        {/* Income Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Source</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {incomes.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-800 font-medium">{item.source}</td>
                  <td className="px-6 py-4 text-green-600 font-bold">₹{item.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {incomes.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-400">No income records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Incomes;