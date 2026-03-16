import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  // FE Dev 1: State for live data, loading, and timestamps
  const [summary, setSummary] = useState({
    totalPortfolio: 0,
    activeGoals: 0,
    riskProfile: "Loading...",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // FE Dev 1: Set loading to true while fetching live prices
    setIsLoading(true);
    try {
      // Assuming a dashboard summary endpoint exists
      const res = await api.get("/dashboard/summary");
      setSummary({
        totalPortfolio: res.data.total_value || 0,
        activeGoals: res.data.goals_count || 0,
        riskProfile: res.data.risk_level || "Calculating...",
      });
      // FE Dev 1: Setting the timestamp from the market sync
      setLastUpdated(res.data.last_sync_at || new Date().toISOString());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      // FE Dev 1: Disable loading after data is received
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* FE Dev 1: Header with Live Indicator and Last Updated Timestamp (Requirement p. 4) */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <h2 className="text-white font-medium">Market Live</h2>
        </div>
        
        {/* Requirement: Add Last Updated timestamps so users know how fresh data is */}
        <p className="text-xs text-slate-500">
          {lastUpdated 
            ? `System Sync: ${new Date(lastUpdated).toLocaleTimeString()}` 
            : "System Sync: Syncing..."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Portfolio Card - Requirement: Handle loading states */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400">Total Portfolio</h3>
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-800 animate-pulse mt-2 rounded"></div>
          ) : (
            <p className="text-2xl font-bold mt-2 text-purple-400">
              ₹ {summary.totalPortfolio.toLocaleString('en-IN')}
            </p>
          )}
        </div>

        {/* Active Goals Card */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400">Active Goals</h3>
          {isLoading ? (
            <div className="h-8 w-8 bg-slate-800 animate-pulse mt-2 rounded"></div>
          ) : (
            <p className="text-2xl font-bold mt-2 text-pink-400">
              {summary.activeGoals}
            </p>
          )}
        </div>

        {/* Risk Profile Card */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-slate-400">Risk Profile</h3>
          {isLoading ? (
            <div className="h-8 w-20 bg-slate-800 animate-pulse mt-2 rounded"></div>
          ) : (
            <p className="text-2xl font-bold mt-2 text-indigo-400">
              {summary.riskProfile}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;