import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getPortfolio, addInvestment, deleteInvestment } from '../services/investmentService';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    asset_type: 'Stock',
    symbol: '',
    units: '',
    avg_buy_price: ''
  });

  const fetchPortfolio = async () => {
    try {
      setFetchLoading(true);
      const response = await getPortfolio();
      console.log("Debug - Portfolio API Response:", response);

      // Handle both flat arrays and nested summary objects
      if (Array.isArray(response)) {
        setInvestments(response);
      } else if (response && typeof response === 'object') {
        // Look for common keys if it's a summary object
        const list = response.investments || response.assets || response.data || [];
        setInvestments(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // FIXED: handleSubmit defined properly inside the component
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        asset_type: formData.asset_type,
        symbol: formData.symbol,
        units: parseFloat(formData.units),
        avg_buy_price: parseFloat(formData.avg_buy_price)
      };
      
      await addInvestment(payload);
      setFormData({ asset_type: 'Stock', symbol: '', units: '', avg_buy_price: '' });
      await fetchPortfolio(); // Refresh the table
      alert("Investment added successfully!");
    } catch (err) {
      alert("Error adding investment: " + String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this asset?")) {
      try {
        await deleteInvestment(id);
        fetchPortfolio();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Investment Portfolio</h1>

        {/* Form Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase mb-4">Add New Asset</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select 
              className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.asset_type}
              onChange={(e) => setFormData({...formData, asset_type: e.target.value})}
            >
              <option value="Stock">Stock</option>
              <option value="Crypto">Crypto</option>
              <option value="Gold">Gold</option>
              <option value="Mutual Fund">Mutual Fund</option>
            </select>
            <input 
              type="text" placeholder="Symbol (e.g. AAPL)" required
              className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.symbol}
              onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
            />
            <input 
              type="number" placeholder="Units" step="any" required
              className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.units}
              onChange={(e) => setFormData({...formData, units: e.target.value})}
            />
            <input 
              type="number" placeholder="Avg Price" step="any" required
              className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.avg_buy_price}
              onChange={(e) => setFormData({...formData, avg_buy_price: e.target.value})}
            />
            <button 
              disabled={loading} 
              type="submit"
              className="bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Add Asset'}
            </button>
          </form>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {fetchLoading ? (
            <div className="p-10 text-center text-gray-500">Loading your portfolio...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Asset</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Qty</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Cost Basis</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Current Value</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{inv.symbol}</div>
                      <div className="text-xs text-gray-400">{inv.asset_type}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{inv.units}</td>
                    <td className="px-6 py-4 text-gray-600">₹{Number(inv.cost_basis).toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">₹{Number(inv.current_value).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(inv.id)} className="text-red-400 hover:text-red-600 font-medium">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {investments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic">
                      No investments found. Add your first asset above!
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

export default Investments;