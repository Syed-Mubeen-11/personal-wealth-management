import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { FileText, Download, ChevronDown, ChevronUp, TrendingUp, Target, Activity } from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);

const fmtPct = (n) => `${n >= 0 ? '+' : ''}${(n ?? 0).toFixed(2)}%`;

const today = () => new Date().toISOString().slice(0, 10);

// ── skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow({ cols = 5 }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                </td>
            ))}
        </tr>
    );
}

// ── section wrapper ───────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
                <Icon size={20} className="text-[#1B3C53]" />
                <h2 className="text-lg font-bold text-[#1B3C53]">{title}</h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

// ── empty state ───────────────────────────────────────────────────────────────
function Empty({ message }) {
    return (
        <div className="py-10 text-center text-gray-400 text-sm">{message}</div>
    );
}

// ── error banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ message }) {
    return (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {message}
        </div>
    );
}

// ── export button ─────────────────────────────────────────────────────────────
function ExportButton({ label, onClick, loading, variant = 'primary' }) {
    const base = 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50';
    const styles =
        variant === 'primary'
            ? `${base} bg-[#1B3C53] text-white hover:bg-[#234C6A]`
            : `${base} border border-[#1B3C53] text-[#1B3C53] hover:bg-gray-50`;
    return (
        <button className={styles} onClick={onClick} disabled={loading}>
            {loading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <Download size={16} />
            )}
            {label}
        </button>
    );
}

