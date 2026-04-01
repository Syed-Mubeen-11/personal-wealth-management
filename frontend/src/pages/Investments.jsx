import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getPortfolio, addInvestment, deleteInvestment } from '../services/investmentService';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    asset_type: 'Stock', // Default value
    symbol: '',
    units: '',
    avg_buy_price: '',
    trade_type: 'buy', 
    fees: 0
  });

  const fetchPortfolio = async () => {
    try {
      setFetchLoading(true);
      const response = await getPortfolio();
      
      if (Array.isArray(response)) {
        setInvestments(response);
      } else if (response && typeof response === 'object') {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        asset_type: formData.asset_type,
        symbol: formData.symbol.toUpperCase(),
        units: parseFloat(formData.units),
        avg_buy_price: parseFloat(formData.avg_buy_price),
        trade_type: formData.trade_type,
        fees: parseFloat(formData.fees || 0)
      };
      
      await addInvestment(payload);
      
      // Reset form but keep preference for asset_type and trade_type
      setFormData({ ...formData, symbol: '', units: '', avg_buy_price: '', fees: 0 });
      await fetchPortfolio(); 
      alert(`${payload.trade_type.toUpperCase()} order successful!`);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || String(err);
      alert("Trade Failed: " + errorMsg);
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase">Manage Assets</h2>
            
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setFormData({...formData, trade_type: 'buy'})}
                className={`px-4 py-1 rounded-lg text-xs font-bold transition ${formData.trade_type === 'buy' ? 'bg-green-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
              >BUY</button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, trade_type: 'sell'})}
                className={`px-4 py-1 rounded-lg text-xs font-bold transition ${formData.trade_type === 'sell' ? 'bg-red-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
              >SELL</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* FIXED SELECT DROPDOWN */}
            <select 
              className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={formData.asset_type}
              onChange={(e) => setFormData({...formData, asset_type: e.target.value})}
            >
              <option value="Stock">Stock</option>
              <option value="ETF">ETF (Equity/Gold)</option>
              <option value="Bond">Bond / Debt</option>
              <option value="Crypto">Crypto</option>
              <option value="Gold">Physical Gold</option>
              <option value="Mutual Fund">Mutual Fund</option>
            </select>

            <input 
              type="text" placeholder="Symbol (e.g. INFY.NS)" required
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
              type="number" placeholder="Price" step="any" required
              className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.avg_buy_price}
              onChange={(e) => setFormData({...formData, avg_buy_price: e.target.value})}
            />

            <input 
              type="number" 
              placeholder="Fees (Optional)" 
              step="any"
              className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.fees === 0 ? '' : formData.fees}
              onChange={(e) => setFormData({...formData, fees: e.target.value})}
            />

            <button 
              disabled={loading} 
              type="submit"
              className={`font-bold rounded-lg text-white transition disabled:bg-gray-400 ${
                formData.trade_type === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Processing...' : formData.trade_type === 'buy' ? 'Add Units' : 'Sell Units'}
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Avg Price</th>
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
                    <td className="px-6 py-4 text-gray-600">₹{Number(inv.avg_buy_price).toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">₹{Number(inv.current_value || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setFormData({
                            ...formData,
                            symbol: inv.symbol,
                            asset_type: inv.asset_type,
                            trade_type: 'sell'
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-medium mr-4"
                      >
                        Trade
                      </button>
                      <button onClick={() => handleDelete(inv.id)} className="text-red-300 hover:text-red-600 font-medium">
                        Delete
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