import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import PortfolioSummary from "../components/PortfolioSummary";
import InvestmentsTable from "../components/InvestmentsTable";
import StockSearch from "../components/StockSearch";
import RebalanceDrawer from "../components/RebalanceDrawer";
import { ThemeContext } from "../context/Themecontext";

function Portfolio() {
  const { darkMode: dark } = useContext(ThemeContext);

  const [investments, setInvestments]                     = useState([]);
  const [loading, setLoading]                             = useState(true);
  const [refreshing, setRefreshing]                       = useState(false);
  const [submitting, setSubmitting]                       = useState(false);
  const [lastUpdated, setLastUpdated]                     = useState(null);
  const [isRebalanceDrawerOpen, setIsRebalanceDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "", asset_type: "", units: "", avg_buy_price: ""
  });
  const [editId, setEditId] = useState(null);
  const [toast, setToast]   = useState(null); // { msg, type: 'success'|'error' }

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch investments ────────────────────────────────────────────────────────
  const fetchInvestments = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await API.get("/investments/");
      setInvestments(res.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = "/login";
      } else {
        console.error("Failed to fetch investments", err);
        if (!silent) showToast("Failed to load investments", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvestments(); }, []);

  // ── Form handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createInvestment = async (e) => {
    e.preventDefault();
    if (!formData.symbol || !formData.asset_type) {
      showToast("Please select an asset type and symbol", "error");
      return;
    }
    setSubmitting(true);
    try {
      await API.post("/investments/", {
        symbol:        formData.symbol,
        asset_type:    formData.asset_type,
        units:         Number(formData.units),
        avg_buy_price: Number(formData.avg_buy_price),
      });
      resetForm();
      fetchInvestments(true);
      showToast("Investment added successfully!");
    } catch (err) {
      console.error("Create failed:", err.response?.data);
      showToast(err.response?.data?.detail || "Failed to create investment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const updateInvestment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`/investments/${editId}`, formData);
      resetForm();
      fetchInvestments(true);
      showToast("Investment updated!");
    } catch (err) {
      console.error(err);
      showToast("Failed to update investment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteInvestment = async (id) => {
    try {
      await API.delete(`/investments/${id}`);
      fetchInvestments(true);
      showToast("Investment removed");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete investment", "error");
    }
  };

  const handleEdit = (inv) => {
    setEditId(inv.id);
    setFormData({
      symbol:        inv.symbol,
      asset_type:    inv.asset_type,
      units:         inv.units,
      avg_buy_price: inv.avg_buy_price,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ symbol: "", asset_type: "", units: "", avg_buy_price: "" });
  };

  const refreshPrices = async () => {
    setRefreshing(true);
    try {
      await API.post("/investments/refresh-prices");
      showToast("Price refresh started — updating in 3s…");
      setTimeout(() => fetchInvestments(true), 3000);
    } catch (err) {
      console.error("Refresh failed", err);
      showToast("Failed to refresh prices", "error");
    } finally {
      setRefreshing(false);
    }
  };

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const pageBg    = dark ? "bg-gray-900"  : "bg-gray-50";
  const formBg    = dark ? "#1f2937"      : "white";
  const formBorder= dark ? "#374151"      : "#e5e7eb";
  const labelC    = dark ? "rgba(255,255,255,0.7)" : "#374151";
  const inputBg   = dark ? "#374151"      : "white";
  const inputBor  = dark ? "#4b5563"      : "#d1d5db";
  const inputC    = dark ? "white"        : "#111827";
  const titleC    = dark ? "white"        : "#111827";
  const subC      = dark ? "rgba(255,255,255,0.45)" : "#9ca3af";

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    padding: "9px 12px", borderRadius: "8px",
    border: `1px solid ${inputBor}`, background: inputBg,
    color: inputC, fontSize: "14px", outline: "none",
    transition: "border-color 0.2s",
  };

  const selectStyle = { ...inputStyle, cursor: "pointer" };

  return (
    <div className={`p-4 md:p-6 min-h-screen ${pageBg}`} style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 999,
          background: toast.type === "success" ? "#10b981" : "#ef4444",
          color: "white", borderRadius: "10px", padding: "12px 20px",
          fontSize: "14px", fontWeight: "600",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          animation: "slideDown 0.3s ease",
        }}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: titleC, margin: 0 }}>
            Portfolio
          </h1>
          {lastUpdated && (
            <p style={{ fontSize: "12px", color: subC, margin: "4px 0 0" }}>
              Last updated: {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          )}
          {loading && (
            <p style={{ fontSize: "12px", color: "#6366f1", margin: "4px 0 0", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
              Loading investments…
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={refreshPrices}
            disabled={refreshing}
            style={{
              background: refreshing ? "#6b7280" : "linear-gradient(135deg,#10b981,#059669)",
              color: "white", border: "none", borderRadius: "9px",
              padding: "9px 16px", fontSize: "13px", fontWeight: "600",
              cursor: refreshing ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "6px",
              transition: "opacity 0.2s",
            }}
          >
            <span style={{ animation: refreshing ? "spin 1s linear infinite" : "none", display: "inline-block" }}>↻</span>
            {refreshing ? "Refreshing…" : "Refresh Prices"}
          </button>

          <button
            onClick={() => setIsRebalanceDrawerOpen(true)}
            style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "white", border: "none", borderRadius: "9px",
              padding: "9px 16px", fontSize: "13px", fontWeight: "600",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              boxShadow: "0 2px 10px rgba(99,102,241,0.3)",
            }}
          >
             Rebalance
          </button>
        </div>
      </div>

      {/* ── Portfolio Summary ── */}
      <PortfolioSummary investments={investments} />

      {/* ── Create / Edit Form ── */}
      <form
        onSubmit={editId ? updateInvestment : createInvestment}
        style={{
          background: formBg, border: `1px solid ${formBorder}`,
          borderRadius: "16px", padding: "24px", marginBottom: "24px",
          boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 1px 6px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ fontSize: "17px", fontWeight: "700", color: titleC, margin: "0 0 18px" }}>
          {editId ? " Update Investment" : "➕ Add Investment"}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>

          {/* Asset Type */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: labelC, display: "block", marginBottom: "6px" }}>
              Asset Type
            </label>
            <select
              name="asset_type"
              value={formData.asset_type}
              onChange={handleChange}
              style={selectStyle}
              required
            >
              <option value="">Select type…</option>
              <option value="stock">Stock</option>
              <option value="etf">ETF</option>
              <option value="mutual_fund">Mutual Fund</option>
              <option value="bond">Bond</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          {/* Symbol search */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: labelC, display: "block", marginBottom: "6px" }}>
              Symbol / Name
            </label>
            {["stock", "etf", "mutual_fund"].includes(formData.asset_type) ? (
              <StockSearch
                assetType={formData.asset_type}
                onChange={(symbol) => setFormData(prev => ({ ...prev, symbol }))}
                onSelect={(stock) =>
                  setFormData(prev => ({
                    ...prev,
                    symbol: stock.symbol,
                    avg_buy_price: stock.price > 0 ? stock.price : prev.avg_buy_price,
                  }))
                }
              />
            ) : (
              <input
                name="symbol"
                placeholder="e.g. GOVT-BOND-2030"
                value={formData.symbol}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            )}
          </div>

          {/* Units */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: labelC, display: "block", marginBottom: "6px" }}>
              Units
            </label>
            <input
              name="units"
              type="number"
              min="0.001"
              step="any"
              placeholder="e.g. 10"
              value={formData.units}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          {/* Buy Price */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: labelC, display: "block", marginBottom: "6px" }}>
              Buy Price (₹)
            </label>
            <input
              name="avg_buy_price"
              type="number"
              min="0.01"
              step="any"
              placeholder="e.g. 1500"
              value={formData.avg_buy_price}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting ? "#6b7280" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "white", border: "none", borderRadius: "9px",
              padding: "10px 22px", fontSize: "14px", fontWeight: "700",
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: "0 2px 10px rgba(99,102,241,0.3)",
              transition: "opacity 0.2s",
            }}
          >
            {submitting ? "Saving…" : editId ? "Update Investment" : "Add Investment"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                background: dark ? "rgba(255,255,255,0.08)" : "#f3f4f6",
                color: dark ? "rgba(255,255,255,0.7)" : "#374151",
                border: "none", borderRadius: "9px",
                padding: "10px 20px", fontSize: "14px", fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ── Investments Table ── */}
      <InvestmentsTable
        investments={investments}
        onEdit={handleEdit}
        onDelete={deleteInvestment}
        fetchInvestments={() => fetchInvestments(true)}
      />

      {/* ── Rebalance Drawer ── */}
      <RebalanceDrawer
        isOpen={isRebalanceDrawerOpen}
        onClose={() => setIsRebalanceDrawerOpen(false)}
      />
    </div>
  );
}

export default Portfolio;