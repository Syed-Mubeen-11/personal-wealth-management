import { useState, useEffect, useCallback } from 'react'
import {
  Scale, RefreshCw, TrendingUp, TrendingDown, Minus,
  CheckCircle2, AlertCircle, Loader2, ChevronUp, ChevronDown,
  ArrowUp, ArrowDown, Info
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList,
  Legend
} from 'recharts'
import { recommendationsApi } from '../services/recommendationsApi'
import RiskProfileBadge from '../components/common/RiskProfileBadge'
import { useAuth } from '../context/AuthContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0)
const pct = n => `${(parseFloat(n ?? 0) * 100).toFixed(1)}%`

const ASSET_COLORS = {
  stocks:       '#a855f7',
  etfs:         '#06b6d4',
  mutual_funds: '#10b981',
  bonds:        '#f59e0b',
  cash:         '#64748b',
}
const FALLBACK = ['#a855f7','#06b6d4','#10b981','#f59e0b','#f43f5e','#ec4899']
const getColor = (key, i) => ASSET_COLORS[key] || FALLBACK[i % FALLBACK.length]
const label = key => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

function showToast(msg, type = 'success') {
  const el = document.createElement('div')
  el.textContent = msg
  el.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:${type === 'error' ? '#f43f5e' : '#10b981'};
    color:white;padding:10px 18px;border-radius:10px;
    font-size:13px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.4);
    animation:fadeUp .3s ease;
  `
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 3000)
}

// ── Drift indicator ───────────────────────────────────────────────────────────

function DriftBadge({ drift }) {
  const abs = Math.abs(drift * 100)
  if (drift > 0.02)  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md"
      style={{ background: 'rgba(244,63,94,0.12)', color: '#fb7185' }}>
      <ArrowUp size={11} /> +{abs.toFixed(1)}%
    </span>
  )
  if (drift < -0.02) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md"
      style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>
      <ArrowDown size={11} /> -{abs.toFixed(1)}%
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md"
      style={{ background: 'rgba(100,116,139,0.12)', color: '#94a3b8' }}>
      <Minus size={11} /> {abs.toFixed(1)}%
    </span>
  )
}

// ── Comparison bar chart ──────────────────────────────────────────────────────

function ComparisonChart({ currentWeights, targetWeights }) {
  const data = Object.keys(targetWeights).map(key => ({
    name:    label(key),
    key,
    Current: parseFloat((currentWeights[key] ?? 0) * 100).toFixed(1),
    Target:  parseFloat((targetWeights[key]  ?? 0) * 100).toFixed(1),
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 80]} />
        <ReTooltip
          formatter={(val, name) => [`${val}%`, name]}
          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 8, fontSize: 12 }}
          itemStyle={{ color: 'var(--text-primary)' }}
          cursor={{ fill: 'rgba(168,85,247,0.04)' }}
        />
        <Legend formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
        <Bar dataKey="Current" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={32}>
          <LabelList dataKey="Current" position="top" formatter={v => `${v}%`} style={{ fill: 'var(--text-muted)', fontSize: 9 }} />
        </Bar>
        <Bar dataKey="Target" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={32}>
          <LabelList dataKey="Target" position="top" formatter={v => `${v}%`} style={{ fill: 'var(--text-muted)', fontSize: 9 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Radar chart ───────────────────────────────────────────────────────────────

function RadarComparison({ currentWeights, targetWeights }) {
  const data = Object.keys(targetWeights).map(key => ({
    subject: label(key),
    Current: parseFloat((currentWeights[key] ?? 0) * 100),
    Target:  parseFloat((targetWeights[key]  ?? 0) * 100),
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="var(--bg-border)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
        <PolarRadiusAxis angle={30} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} domain={[0, 60]} />
        <Radar name="Current" dataKey="Current" stroke="#a855f7" fill="#a855f7" fillOpacity={0.18} strokeWidth={2} />
        <Radar name="Target"  dataKey="Target"  stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.12} strokeWidth={2} strokeDasharray="4 2" />
        <ReTooltip
          formatter={v => [`${v}%`]}
          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 8, fontSize: 12 }}
          itemStyle={{ color: 'var(--text-primary)' }}
        />
        <Legend formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ── Allocation comparison table ───────────────────────────────────────────────

function AllocationTable({ currentWeights, targetWeights }) {
  const [sortDir, setSortDir] = useState('desc')

  const rows = Object.keys(targetWeights).map(key => ({
    key,
    current: currentWeights[key] ?? 0,
    target:  targetWeights[key]  ?? 0,
    drift:   (currentWeights[key] ?? 0) - (targetWeights[key] ?? 0),
  })).sort((a, b) =>
    sortDir === 'desc'
      ? Math.abs(b.drift) - Math.abs(a.drift)
      : Math.abs(a.drift) - Math.abs(b.drift)
  )

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bg-border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--bg-surface)' }}>
            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Asset Class</th>
            <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Current</th>
            <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Target</th>
            <th className="text-right px-4 py-3 text-xs font-semibold cursor-pointer select-none"
              style={{ color: 'var(--purple)' }}
              onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>
              <span className="inline-flex items-center gap-1">
                Drift {sortDir === 'desc' ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
              </span>
            </th>
            <th className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              <span className="sr-only">Status</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.key} className="dark-tr" style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-surface)' }}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: getColor(row.key, i) }} />
                  <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{label(row.key)}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-num" style={{ color: 'var(--text-secondary)' }}>
                {pct(row.current)}
              </td>
              <td className="px-4 py-3 text-right font-num" style={{ color: 'var(--text-secondary)' }}>
                {pct(row.target)}
              </td>
              <td className="px-4 py-3 text-right">
                <DriftBadge drift={row.drift} />
              </td>
              <td className="px-4 py-3">
                {/* Mini progress bar showing gap */}
                <div className="w-16 flex flex-col gap-0.5">
                  <div className="h-1 rounded-full" style={{ background: 'var(--bg-border)' }}>
                    <div className="h-1 rounded-full transition-all"
                      style={{ width: `${Math.min(row.current * 100 / Math.max(row.target, 0.01), 100) * 100}%`, background: getColor(row.key, i) }} />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Suggestion card ───────────────────────────────────────────────────────────

function SuggestionCard({ s, i }) {
  const isBuy = s.action === 'BUY'
  return (
    <div className="rounded-xl p-4 flex items-center justify-between gap-4 fade-up"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${isBuy ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
        borderLeft: `3px solid ${isBuy ? '#10b981' : '#f43f5e'}`,
      }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isBuy ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
          }}>
          {isBuy
            ? <TrendingUp  size={18} style={{ color: '#10b981' }} />
            : <TrendingDown size={18} style={{ color: '#f43f5e' }} />}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md"
              style={{
                background: isBuy ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                color: isBuy ? '#34d399' : '#fb7185',
                border: `1px solid ${isBuy ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
              }}>
              {s.action}
            </span>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {label(s.asset_class)}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Current: {pct(s.current_weight)} → Target: {pct(s.target_weight)}
          </p>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-bold font-num text-sm" style={{ color: 'var(--text-primary)' }}>
          {fmt(s.estimated_value)}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          est. trade value
        </p>
        <div className="mt-1">
          <DriftBadge drift={s.drift_impact * (isBuy ? -1 : 1)} />
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RebalancePage() {
  const { user } = useAuth()
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [chartMode, setChartMode] = useState('bar') // 'bar' | 'radar'
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const res = await recommendationsApi.getRebalance()
      setData(res.data)
    } catch (e) {
      setError('Failed to load rebalance data. Make sure the backend is running.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleRefresh() {
    setRefreshing(true)
    await load(true)
    showToast('Rebalance data refreshed!')
  }

  const isBalanced = data && (data.suggestions?.length === 0)
  const totalDrift = data
    ? Object.keys(data.targetWeights || {}).reduce((sum, k) => {
        return sum + Math.abs((data.currentWeights[k] ?? 0) - (data.targetWeights[k] ?? 0))
      }, 0) / 2
    : 0

  return (
    <div className="p-6 max-w-5xl mx-auto fade-up">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Portfolio Rebalance
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Compare your current allocation vs your target
            </p>
            {user?.risk_profile && <RiskProfileBadge riskProfile={user.risk_profile} size="sm" />}
          </div>
        </div>

        <button
          className="btn-ghost flex items-center gap-2"
          onClick={handleRefresh}
          disabled={loading || refreshing}
          aria-label="Refresh rebalance data"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl p-4 mb-6 flex items-center gap-3"
          style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <AlertCircle size={16} style={{ color: 'var(--red)', flexShrink: 0 }} />
          <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>
        </div>
      )}

      {/* ── Loading ────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--purple)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading allocation data…</p>
          </div>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────────────── */}
      {!loading && !error && data && (
        <div className="space-y-6">

          {/* ── Status banner ─────────────────────────────────────────────── */}
          {isBalanced ? (
            <div className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: '#10b981' }}>
                  Your portfolio is well-balanced!
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  All asset classes are within ±2% of their target weights.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Info size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: '#f59e0b' }}>
                  Rebalancing recommended — {(totalDrift * 100).toFixed(1)}% overall drift
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {data.suggestions?.length} action{data.suggestions?.length !== 1 ? 's' : ''} suggested to bring your portfolio in line with your {user?.risk_profile || 'target'} allocation.
                </p>
              </div>
            </div>
          )}

          {/* ── Summary stat cards ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.keys(data.targetWeights).map((key, i) => {
              const current = data.currentWeights[key] ?? 0
              const target  = data.targetWeights[key]  ?? 0
              const drift   = current - target
              return (
                <div key={key} className="stat-card text-center">
                  <div className="w-2 h-2 rounded-full mx-auto mb-2"
                    style={{ background: getColor(key, i) }} />
                  <p className="text-xs mb-1 truncate" style={{ color: 'var(--text-muted)' }}>
                    {label(key)}
                  </p>
                  <p className="font-bold font-num text-lg" style={{ color: 'var(--text-primary)' }}>
                    {pct(current)}
                  </p>
                  <p className="text-xs font-num" style={{ color: 'var(--text-muted)' }}>
                    target {pct(target)}
                  </p>
                  <div className="mt-2">
                    <DriftBadge drift={drift} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Charts ────────────────────────────────────────────────────── */}
          <div className="dark-card p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Allocation Visualisation
              </h2>
              <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                {[
                  { key: 'bar',   label: 'Bar Chart' },
                  { key: 'radar', label: 'Radar' },
                ].map(m => (
                  <button key={m.key}
                    className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                    style={chartMode === m.key
                      ? { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--bg-border)' }
                      : { color: 'var(--text-muted)' }}
                    onClick={() => setChartMode(m.key)}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {chartMode === 'bar'
              ? <ComparisonChart currentWeights={data.currentWeights} targetWeights={data.targetWeights} />
              : <RadarComparison currentWeights={data.currentWeights} targetWeights={data.targetWeights} />
            }
          </div>

          {/* ── Comparison table ──────────────────────────────────────────── */}
          <div className="dark-card p-5">
            <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Allocation Breakdown
            </h2>
            <AllocationTable
              currentWeights={data.currentWeights}
              targetWeights={data.targetWeights}
            />
          </div>

          {/* ── Suggested actions ─────────────────────────────────────────── */}
          <div className="dark-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Suggested Actions
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Trades to bring your portfolio in line with your target allocation
                </p>
              </div>
              {data.suggestions?.length > 0 && (
                <span className="badge-yellow">
                  {data.suggestions.length} action{data.suggestions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {data.suggestions?.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 size={32} className="mb-3" style={{ color: '#10b981' }} />
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  No actions needed
                </p>
                <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--text-muted)' }}>
                  Your portfolio is within ±2% of target for every asset class. Great job!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.suggestions.map((s, i) => (
                  <SuggestionCard key={i} s={s} i={i} />
                ))}
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-5 rounded-xl p-3 flex items-start gap-2"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
              <Info size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
                These suggestions are estimates based on your current portfolio value and target allocation. 
                Actual trade amounts will vary based on market prices at execution. 
                This is not financial advice.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
