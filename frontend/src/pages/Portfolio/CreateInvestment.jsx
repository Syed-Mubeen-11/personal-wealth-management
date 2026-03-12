import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function CreateInvestment() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    asset_type: "",
    symbol: "",
    units: "",
    avg_buy_price: "",
    last_price: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/investments", formData);

      navigate("/portfolio");
    } catch (err) {
      alert("Error creating investment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-white">

      <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Add Investment
      </h1>

      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 max-w-2xl">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Asset Type */}
          <select
            name="asset_type"
            required
            value={formData.asset_type}
            onChange={handleChange}
            className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
            >
            <option value="">Select Asset Type</option>
            <option value="stock">Stock</option>
            <option value="etf">ETF</option>
            <option value="crypto">Crypto</option>
            <option value="mutual_fund">Mutual Fund</option>
          </select>

          {/* Symbol */}
          <div>
            <label className="block text-slate-400 mb-2">
              Symbol
            </label>
            <input
              type="text"
              name="symbol"
              required
              placeholder="e.g. AAPL"
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Units */}
          <div>
            <label className="block text-slate-400 mb-2">
              Units
            </label>
            <input
              type="number"
              name="units"
              required
              placeholder="Enter number of units"
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Avg Buy Price */}
          <div>
            <label className="block text-slate-400 mb-2">
              Average Buy Price
            </label>
            <input
              type="number"
              name="avg_buy_price"
              required
              placeholder="Enter buy price"
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Last Price */}
          <div>
            <label className="block text-slate-400 mb-2">
              Current Price
            </label>
            <input
              type="number"
              name="last_price"
              required
              placeholder="Enter current price"
              className="w-full bg-transparent border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-purple-600 to-indigo-600 py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 transition"
          >
            {loading ? "Adding..." : "Add Investment"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateInvestment;