import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/Themecontext";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const SIPCalculator = () => {
  const { darkMode } = useContext(ThemeContext);
  
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [returnRate, setReturnRate] = useState(12);
  const [tenure, setTenure] = useState(10);
  
  const [results, setResults] = useState({
    totalInvested: 0,
    estimatedReturns: 0,
    totalValue: 0,
    projection: []
  });

  const calculateSIP = () => {
    const P = monthlyInvestment;
    const annualRate = returnRate;
    const years = tenure;
    
    const r = annualRate / 12 / 100;
    const n = Math.max(1, years * 12);
    
    // Future Value = P × [((1 + r)^n - 1) / r] × (1 + r)
    const futureValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const totalInvested = P * n;
    const estimatedReturns = futureValue - totalInvested;
    
    // Generate yearly projection for chart
    const projection = [];
    for (let i = 0; i <= years; i++) {
      const monthsSoFar = i * 12;
      const value = i === 0 ? 0 : P * ((Math.pow(1 + r, monthsSoFar) - 1) / r) * (1 + r);
      const invested = P * monthsSoFar;
      
      projection.push({
        year: i,
        invested: Math.round(invested),
        value: Math.round(value),
        returns: Math.round(value - invested)
      });
    }
    
    setResults({
      totalInvested,
      estimatedReturns,
      totalValue: futureValue,
      projection
    });
  };

  useEffect(() => {
    calculateSIP();
  }, [monthlyInvestment, returnRate, tenure]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            SIP Calculator
          </h1>
          <p className="text-gray-500 mt-2">Plan your wealth growth with Systematic Investment Plans</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs Panel */}
          <div className="lg:col-span-1 space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            {/* Monthly Investment */}
            <div>
              <div className="flex justify-between mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <label>Monthly Investment</label>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(monthlyInvestment)}</span>
              </div>
              <input
                type="range"
                min="500"
                max="100000"
                step="500"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>₹500</span>
                <span>₹1L</span>
              </div>
            </div>

            {/* Return Rate */}
            <div>
              <div className="flex justify-between mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <label>Annual Return (%)</label>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">{returnRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={returnRate}
                onChange={(e) => setReturnRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>1%</span>
                <span>30%</span>
              </div>
            </div>

            {/* Tenure */}
            <div>
              <div className="flex justify-between mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <label>Investment Tenure</label>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{tenure} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                step="1"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>1 Yr</span>
                <span>40 Yrs</span>
              </div>
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 transform hover:scale-[1.02]">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Total Invested</p>
                <p className="text-2xl font-bold">{formatCurrency(results.totalInvested)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 transform hover:scale-[1.02]">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Est. Returns</p>
                <p className="text-2xl font-bold text-green-500">+{formatCurrency(results.estimatedReturns)}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md transform hover:scale-[1.02] bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 dark:border-indigo-700">
                <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-300 uppercase mb-1">Total Value</p>
                <p className="text-2xl font-bold text-indigo-700 dark:text-white">{formatCurrency(results.totalValue)}</p>
              </div>
            </div>

            {/* Growth Chart */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
              <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center justify-between">
                <span>Wealth Projection</span>
                <span className="text-xs font-normal text-gray-400">Growth over {tenure} years</span>
              </h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={results.projection}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#374151" : "#f1f5f9"} />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12}}
                      label={{ value: 'Years', position: 'bottom', offset: -5, fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12}}
                      tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#111827' : '#fff', 
                        borderColor: darkMode ? '#374151' : '#e2e8f0',
                        borderRadius: '16px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        padding: '12px'
                      }}
                      formatter={(value) => [formatCurrency(value), '']}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#6366f1" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      name="Total Value"
                      animationDuration={1500}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="invested" 
                      stroke="#94a3b8" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fillOpacity={0.5} 
                      fill="url(#colorInvested)" 
                      name="Invested Amount"
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-8 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Estimated Total Value</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gray-400 rounded-full border border-dashed border-gray-600"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Principal Invested</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPCalculator;
