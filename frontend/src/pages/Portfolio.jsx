import React, { useEffect, useState } from "react";
import API from "../services/api";
import PortfolioSummary from "../components/PortfolioSummary";
import InvestmentsTable from "../components/InvestmentsTable";
import StockSearch from "../components/StockSearch";
import RebalanceDrawer from "../components/RebalanceDrawer";

function Portfolio() {

  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRebalanceDrawerOpen, setIsRebalanceDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    asset_type: "",
    units: "",
    avg_buy_price: ""
  });

  const [editId, setEditId] = useState(null);

  // ✅ Fetch investments
  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const res = await API.get("/investments/");
      setInvestments(res.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      if (err.response && err.response.status === 401) {
        window.location.href = "/login";
      } else {
        console.error("Failed to fetch investments", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  // ✅ Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  const createInvestment = async (e) => {
    e.preventDefault();

    if (!formData.symbol || !formData.asset_type) {
      alert("Please select stock and asset type");
      return;
    }

    try {
      await API.post("/investments/", {
        symbol: formData.symbol,
        asset_type: formData.asset_type,
        units: Number(formData.units),
        avg_buy_price: Number(formData.avg_buy_price)
      });

      resetForm();
      fetchInvestments();

    } catch (err) {
      console.log("BACKEND ERROR 👉", err.response?.data);
    }
  };

  // ✅ Update investment
  const updateInvestment = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/investments/${editId}`, formData);
      resetForm();
      fetchInvestments();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Delete
  const deleteInvestment = async (id) => {
    try {
      await API.delete(`/investments/${id}`);
      fetchInvestments();
    } catch (err) {
      console.error(err);
    }
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
      await API.post("/investments/refresh-prices");
      alert("Refreshing prices in background...");

      // wait a bit and refetch
      setTimeout(fetchInvestments, 3000);

    } catch (err) {
      console.error("Refresh failed", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-lg">Loading live market data...</p>
      </div>
    );
  }
  return (

    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">

      <h1 className="text-3xl font-bold mb-6">
        Portfolio Dashboard
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Last Updated: {lastUpdated?.toLocaleTimeString()}
      </p>

      {/* ✅ Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={refreshPrices}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Refresh Prices
        </button>
        <button
          onClick={() => setIsRebalanceDrawerOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Rebalance Portfolio
        </button>
      </div>

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

          {["stock", "etf", "mutual_fund"].includes(formData.asset_type) ? (
            <StockSearch
              assetType={formData.asset_type}
              onChange={(symbol) => setFormData((prev) => ({ ...prev, symbol }))}
              onSelect={(stock) =>
                setFormData((prev) => ({
                  ...prev,
                  symbol: stock.symbol,
                  avg_buy_price: stock.price || prev.avg_buy_price
                }))
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

      <InvestmentsTable
        investments={investments}
        onEdit={handleEdit}
        onDelete={deleteInvestment}
        fetchInvestments={fetchInvestments}
      />

      {/* Rebalance Drawer */}
      <RebalanceDrawer
        isOpen={isRebalanceDrawerOpen}
        onClose={() => setIsRebalanceDrawerOpen(false)}
      />

    </div>
  );
  
}

export default Portfolio;