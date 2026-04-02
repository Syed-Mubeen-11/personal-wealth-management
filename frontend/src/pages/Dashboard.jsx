import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

// Import your brand new badge!
import RiskProfileBadge from "../components/RiskProfileBadge";

// Register Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();

  // --- YOUR BACKEND STATES ---
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expense: 0,
    last_updated: null,
  });
  const [user, setUser] = useState({
    name: "User",
    email: "",
    risk_profile: "moderate",
  });
  const [portfolio, setPortfolio] = useState({
    overview: {
      total_portfolio_value: 0,
      overall_gain_loss: 0,
      last_updated: null,
    },
  });
  const [indices, setIndices] = useState([]);
  const [indicesLoading, setIndicesLoading] = useState(true);
  const [liveValue, setLiveValue] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // --- YOUR API CALLS ---
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumRes, userRes, portRes] = await Promise.all([
        api.get("/summary"),
        api.get("/profile/"),
        api.get("/portfolio"),
      ]);
      setSummary(sumRes.data);
      setUser(userRes.data);
      setPortfolio(portRes.data);

      // Compute live portfolio value from positions
      const positions = portRes.data.positions || portRes.data.assets || [];
      if (positions.length > 0) {
        const total = positions.reduce((acc, p) => {
          const val = p.current_value || p.market_value || (p.quantity || 0) * (p.current_price || p.last_price || p.buy_price || 0);
          return acc + val;
        }, 0);
        setLiveValue(total);
      }
    } catch (err) {
      console.error("Error loading dashboard", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- MARKET INDICES (non-blocking) ---
  const loadIndices = useCallback(async () => {
    setIndicesLoading(true);
    try {
      const res = await api.get("/api/market/indices");
      setIndices(res.data);
    } catch {
      // Silently fail — banner just won't show
    } finally {
      setIndicesLoading(false);
    }
  }, []);

  // --- REFRESH LIVE PRICES ---
  const refreshPrices = async () => {
    setRefreshing(true);
    try {
      await api.post("/api/refresh/user");
      await loadData();
    } catch {
      // fail silently
    } finally {
      setRefreshing(false);
    }
  };

  // --- AUTHENTICATION CHECK ---
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/login");
    } else {
      setIsAuth(true);
      loadData();
      loadIndices();
    }
  }, [navigate, loadData, loadIndices]);

  // --- YOUR CHART DATA ---
  const pieData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [summary.income, summary.expense],
        backgroundColor: ["#22c55e", "#ef4444"],
      },
    ],
  };

  if (!isAuth)
    return (
      <div className="p-10 text-center font-bold text-[#1B3C53]">
        Loading Dashboard...
      </div>
    );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#234C6A] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#1B3C53] font-bold">
          Fetching live market data...
        </p>
      </div>
    );
  }

  const formatTimestamp = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-8">
        {/* Header (Dynamic User Data) */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1B3C53]">Dashboard</h1>
            {(portfolio.overview?.last_updated || summary.last_updated) && (
              <p className="text-sm text-gray-500 mt-1">
                Last Updated:{" "}
                {formatTimestamp(
                  portfolio.overview?.last_updated || summary.last_updated,
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#234C6A] rounded-full flex items-center justify-center text-white font-bold uppercase">
              {user.name ? user.name[0] : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-800">
                  {user.name || "User"}
                </p>
                {/* THE BADGE IS ADDED HERE */}
                <RiskProfileBadge riskProfile={user.risk_profile} size="sm" />
              </div>
              <p className="text-xs text-gray-500">
                {user.email || "Welcome back!"}
              </p>
            </div>
          </div>
        </header>

        {/* Market Indices Banner */}
        {!indicesLoading && indices.length > 0 && (
          <div className="bg-[#1B3C53] rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Markets Today</span>
            <div className="flex flex-wrap gap-6">
              {indices.map((idx) => (
                <div key={idx.name} className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">{idx.name}</span>
                  <span className="text-white/80 text-sm">${idx.price?.toLocaleString()}</span>
                  <span className={`flex items-center gap-1 text-xs font-bold ${idx.change_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {idx.change_pct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {idx.change_pct >= 0 ? '+' : ''}{idx.change_pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards (Dynamic Financial Data) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Live Portfolio Value */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-gray-500 text-sm font-bold uppercase">
                Live Portfolio
              </h3>
              <button
                onClick={refreshPrices}
                disabled={refreshing}
                className="text-gray-400 hover:text-[#1B3C53] transition"
                title="Refresh prices"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>
            <p className="text-3xl font-bold text-[#1B3C53]">
              ${(liveValue ?? portfolio.overview?.total_portfolio_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
              {refreshing ? 'Refreshing…' : 'Based on market prices'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm mb-1 font-bold uppercase">
              Total Assets
            </h3>
            <p className="text-3xl font-bold text-[#1B3C53]">
              $
              {portfolio.overview?.total_portfolio_value?.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm mb-1 font-bold uppercase">
              Net Worth
            </h3>
            <p className="text-3xl font-bold text-[#1B3C53]">
              ${summary.balance?.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm mb-1 font-bold uppercase">
              Investment Gain/Loss
            </h3>
            <p
              className={`text-3xl font-bold ${portfolio.overview?.overall_gain_loss >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {portfolio.overview?.overall_gain_loss >= 0 ? "+" : ""}$
              {portfolio.overview?.overall_gain_loss?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Bottom Section: Chart and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Your Pie Chart embedded in Teammate's container */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Cash Flow Overview
            </h2>
            <div className="flex-1 relative flex justify-center">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/portfolio")}
                className="w-full bg-[#1B3C53] text-white py-3 rounded-lg font-bold hover:bg-[#234C6A] transition shadow-sm"
              >
                + Buy New Stock
              </button>
              <button
                onClick={() => navigate("/goals")}
                className="w-full border border-[#1B3C53] text-[#1B3C53] py-3 rounded-lg font-bold hover:bg-gray-50 transition shadow-sm"
              >
                + Add New Goal
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
