import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { ThemeContext } from '../context/Themecontext';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

/* ─── tiny stat card ───────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, accent, dark }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 ${dark ? 'bg-gray-800/70' : 'bg-white'} border ${dark ? 'border-gray-700' : 'border-gray-100'} shadow-sm`}>
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 ${accent}`} />
    <p className={`text-xs font-semibold tracking-widest uppercase mb-1 ${dark ? 'text-gray-400' : 'text-gray-400'}`}>{label}</p>
    <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    {sub && <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{sub}</p>}
  </div>
);

/* ─── section header ────────────────────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, badge, dark }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className={`p-2 rounded-xl ${dark ? 'bg-indigo-900/40' : 'bg-indigo-50'}`}>
      <Icon className={`h-5 w-5 ${dark ? 'text-indigo-400' : 'text-indigo-600'}`} />
    </div>
    <h2 className={`text-lg font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
    {badge !== undefined && (
      <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
        {badge}
      </span>
    )}
  </div>
);

/* ─── pagination ────────────────────────────────────────────────────────────── */
const Pagination = ({ page, total, setPage, dark }) => total > 1 ? (
  <div className="flex justify-between items-center mt-5 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
      className={`px-4 py-1.5 text-sm rounded-lg font-medium transition ${dark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-40' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40'}`}>
      ← Prev
    </button>
    <span className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-gray-400'}`}>{page} / {total}</span>
    <button onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page === total}
      className={`px-4 py-1.5 text-sm rounded-lg font-medium transition ${dark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-40' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40'}`}>
      Next →
    </button>
  </div>
) : null;

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
const Reports = () => {
  const { darkMode: dark } = useContext(ThemeContext);

  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [goals,            setGoals]            = useState([]);
  const [simulations,      setSimulations]      = useState([]);
  const [transactions,     setTransactions]     = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [sortBy,           setSortBy]           = useState('gain_loss');
  const [sortDir,          setSortDir]          = useState('desc');
  const [simPage,          setSimPage]          = useState(1);
  const [txnPage,          setTxnPage]          = useState(1);
  const [expandedRow,      setExpandedRow]      = useState(null);

  const [dlPDF,      setDlPDF]      = useState(false);
  const [dlPortCSV,  setDlPortCSV]  = useState(false);
  const [dlGoalCSV,  setDlGoalCSV]  = useState(false);
  const [dlTxnCSV,   setDlTxnCSV]   = useState(false);

  const PER_PAGE = 10;

  /* fetch ------------------------------------------------------------------- */
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, gRes, sRes, tRes] = await Promise.all([
        api.get('/investments/summary'),
        api.get('/goals/'),
        api.get('/simulations/'),
        api.get('/transactions/'),
      ]);
      setPortfolioSummary(pRes.data);
      setGoals(gRes.data);
      setSimulations(sRes.data);
      setTransactions(tRes.data);
    } catch (e) {
      console.error('Reports fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  /* downloads --------------------------------------------------------------- */
  const triggerDownload = (data, name, mime) => {
    const url  = window.URL.createObjectURL(new Blob([data], { type: mime }));
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const today = () => new Date().toISOString().split('T')[0];

  const downloadPDF = async () => {
    setDlPDF(true);
    try {
      const r = await api.get('/reports/pdf', { params: { scope: 'full' }, responseType: 'blob' });
      triggerDownload(r.data, `wealth-report-${today()}.pdf`, 'application/pdf');
    } catch { alert('PDF download failed.'); } finally { setDlPDF(false); }
  };

  const downloadCSV = async (type, setDl, name) => {
    setDl(true);
    try {
      const r = await api.get('/reports/csv', { params: { type }, responseType: 'blob' });
      triggerDownload(r.data, name, 'text/csv');
    } catch { alert(`${type} CSV export failed.`); } finally { setDl(false); }
  };

  /* helpers ----------------------------------------------------------------- */
  const goalProgress = (g) =>
    Math.min((parseFloat(g.monthly_contribution || 0) / parseFloat(g.target_amount || 1)) * 100, 100);

  const simFinalValue = (sim) => {
    try {
      const p = typeof sim.results === 'string' ? JSON.parse(sim.results) : sim.results;
      const arr = p?.projection;
      if (!Array.isArray(arr) || !arr.length) return null;
      const last = arr[arr.length - 1];
      return last?.portfolio_value ?? (typeof last === 'number' ? last : null);
    } catch { return null; }
  };

  const simAssumptions = (sim) => {
    try { return typeof sim.assumptions === 'string' ? JSON.parse(sim.assumptions) : sim.assumptions; }
    catch { return null; }
  };

  const fc = (v) => {
    if (v == null || isNaN(v)) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  };

  const fd = (s) => {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const txnTypeBadge = (type) => {
    const t = String(type).replace('TransactionTypeEnum.', '').toLowerCase();
    const map = {
      buy:          'bg-emerald-100 text-emerald-700',
      sell:         'bg-red-100 text-red-700',
      dividend:     'bg-blue-100 text-blue-700',
      contribution: 'bg-violet-100 text-violet-700',
      withdrawal:   'bg-orange-100 text-orange-700',
    };
    return { label: t.charAt(0).toUpperCase() + t.slice(1), cls: map[t] || 'bg-gray-100 text-gray-600' };
  };

  const sortedInvestments = () => {
    if (!portfolioSummary?.investments) return [];
    return [...portfolioSummary.investments].sort((a, b) => {
      const va = sortBy === 'gain_loss' ? (a.gain_loss_pct || 0) : (a.current_value || 0);
      const vb = sortBy === 'gain_loss' ? (b.gain_loss_pct || 0) : (b.current_value || 0);
      return sortDir === 'desc' ? vb - va : va - vb;
    });
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  const simPaged = simulations.slice((simPage - 1) * PER_PAGE, simPage * PER_PAGE);
  const txnPaged = transactions.slice((txnPage - 1) * PER_PAGE, txnPage * PER_PAGE);

  /* theme tokens ------------------------------------------------------------ */
  const bg      = dark ? 'bg-gray-950'    : 'bg-slate-50';
  const card    = dark ? 'bg-gray-800/60 backdrop-blur' : 'bg-white';
  const border  = dark ? 'border-gray-700/60' : 'border-gray-100';
  const text    = dark ? 'text-white'     : 'text-gray-900';
  const muted   = dark ? 'text-gray-400'  : 'text-gray-500';
  const thBg    = dark ? 'bg-gray-700/50' : 'bg-slate-50';
  const rowHov  = dark ? 'hover:bg-gray-700/40' : 'hover:bg-slate-50/80';

  /* loading skeleton -------------------------------------------------------- */
  if (loading) return (
    <div className={`min-h-screen ${bg} p-6 flex items-center justify-center`}>
      <div className="space-y-3 w-full max-w-4xl">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-20 rounded-2xl animate-pulse ${dark ? 'bg-gray-800' : 'bg-gray-200'}`} />
        ))}
      </div>
    </div>
  );

  /* ── render ──────────────────────────────────────────────────────────────── */
  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ═══ HEADER ═══ */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-extrabold tracking-tight ${text}`}>Financial Reports</h1>
            <p className={`text-sm mt-1 ${muted}`}>Your complete wealth snapshot — {fd(new Date().toISOString())}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 items-start">
            <button onClick={downloadPDF} disabled={dlPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition disabled:opacity-50">
              <DocumentArrowDownIcon className="h-4 w-4" />
              {dlPDF ? 'Generating…' : 'Full PDF'}
            </button>
            <button onClick={() => downloadCSV('portfolio', setDlPortCSV, `portfolio-${today()}.csv`)} disabled={dlPortCSV}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition disabled:opacity-50">
              <TableCellsIcon className="h-4 w-4" />
              {dlPortCSV ? '…' : 'Portfolio CSV'}
            </button>
            <button onClick={() => downloadCSV('goals', setDlGoalCSV, `goals-${today()}.csv`)} disabled={dlGoalCSV}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200 dark:shadow-none transition disabled:opacity-50">
              <TableCellsIcon className="h-4 w-4" />
              {dlGoalCSV ? '…' : 'Goals CSV'}
            </button>
            <button onClick={() => downloadCSV('transactions', setDlTxnCSV, `transactions-${today()}.csv`)} disabled={dlTxnCSV}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200 dark:shadow-none transition disabled:opacity-50">
              <TableCellsIcon className="h-4 w-4" />
              {dlTxnCSV ? '…' : 'Transactions CSV'}
            </button>
          </div>
        </div>

        {/* ═══ PORTFOLIO SUMMARY ═══ */}
        <div className={`${card} rounded-2xl border ${border} shadow-sm p-6`}>
          <SectionHeader icon={ChartBarIcon} title="Portfolio Summary" dark={dark} />

          {portfolioSummary && portfolioSummary.total_value > 0 ? (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatCard label="Total Value" value={fc(portfolioSummary.total_value)} accent="bg-indigo-500" dark={dark} />
                <StatCard
                  label="Overall Gain/Loss"
                  value={`${portfolioSummary.day_change_percentage >= 0 ? '+' : ''}${portfolioSummary.day_change_percentage?.toFixed(2)}%`}
                  accent={portfolioSummary.day_change_percentage >= 0 ? 'bg-emerald-500' : 'bg-red-500'}
                  dark={dark}
                />
                <StatCard
                  label="Best Performer"
                  value={portfolioSummary.best_performer?.symbol || '—'}
                  sub={portfolioSummary.best_performer ? `+${portfolioSummary.best_performer.gain_loss_pct}%` : undefined}
                  accent="bg-emerald-500"
                  dark={dark}
                />
                <StatCard
                  label="Worst Performer"
                  value={portfolioSummary.worst_performer?.symbol || '—'}
                  sub={portfolioSummary.worst_performer ? `${portfolioSummary.worst_performer.gain_loss_pct}%` : undefined}
                  accent="bg-red-500"
                  dark={dark}
                />
              </div>

              {/* Investments table */}
              <div className="overflow-x-auto rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${thBg} text-xs uppercase tracking-wider`}>
                      <th className={`text-left px-4 py-3 font-semibold ${muted}`}>Symbol</th>
                      <th className={`text-right px-4 py-3 font-semibold ${muted}`}>Units</th>
                      <th className={`text-right px-4 py-3 font-semibold ${muted}`}>Cost Basis</th>
                      <th className={`text-right px-4 py-3 font-semibold ${muted}`}>Current Value</th>
                      <th onClick={() => toggleSort('gain_loss')}
                        className={`text-right px-4 py-3 font-semibold cursor-pointer ${muted} hover:text-indigo-500 transition select-none`}>
                        Gain/Loss {sortBy === 'gain_loss' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {sortedInvestments().map((inv, i) => (
                      <tr key={i} className={`${rowHov} transition`}>
                        <td className={`px-4 py-3 font-semibold ${text}`}>{inv.symbol}</td>
                        <td className={`text-right px-4 py-3 ${muted}`}>{inv.units}</td>
                        <td className={`text-right px-4 py-3 ${muted}`}>{fc(inv.cost_basis)}</td>
                        <td className={`text-right px-4 py-3 font-medium ${text}`}>{fc(inv.current_value)}</td>
                        <td className={`text-right px-4 py-3 font-bold ${inv.gain_loss_pct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          <span className="inline-flex items-center gap-1 justify-end">
                            {inv.gain_loss_pct >= 0
                              ? <ArrowUpIcon className="h-3 w-3" />
                              : <ArrowDownIcon className="h-3 w-3" />}
                            {Math.abs(inv.gain_loss_pct)?.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className={`flex flex-col items-center py-12 ${muted}`}>
              <CurrencyRupeeIcon className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No investments found. Add some to see your portfolio.</p>
            </div>
          )}
        </div>

        {/* ═══ GOALS ═══ */}
        <div className={`${card} rounded-2xl border ${border} shadow-sm p-6`}>
          <SectionHeader icon={CalendarIcon} title="Goals Progress" badge={goals.length} dark={dark} />

          {goals.length === 0 ? (
            <p className={`text-center py-8 text-sm ${muted}`}>No goals yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal, i) => {
                const pct       = goalProgress(goal);
                const done      = pct >= 100;
                const paused    = goal.status === 'paused';

                return (
                  <div key={i} className={`rounded-xl p-4 border ${border} ${dark ? 'bg-gray-700/30' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold capitalize ${text}`}>{goal.goal_type}</span>
                          {done   && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✓ Done</span>}
                          {paused && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Paused</span>}
                        </div>
                        <p className={`text-xs mt-0.5 ${muted}`}>₹{parseFloat(goal.monthly_contribution || 0).toLocaleString('en-IN')}/mo</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs ${muted}`}>Target</p>
                        <p className={`text-sm font-bold ${text}`}>{fc(goal.target_amount)}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className={`h-2 w-full rounded-full ${dark ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${done ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs">
                      <span className={`font-semibold ${done ? 'text-emerald-600' : 'text-indigo-600'}`}>{pct.toFixed(1)}%</span>
                      <span className={muted}>{fd(goal.target_date)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══ TRANSACTIONS ═══ */}
        <div className={`${card} rounded-2xl border ${border} shadow-sm p-6`}>
          <SectionHeader icon={ArrowsRightLeftIcon} title="Transaction History" badge={transactions.length} dark={dark} />

          {transactions.length === 0 ? (
            <p className={`text-center py-8 text-sm ${muted}`}>No transactions recorded yet.</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${thBg} text-xs uppercase tracking-wider`}>
                      {['Symbol', 'Type', 'Qty', 'Price', 'Fees', 'Total', 'Date'].map(h => (
                        <th key={h} className={`px-4 py-3 font-semibold ${muted} ${h === 'Symbol' ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {txnPaged.map((txn, i) => {
                      const qty   = parseFloat(txn.quantity || 0);
                      const price = parseFloat(txn.price || 0);
                      const fees  = parseFloat(txn.fees || 0);
                      const total = qty * price + fees;
                      const badge = txnTypeBadge(txn.type);
                      return (
                        <tr key={i} className={`${rowHov} transition`}>
                          <td className={`px-4 py-3 font-semibold ${text}`}>{txn.symbol}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                          </td>
                          <td className={`text-right px-4 py-3 ${muted}`}>{qty.toFixed(2)}</td>
                          <td className={`text-right px-4 py-3 ${muted}`}>{fc(price)}</td>
                          <td className={`text-right px-4 py-3 ${muted}`}>{fc(fees)}</td>
                          <td className={`text-right px-4 py-3 font-semibold ${text}`}>{fc(total)}</td>
                          <td className={`text-right px-4 py-3 text-xs ${muted}`}>{fd(txn.executed_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={txnPage} total={Math.ceil(transactions.length / PER_PAGE)} setPage={setTxnPage} dark={dark} />
            </>
          )}
        </div>

        {/* ═══ SIMULATIONS ═══ */}
        <div className={`${card} rounded-2xl border ${border} shadow-sm p-6`}>
          <SectionHeader icon={ChartBarIcon} title="Simulation History" badge={simulations.length} dark={dark} />

          {simulations.length === 0 ? (
            <p className={`text-center py-8 text-sm ${muted}`}>No simulations saved yet. Run one from the Goals page.</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${thBg} text-xs uppercase tracking-wider`}>
                      {['Scenario', 'Assumptions', 'Final Value', 'Invested', 'Returns', 'Date'].map((h, j) => (
                        <th key={h} className={`px-4 py-3 font-semibold ${muted} ${j === 0 || j === 1 ? 'text-left' : 'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {simPaged.map((sim, i) => {
                      const a   = simAssumptions(sim);
                      const fv  = simFinalValue(sim);
                      const inv = a ? a.monthly_contribution * a.years * 12 : null;
                      const ret = fv !== null && inv !== null ? fv - inv : null;

                      return (
                        <React.Fragment key={i}>
                          <tr className={`${rowHov} cursor-pointer transition`}
                            onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                            <td className={`px-4 py-3 font-semibold ${text}`}>{sim.scenario_name || 'What-If'}</td>
                            <td className={`px-4 py-3 text-xs ${muted}`}>
                              {a ? `₹${a.monthly_contribution?.toLocaleString('en-IN')}/mo · ${a.expected_return}% · ${a.years}y` : '—'}
                            </td>
                            <td className={`text-right px-4 py-3 font-bold ${fv !== null ? 'text-indigo-600' : muted}`}>{fv !== null ? fc(fv) : '—'}</td>
                            <td className={`text-right px-4 py-3 ${muted}`}>{inv !== null ? fc(inv) : '—'}</td>
                            <td className={`text-right px-4 py-3 font-semibold ${ret === null ? muted : ret >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {ret !== null ? fc(ret) : '—'}
                            </td>
                            <td className={`text-right px-4 py-3 text-xs ${muted}`}>{fd(sim.created_at)}</td>
                          </tr>
                          {expandedRow === i && (
                            <tr>
                              <td colSpan="6" className={`px-4 py-4 ${dark ? 'bg-gray-800/50' : 'bg-slate-50'}`}>
                                <div className="grid grid-cols-3 gap-4 text-xs">
                                  <div>
                                    <p className={`font-semibold mb-1 ${text}`}>Assumptions</p>
                                    <p className={muted}>Monthly: {fc(a?.monthly_contribution)}</p>
                                    <p className={muted}>Return: {a?.expected_return}% p.a.</p>
                                    <p className={muted}>Duration: {a?.years} years</p>
                                  </div>
                                  <div>
                                    <p className={`font-semibold mb-1 ${text}`}>Results</p>
                                    <p className={muted}>Final: <span className="text-indigo-600 font-bold">{fv !== null ? fc(fv) : '—'}</span></p>
                                    <p className={muted}>Invested: {inv !== null ? fc(inv) : '—'}</p>
                                    <p className={muted}>Returns: <span className={ret >= 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>{ret !== null ? fc(ret) : '—'}</span></p>
                                  </div>
                                  <div>
                                    <p className={`font-semibold mb-1 ${text}`}>Info</p>
                                    <p className={muted}>Created: {fd(sim.created_at)}</p>
                                    <p className={muted}>Name: {sim.scenario_name || 'What-If Scenario'}</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={simPage} total={Math.ceil(simulations.length / PER_PAGE)} setPage={setSimPage} dark={dark} />
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Reports;