// ── A. Portfolio Summary ──────────────────────────────────────────────────────
function PortfolioSection() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const [ovRes, posRes] = await Promise.all([
                    api.get('/portfolio/overview'),
                    api.get('/portfolio/positions?page=1&limit=100'),
                ]);
                setData({ overview: ovRes.data, positions: posRes.data.data || [] });
            } catch {
                setError('Failed to load portfolio data.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const best = data?.positions.reduce(
        (a, b) => (b.gain_loss_percent > (a?.gain_loss_percent ?? -Infinity) ? b : a),
        null
    );
    const worst = data?.positions.reduce(
        (a, b) => (b.gain_loss_percent < (a?.gain_loss_percent ?? Infinity) ? b : a),
        null
    );

    return (
        <Section icon={TrendingUp} title="Portfolio Summary">
            {error && <ErrorBanner message={error} />}

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Portfolio Value', value: fmt(data?.overview?.total_portfolio_value), color: 'text-[#1B3C53]' },
                    { label: "Today's Change", value: fmtPct(data?.overview?.performance_today_percent), color: data?.overview?.performance_today_percent >= 0 ? 'text-green-600' : 'text-red-500' },
                    { label: 'Best Performer', value: best ? `${best.symbol} ${fmtPct(best.gain_loss_percent)}` : '—', color: 'text-green-600' },
                    { label: 'Worst Performer', value: worst ? `${worst.symbol} ${fmtPct(worst.gain_loss_percent)}` : '—', color: 'text-red-500' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{label}</p>
                        {loading
                            ? <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                            : <p className={`text-xl font-bold ${color}`}>{value}</p>}
                    </div>
                ))}
            </div>

            {/* Positions table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 uppercase text-xs border-b border-gray-100">
                            {['Symbol', 'Units', 'Cost Basis', 'Current Value', 'Gain / Loss %'].map(h => (
                                <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                            : data?.positions.length === 0
                                ? <tr><td colSpan={5}><Empty message="No positions yet." /></td></tr>
                                : data.positions.map(p => (
                                    <tr key={p.symbol} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 font-semibold text-[#1B3C53]">{p.symbol}</td>
                                        <td className="px-4 py-3">{p.units}</td>
                                        <td className="px-4 py-3">{fmt(p.avg_buy_price * p.units)}</td>
                                        <td className="px-4 py-3">{fmt(p.market_value)}</td>
                                        <td className={`px-4 py-3 font-semibold ${p.gain_loss_percent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {fmtPct(p.gain_loss_percent)}
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </Section>
    );
}

// ── B. Goals Progress ─────────────────────────────────────────────────────────
function GoalsSection() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/goals?limit=100');
                setGoals(res.data.data || res.data || []);
            } catch {
                setError('Failed to load goals.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Estimate progress: months elapsed × monthly_contribution / target_amount
    const progress = (goal) => {
        if (!goal.target_amount || goal.target_amount === 0) return 0;
        if (!goal.monthly_contribution) return 0;
        const created = goal.created_at ? new Date(goal.created_at) : new Date();
        const months = Math.max(
            1,
            Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 30))
        );
        const saved = months * goal.monthly_contribution;
        return Math.min(100, Math.round((saved / goal.target_amount) * 100));
    };

    const statusColor = (s) =>
        s === 'completed' ? 'bg-green-100 text-green-700'
        : s === 'active'  ? 'bg-blue-100 text-blue-700'
        : 'bg-gray-100 text-gray-600';

    return (
        <Section icon={Target} title="Goals Progress">
            {error && <ErrorBanner message={error} />}
            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                            <div className="h-3 bg-gray-200 rounded w-full" />
                        </div>
                    ))}
                </div>
            ) : goals.length === 0 ? (
                <Empty message="No goals found. Add goals to track progress." />
            ) : (
                <div className="space-y-5">
                    {goals.map(g => {
                        const pct = progress(g);
                        return (
                            <div key={g.id}>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-800 text-sm">{g.goal_name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(g.status)}`}>
                                            {g.status}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500">{pct}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : 'bg-[#1B3C53]'}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>Monthly: {fmt(g.monthly_contribution)}</span>
                                    <span>Target: {fmt(g.target_amount)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Section>
    );
}

// ── C. Simulation History ─────────────────────────────────────────────────────
function SimulationsSection() {
    const PAGE_SIZE = 10;
    const [sims, setSims] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(null);

    const fetchPage = useCallback(async (p) => {
        setLoading(true);
        try {
            const offset = (p - 1) * PAGE_SIZE;
            const res = await api.get(`/api/simulations?limit=${PAGE_SIZE}&offset=${offset}`);
            setSims(res.data.data || []);
            setTotal(res.data.total ?? res.data.data?.length ?? 0);
        } catch {
            setError('Failed to load simulation history.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPage(page); }, [page, fetchPage]);

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const toggle = (id) => setExpanded(prev => (prev === id ? null : id));

    const summarise = (results) => {
        if (!results) return '—';
        const keys = ['total_value', 'total_wealth', 'corpus_at_retirement', 'monthly_payment'];
        for (const k of keys) {
            if (results[k] != null) return `${k.replace(/_/g, ' ')}: ${fmt(results[k])}`;
        }
        return JSON.stringify(results).slice(0, 80) + '…';
    };

    return (
        <Section icon={Activity} title="Simulation History">
            {error && <ErrorBanner message={error} />}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 uppercase text-xs border-b border-gray-100">
                            {['Scenario', 'Assumptions', 'Result Summary', 'Date', ''].map(h => (
                                <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                            : sims.length === 0
                                ? <tr><td colSpan={5}><Empty message="No simulations saved yet." /></td></tr>
                                : sims.map(s => (
                                    <>
                                        <tr
                                            key={s.id}
                                            className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => toggle(s.id)}
                                        >
                                            <td className="px-4 py-3 font-medium text-[#1B3C53]">{s.scenario_name}</td>
                                            <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                                                {s.assumptions
                                                    ? Object.entries(s.assumptions)
                                                        .slice(0, 2)
                                                        .map(([k, v]) => `${k}: ${v}`)
                                                        .join(', ')
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">{summarise(s.results)}</td>
                                            <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                                                {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-400">
                                                {expanded === s.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </td>
                                        </tr>
                                        {expanded === s.id && (
                                            <tr key={`${s.id}-detail`} className="bg-gray-50">
                                                <td colSpan={5} className="px-6 py-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="font-semibold text-gray-700 mb-2">Assumptions</p>
                                                            <pre className="bg-white rounded p-3 border border-gray-100 text-xs text-gray-600 overflow-auto max-h-40">
                                                                {JSON.stringify(s.assumptions, null, 2)}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-700 mb-2">Full Results</p>
                                                            <pre className="bg-white rounded p-3 border border-gray-100 text-xs text-gray-600 overflow-auto max-h-40">
                                                                {JSON.stringify(s.results, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                        Page {page} of {totalPages} ({total} total)
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </Section>
    );
}

// ── Main Reports Page ─────────────────────────────────────────────────────────
export default function Reports() {
    const [pdfLoading, setPdfLoading] = useState(false);
    const [csvLoading, setCsvLoading] = useState(false);
    const [csvScope, setCsvScope] = useState('portfolio');
    const [exportError, setExportError] = useState(null);

    const downloadBlob = useCallback(async (url, filename, mimeType, setLoading) => {
        setLoading(true);
        setExportError(null);
        try {
            const res = await api.get(url, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: mimeType });
            const href = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = href;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(href);
        } catch {
            setExportError('Export failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handlePDF = () =>
        downloadBlob(
            '/api/v1/reports/pdf?scope=full',
            `wealth-report-${today()}.pdf`,
            'application/pdf',
            setPdfLoading
        );

    const handleCSV = () =>
        downloadBlob(
            `/api/v1/reports/csv?data_type=${csvScope}`,
            `${csvScope}-${today()}.csv`,
            'text/csv',
            setCsvLoading
        );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <FileText size={28} className="text-[#1B3C53]" />
                    <div>
                        <h1 className="text-2xl font-bold text-[#1B3C53]">Reports</h1>
                        <p className="text-sm text-gray-500">Portfolio summary, goals progress &amp; simulation history</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {exportError && <span className="text-red-500 text-sm">{exportError}</span>}
                    <ExportButton
                        label="Download PDF"
                        onClick={handlePDF}
                        loading={pdfLoading}
                        variant="primary"
                    />
                    <select
                        value={csvScope}
                        onChange={(e) => setCsvScope(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1B3C53] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3C53]/20"
                    >
                        <option value="portfolio">Portfolio</option>
                        <option value="goals">Goals</option>
                        <option value="transactions">Transactions</option>
                    </select>
                    <ExportButton
                        label="Export CSV"
                        onClick={handleCSV}
                        loading={csvLoading}
                        variant="secondary"
                    />
                </div>
            </div>

            {/* Sections */}
            <PortfolioSection />
            <GoalsSection />
            <SimulationsSection />
        </div>
    );
}
