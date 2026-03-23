import React, { useEffect, useState } from "react";
import axios from "axios";
import PortfolioSummary from "../components/PortfolioSummary";
import InvestmentsTable from "../components/InvestmentsTable";
import StockSearch from "../components/StockSearch";

function Portfolio() {

  const [investments, setInvestments] = useState([]);

  const [formData, setFormData] = useState({
    symbol: "",
    asset_type: "",
    units: "",
    avg_buy_price: ""
  });

  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  // ✅ Fetch investments
  const fetchInvestments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/investments/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInvestments(res.data || []);
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
  }, []);

  // ✅ Handle form input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const createInvestment = async (e) => {
  e.preventDefault();

  if (!formData.symbol || !formData.asset_type) {
    alert("Please select stock and asset type");
    return;
  }

  try {
    await axios.post(
      "http://localhost:8000/investments/",
      {
        symbol: formData.symbol,
        asset_type: formData.asset_type,
        units: Number(formData.units),
        avg_buy_price: Number(formData.avg_buy_price)
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    resetForm();
    fetchInvestments();

  } catch (err) {
    console.log("BACKEND ERROR 👉", err.response?.data);
  }
  };

  // ✅ Update investment
  const updateInvestment = async (e) => {
    e.preventDefault();

    await axios.put(
      `http://localhost:8000/investments/${editId}`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    resetForm();
    fetchInvestments();
  };

  // ✅ Delete
  const deleteInvestment = async (id) => {
    await axios.delete(
      `http://localhost:8000/investments/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchInvestments();
  };

  const handleEdit = (inv) => {
    setEditId(inv.id);

    setFormData({
      symbol: inv.symbol,
      asset_type: inv.asset_type,
      units: inv.units,
      avg_buy_price: inv.avg_buy_price
    });
  };

  const resetForm = () => {
    setEditId(null);

    setFormData({
      symbol: "",
      asset_type: "",
      units: "",
      avg_buy_price: ""
    });
  };

  // ✅ NEW: Refresh Prices (Celery)
  const refreshPrices = async () => {
    try {
      await axios.post(
        "http://localhost:8000/investments/refresh-prices",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Refreshing prices in background...");

      // wait a bit and refetch
      setTimeout(fetchInvestments, 3000);

    } catch (err) {
      console.error("Refresh failed", err);
    }
  };

  return (

    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">

      <h1 className="text-3xl font-bold mb-6">
        Portfolio Dashboard
      </h1>

      {/* ✅ Refresh Button */}
      <button
        onClick={refreshPrices}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
      >
        Refresh Prices
      </button>

      <PortfolioSummary investments={investments} />

      {/* FORM */}
      <form
        onSubmit={editId ? updateInvestment : createInvestment}
        className="bg-white p-6 rounded-xl shadow mb-8"
      >

        <h2 className="text-xl font-bold mb-4">
          {editId ? "Update Investment" : "Create Investment"}
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <select
            name="asset_type"
            value={formData.asset_type}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Asset Type</option>
            <option value="stock">Stock</option>
            <option value="etf">ETF</option>
            <option value="mutual_fund">Mutual Fund</option>
            <option value="bond">Bond</option>
            <option value="cash">Cash</option>
          </select>

          {(formData.asset_type === "stock" || formData.asset_type === "etf") ? (
            <StockSearch
              onSelect={(stock) =>
                setFormData({
                  ...formData,
                  symbol: stock.symbol,
                  avg_buy_price: stock.price   // 🔥 AUTO FILL
                })
              }
            />
          ) : (
            <input
              name="symbol"
              placeholder="Symbol / Name"
              value={formData.symbol}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
          )}

          <input
            name="units"
            type="number"
            placeholder="Units"
            value={formData.units}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

          <input
            name="avg_buy_price"
            type="number"
            placeholder="Buy Price"
            value={formData.avg_buy_price}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

        </div>

        <div className="flex gap-3 mt-4">

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            {editId ? "Update" : "Create"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}

        </div>

      </form>

      {/* ❌ REMOVED StockPrice */}
      

      <InvestmentsTable
        investments={investments}
        onEdit={handleEdit}
        onDelete={deleteInvestment}
        fetchInvestments={fetchInvestments}
      />

    </div>
  );
  
}

export default Portfolio;