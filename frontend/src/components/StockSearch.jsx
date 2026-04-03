import React, { useState, useEffect, useRef, useContext } from "react";
import api from "../services/api";
import { ThemeContext } from "../context/Themecontext";

// ─── Curated fallback symbols (used when API is unavailable/rate-limited) ─────
const FALLBACK_SYMBOLS = [
  // NSE Equities
  { symbol: "RELIANCE.NS",  name: "Reliance Industries",      type: "equity" },
  { symbol: "TCS.NS",       name: "Tata Consultancy Services", type: "equity" },
  { symbol: "INFY.NS",      name: "Infosys Limited",           type: "equity" },
  { symbol: "HDFCBANK.NS",  name: "HDFC Bank",                 type: "equity" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank",                type: "equity" },
  { symbol: "AXISBANK.NS",  name: "Axis Bank",                 type: "equity" },
  { symbol: "WIPRO.NS",     name: "Wipro Limited",             type: "equity" },
  { symbol: "BAJFINANCE.NS",name: "Bajaj Finance",             type: "equity" },
  { symbol: "SBIN.NS",      name: "State Bank of India",       type: "equity" },
  { symbol: "HINDUNILVR.NS",name: "Hindustan Unilever",        type: "equity" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank",       type: "equity" },
  { symbol: "ADANIENT.NS",  name: "Adani Enterprises",         type: "equity" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical",        type: "equity" },
  { symbol: "TATAMOTORS.NS",name: "Tata Motors",               type: "equity" },
  { symbol: "ONGC.NS",      name: "Oil & Natural Gas Corp",    type: "equity" },
  { symbol: "MARUTI.NS",    name: "Maruti Suzuki India",       type: "equity" },
  { symbol: "NTPC.NS",      name: "NTPC Limited",              type: "equity" },
  { symbol: "ULTRACEMCO.NS",name: "UltraTech Cement",          type: "equity" },
  { symbol: "LT.NS",        name: "Larsen & Toubro",           type: "equity" },
  { symbol: "ITC.NS",       name: "ITC Limited",               type: "equity" },
  // ETFs
  { symbol: "NIFTYBEES.NS", name: "Nippon India Nifty 50 ETF", type: "etf" },
  { symbol: "JUNIORBEES.NS",name: "Nippon India Junior ETF",    type: "etf" },
  { symbol: "BANKBEES.NS",  name: "Nippon India Bank ETF",      type: "etf" },
  { symbol: "GOLDBEES.NS",  name: "Nippon India Gold ETF",      type: "etf" },
  { symbol: "ICICINIFTY.NS",name: "ICICI Prudential Nifty ETF", type: "etf" },
  { symbol: "SETFNIF50.NS", name: "SBI ETF Nifty 50",           type: "etf" },
  { symbol: "MAFANG.NS",    name: "Mirae Asset FANG+ ETF",      type: "etf" },
  // Mutual Funds (symbol = AMFI code)
  { symbol: "120503",  name: "Mirae Asset Large Cap Fund",      type: "mutual fund" },
  { symbol: "100033",  name: "SBI Bluechip Fund",               type: "mutual fund" },
  { symbol: "119551",  name: "Axis Long Term Equity Fund",      type: "mutual fund" },
  { symbol: "118989",  name: "HDFC Mid-Cap Opportunities",      type: "mutual fund" },
  { symbol: "130503",  name: "Parag Parikh Flexi Cap Fund",     type: "mutual fund" },
];

const TYPE_FILTER_MAP = {
  stock:       ["equity"],
  etf:         ["etf"],
  mutual_fund: ["mutual fund"],
};

function localSearch(query, assetType) {
  const q = query.toLowerCase();
  const allowed = TYPE_FILTER_MAP[assetType] || null;
  return FALLBACK_SYMBOLS.filter(s => {
    const matchType = !allowed || allowed.includes(s.type);
    const matchQuery = s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
    return matchType && matchQuery;
  }).slice(0, 8);
}

// ─── Component ────────────────────────────────────────────────────────────────

function StockSearch({ onSelect, onChange, assetType }) {
  const { darkMode: dark } = useContext(ThemeContext);
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (onChange) onChange(query);

    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setOpen(true);

    const delay = setTimeout(async () => {
      let fetched = [];
      let fallback = false;

      try {
        // Use the app's authenticated api instance, which already has the base URL
        const res = await api.get(
          `/stocks/search?keyword=${encodeURIComponent(query)}&asset_type=${assetType || ""}`
        );
        fetched = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.warn("Stock search API unavailable, using local symbols:", err.message);
      }

      // If API returned nothing, fall back to local curated list
      if (fetched.length === 0) {
        fetched = localSearch(query, assetType);
        fallback = true;
      }

      setResults(fetched);
      setUsingFallback(fallback);
      setLoading(false);
      setOpen(fetched.length > 0);
    }, 400);

    return () => clearTimeout(delay);
  }, [query, assetType]);

  const handleSelect = async (stock) => {
    setOpen(false);
    setQuery(`${stock.name} (${stock.symbol})`);
    setResults([]);

    // Try to fetch live price; fall back to 0 gracefully
    let price = 0;
    try {
      const priceRes = await api.get(`/stocks/price/${stock.symbol}`);
      price = priceRes.data?.price ?? 0;
    } catch (err) {
      console.warn("Price fetch failed, using 0:", err.message);
    }

    onSelect({ symbol: stock.symbol, price });
  };

  // ── Theme tokens ───────────────────────────────────────────────────────────
  const inputBg     = dark ? "#374151" : "white";
  const inputBorder = dark ? "#4b5563" : "#d1d5db";
  const inputColor  = dark ? "white"   : "#111827";
  const inputPlaceholder = dark ? "#9ca3af" : "#9ca3af";
  const dropBg      = dark ? "#1f2937" : "white";
  const dropBorder  = dark ? "#374151" : "#e5e7eb";
  const itemHoverBg = dark ? "#374151" : "#f9fafb";
  const symbolColor = dark ? "white"   : "#111827";
  const nameColor   = dark ? "#9ca3af" : "#6b7280";
  const typeColor   = dark ? "#6366f1" : "#6366f1";
  const fallbackColor = dark ? "#f59e0b" : "#d97706";

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Input */}
      <input
        type="text"
        placeholder="Search symbol or name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "8px 12px", borderRadius: "8px",
          border: `1px solid ${inputBorder}`,
          background: inputBg, color: inputColor,
          fontSize: "14px", outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus_extra={(e) => e.target.style.borderColor = "#6366f1"}
        onBlur={(e) => e.target.style.borderColor = inputBorder}
      />

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: dropBg, border: `1px solid ${dropBorder}`,
          borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          zIndex: 50, maxHeight: "260px", overflowY: "auto",
        }}>
          {/* Loading state */}
          {loading && (
            <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "14px", height: "14px", borderRadius: "50%",
                border: "2px solid #6366f1", borderTopColor: "transparent",
                animation: "spin 0.7s linear infinite", flexShrink: 0,
              }} />
              <span style={{ fontSize: "13px", color: nameColor }}>Searching…</span>
            </div>
          )}

          {/* Results */}
          {!loading && results.map((res, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(res)}
              style={{
                padding: "10px 14px", cursor: "pointer",
                borderBottom: idx < results.length - 1 ? `1px solid ${dropBorder}` : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = itemHoverBg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "700", fontSize: "14px", color: symbolColor }}>
                  {res.symbol}
                </span>
                <span style={{
                  fontSize: "10px", fontWeight: "600", textTransform: "uppercase",
                  color: "white", background: typeColor,
                  padding: "1px 7px", borderRadius: "20px", letterSpacing: "0.3px"
                }}>
                  {res.type}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: nameColor, marginTop: "2px" }}>
                {res.name}
              </div>
            </div>
          ))}

          {/* No results */}
          {!loading && results.length === 0 && (
            <div style={{ padding: "14px 16px", textAlign: "center", fontSize: "13px", color: nameColor }}>
              No symbols found for "{query}"
            </div>
          )}

          {/* Fallback notice */}
          {!loading && usingFallback && results.length > 0 && (
            <div style={{
              padding: "8px 14px", borderTop: `1px solid ${dropBorder}`,
              fontSize: "11px", color: fallbackColor, display: "flex", alignItems: "center", gap: "5px"
            }}>
              ⚡ Showing local symbols (live search unavailable)
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default StockSearch;