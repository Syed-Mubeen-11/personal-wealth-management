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
  const [currentPrice, setCurrentPrice]                   = useState(null);
  const [calculationMode, setCalculationMode]             = useState("units"); // "units" or "amount"
  
  const [formData, setFormData] = useState({
    symbol: "", asset_type: "", units: "", avg_buy_price: "", amount: ""
  });
  const [editId, setEditId] = useState(null);
  const [toast, setToast]   = useState(null);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch current price when symbol changes ────────────────────────────────
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      if (formData.symbol && (formData.asset_type === "stock" || formData.asset_type === "etf")) {
        try {
          const response = await API.get(`/stocks/price/${formData.symbol}`);
          setCurrentPrice(response.data.price);
        } catch (error) {
          console.error("Failed to fetch price", error);
          setCurrentPrice(null);
        }
      } else {
        setCurrentPrice(null);
      }
    };
    fetchCurrentPrice();
  }, [formData.symbol, formData.asset_type]);

  // ── Calculate based on units entered ───────────────────────────────────────
  const handleUnitsChange = (e) => {
    const units = e.target.value;
    setFormData(prev => ({ ...prev, units, amount: "" }));
    
    if (currentPrice && units && parseFloat(units) > 0) {
      const totalAmount = parseFloat(units) * parseFloat(currentPrice);
      setFormData(prev => ({ 
        ...prev, 
        units, 
        avg_buy_price: currentPrice,
        amount: totalAmount.toFixed(2)
      }));
    } else {
      setFormData(prev => ({ ...prev, units, avg_buy_price: currentPrice || "" }));
    }
  };

  // ── Calculate based on amount entered ──────────────────────────────────────
  const handleAmountChange = (e) => {
    const amount = e.target.value;
    setFormData(prev => ({ ...prev, amount, units: "" }));
    
    if (currentPrice && amount && parseFloat(amount) > 0) {
      const calculatedUnits = parseFloat(amount) / parseFloat(currentPrice);
      setFormData(prev => ({ 
        ...prev, 
        amount,
        units: calculatedUnits.toFixed(4),
        avg_buy_price: currentPrice
      }));
    } else {
      setFormData(prev => ({ ...prev, amount }));
    }
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

    let finalUnits = formData.units;
    let finalBuyPrice = formData.avg_buy_price;

    // If amount mode was used, calculate units and buy price
    if (calculationMode === "amount" && formData.amount && currentPrice) {
      finalUnits = (parseFloat(formData.amount) / parseFloat(currentPrice)).toFixed(4);
      finalBuyPrice = currentPrice;
    }

    if (!finalUnits || parseFloat(finalUnits) <= 0) {
      showToast("Please enter valid units or amount", "error");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/investments/", {
        symbol:        formData.symbol,
        asset_type:    formData.asset_type,
        units:         Number(finalUnits),
        avg_buy_price: Number(finalBuyPrice || currentPrice)
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
      await API.put(`/investments/${editId}`, {
        units: Number(formData.units),
        avg_buy_price: Number(formData.avg_buy_price)
      });
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
    setCalculationMode("units");
    setFormData({
      symbol:        inv.symbol,
      asset_type:    inv.asset_type,
      units:         inv.units,
      avg_buy_price: inv.avg_buy_price,
      amount:        (inv.units * inv.avg_buy_price).toFixed(2)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditId(null);
    setCalculationMode("units");
    setCurrentPrice(null);
    setFormData({ symbol: "", asset_type: "", units: "", avg_buy_price: "", amount: "" });
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
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

        {/* Current Price Display */}
        {currentPrice && !editId && (
          <div style={{ marginBottom: "16px", padding: "10px 14px", background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff", borderRadius: "10px" }}>
            <p style={{ fontSize: "13px", color: dark ? "#a5b4fc" : "#4f46e5", margin: 0 }}>
              Current Market Price: <strong>₹{currentPrice}</strong> per unit
            </p>
          </div>
        )}

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
                    symbol: stock.symbol
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

        </div>

        {/* Calculation Mode Toggle - Only show for stocks/ETFs with current price */}
        {currentPrice && !editId && (formData.asset_type === "stock" || formData.asset_type === "etf") && (
          <div style={{ display: "flex", gap: "20px", marginTop: "16px", marginBottom: "16px", padding: "10px 0", borderTop: `1px solid ${formBorder}`, borderBottom: `1px solid ${formBorder}` }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="radio"
                value="units"
                checked={calculationMode === "units"}
                onChange={() => {
                  setCalculationMode("units");
                  setFormData(prev => ({ ...prev, amount: "" }));
                }}
              />
              <span style={{ fontSize: "13px", color: labelC }}>Invest by Units</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="radio"
                value="amount"
                checked={calculationMode === "amount"}
                onChange={() => {
                  setCalculationMode("amount");
                  setFormData(prev => ({ ...prev, units: "" }));
                }}
              />
              <span style={{ fontSize: "13px", color: labelC }}>Invest by Amount (₹)</span>
            </label>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>

          {/* Units Field */}
          {calculationMode === "units" && (
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: labelC, display: "block", marginBottom: "6px" }}>
                Number of Units
              </label>
              <input
                name="units"
                type="number"
                min="0.001"
                step="any"
                placeholder="e.g. 10"
                value={formData.units}
                onChange={handleUnitsChange}
                style={inputStyle}
                required={calculationMode === "units"}
              />
            </div>
          )}

          {/* Amount Field */}
          {calculationMode === "amount" && (
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: labelC, display: "block", marginBottom: "6px" }}>
                Amount to Invest (₹)
              </label>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="any"
                placeholder="e.g. 50000"
                value={formData.amount}
                onChange={handleAmountChange}
                style={inputStyle}
                required={calculationMode === "amount"}
              />
            </div>
          )}

          {/* Buy Price */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: labelC, display: "block", marginBottom: "6px" }}>
              Buy Price (₹)
              {currentPrice && (formData.asset_type === "stock" || formData.asset_type === "etf") && (
                <span style={{ fontWeight: "normal", fontSize: "10px", marginLeft: "8px" }}>(market: ₹{currentPrice})</span>
              )}
            </label>
            <input
              name="avg_buy_price"
              type="number"
              step="any"
              placeholder="Enter buy price"
              value={formData.avg_buy_price}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          {/* Total Value Display */}
          {currentPrice && (formData.units || formData.amount) && !editId && (
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: labelC, display: "block", marginBottom: "6px" }}>
                Total Investment Value
              </label>
              <div style={{ ...inputStyle, background: dark ? "#374151" : "#f3f4f6", fontWeight: "bold", color: "#10b981" }}>
                ₹{calculationMode === "units" && formData.units ? (parseFloat(formData.units) * (formData.avg_buy_price || currentPrice)).toLocaleString('en-IN') : 
                  calculationMode === "amount" && formData.amount ? parseFloat(formData.amount).toLocaleString('en-IN') : "0"}
              </div>
            </div>
          )}

        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
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
