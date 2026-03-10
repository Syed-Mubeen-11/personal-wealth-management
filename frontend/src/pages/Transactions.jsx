import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getTransactions, addTransaction } from '../services/transactionService';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // State for the new trade form
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'buy',
    quantity: '',
    price: '',
    fees: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mapping to your TransactionCreate schema
      const payload = {
        symbol: formData.symbol.toUpperCase(),
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        fees: parseFloat(formData.fees || 0)
      };

      await addTransaction(payload);
      
      // Reset form and refresh list
      setFormData({ symbol: '', type: 'buy', quantity: '', price: '', fees: 0 });
      setShowForm(false);
      loadData(); 
    } catch (err) {
      alert("Failed to add transaction. Please check your inputs.");
      console.error(err);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Trade History</h1>
            <p className="text-gray-500 text-sm">Review and log your investment activities</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`${showForm ? 'bg-gray-500' : 'bg-indigo-600'} text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md hover:opacity-90`}
          >
            {showForm ? 'Cancel' : '+ New Trade'}
          </button>
        </header>

        {/* Add Transaction Form Section */}
        {showForm && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 mb-8 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold text-gray-700 mb-4">Log New Investment</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">SYMBOL</label>
                    <input 
                    type="text" 
                    placeholder="e.g. TCS" 
                    required 
                    className="w-full border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.symbol} 
                    onChange={(e) => setFormData({...formData, symbol: e.target.value})} 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">TYPE</label>
                    <select 
                    className="w-full border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                    <option value="buy">BUY</option>
                    <option value="sell">SELL</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">QUANTITY</label>
                    <input 
                    type="number" 
                    step="any" 
                    required 
                    className="w-full border border-gray-200 p-2 rounded-lg" 
                    value={formData.quantity} 
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">PRICE</label>
                    <input 
                    type="number" 
                    step="any" 
                    required 
                    className="w-full border border-gray-200 p-2 rounded-lg" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    />
                </div>
                {/* NEW FEES INPUT FIELD */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">FEES (GST/Brokerage)</label>
                    <input 
                    type="number" 
                    step="any" 
                    className="w-full border border-gray-200 p-2 rounded-lg" 
                    value={formData.fees} 
                    onChange={(e) => setFormData({...formData, fees: e.target.value})} 
                    />
                </div>
                <button 
                    type="submit" 
                    className="bg-green-600 text-white p-2.5 rounded-lg font-bold hover:bg-green-700 transition shadow-sm"
                >
                    Save Trade
                </button>
                </form>
            </div>
            )}

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading your trades...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Symbol</th>
                  <th className="p-4 font-semibold text-gray-600">Type</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Qty</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Price</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Fees</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-indigo-600 uppercase">{t.symbol}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        t.type.toLowerCase() === 'buy' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-gray-700">{t.quantity}</td>
                    <td className="p-4 text-right text-gray-800 font-medium">₹{t.price.toLocaleString()}</td>
                    <td className="p-4 text-right text-gray-400 text-sm">₹{t.fees}</td>
                    <td className="p-4 text-right font-bold text-slate-900">
                      ₹{((t.quantity * t.price) + t.fees).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-400 italic">
                      No trades logged yet. Click "+ New Trade" to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Transactions;