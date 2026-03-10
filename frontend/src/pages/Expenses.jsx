import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getExpenses, addExpense, deleteExpense } from '../services/expenseService';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ category: 'Food', amount: '', description: '' });

  const categories = ['Food', 'Rent', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Others'];

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addExpense({ ...formData, amount: parseInt(formData.amount) });
      setFormData({ category: 'Food', amount: '', description: '' });
      fetchExpenses();
    } catch (err) { alert("Failed to add expense"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this expense?")) {
      await deleteExpense(id);
      fetchExpenses();
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Expense Tracking</h1>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select 
              className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input 
              type="number" placeholder="Amount" required
              className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
            <input 
              type="text" placeholder="Description (Optional)"
              className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <button disabled={loading} className="bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition">
              {loading ? 'Saving...' : 'Add Expense'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase">{exp.category}</span></td>
                  <td className="px-6 py-4 text-gray-600">{exp.description || '-'}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800">₹{exp.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleDelete(exp.id)} className="text-red-400 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Expenses;