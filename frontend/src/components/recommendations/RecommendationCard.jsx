import { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Legend,
} from 'recharts'
import { CheckCircle, ChevronDown, ChevronUp, BarChart2, PieChart as PieIcon } from 'lucide-react'
import { useMarkAsRead } from '../../hooks/useRecommendations'

// Asset class colour map
const ASSET_COLORS = {
  stocks:       '#a855f7',
  equities:     '#a855f7',
  bonds:        '#06b6d4',
  fixed_income: '#06b6d4',
  real_estate:  '#f59e0b',
  cash:         '#10b981',
  commodities:  '#f43f5e',
  crypto:       '#ec4899',
  other:        '#6b7280',
}

const getColor = (key) =>
  ASSET_COLORS[key?.toLowerCase()] ?? ASSET_COLORS.other

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0)

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

// ── Doughnut Chart ──────────────────────────────────────────────────────────
function AllocationDoughnut({ allocation }) {
  const entries = Object.entries(allocation ?? {})
  const total = entries.reduce((s, [, v]) => s + v, 0)

  // Merge entries < 2% into "Other"
  const merged = []
  let otherVal = 0
  for (const [key, val] of entries) {
    const pct = total ? (val / total) * 100 : 0
    if (pct < 2) otherVal += val
    else merged.push({ name: key, value: val, pct: pct.toFixed(1) })
  }
  if (otherVal > 0) merged.push({ name: 'Other', value: otherVal, pct: ((otherVal / total) * 100).toFixed(1) })

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="rounded-xl px-3 py-2 text-xs shadow-xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}>
        <p className="font-semibold capitalize" style={{ color: getColor(d.name) }}>{d.name}</p>
        <p style={{ color: 'var(--text-primary)' }}>{fmt(d.value)}</p>
        <p style={{ color: 'var(--text-muted)' }}>{d.pct}%</p>
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={merged}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            dataKey="value"
            nameKey="name"
          >
            {merged.map((entry) => (
              <Cell key={entry.name} fill={getColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 justify-center">
        {merged.map((e) => (
          <span key={e.name} className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: getColor(e.name) }} />
            <span className="capitalize">{e.name}</span>
            <span style={{ color: 'var(--text-muted)' }}>{e.pct}%</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Stacked Bar Chart ────────────────────────────────────────────────────────
function AllocationBarChart({ allocation }) {
  const entries = Object.entries(allocation ?? {})
  const total = entries.reduce((s, [, v]) => s + v, 0)
  const data = [{ name: 'Allocation' }]
  const keys = []

  for (const [key, val] of entries) {
    const pct = total ? parseFloat(((val / total) * 100).toFixed(1)) : 0
    data[0][key] = pct
    keys.push(key)
  }

  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis type="number" hide domain={[0, 100]} />
        <YAxis type="category" hide />
        <Tooltip
          formatter={(val, name) => [`${val}%`, name]}
          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 8, fontSize: 11 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }}
          formatter={(val) => <span className="capitalize">{val}</span>}
        />
        {keys.map((k) => (
          <Bar key={k} dataKey={k} stackId="a" fill={getColor(k)} radius={keys.indexOf(k) === keys.length - 1 ? [0, 4, 4, 0] : 0} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Main Card ────────────────────────────────────────────────────────────────
export default function RecommendationCard({ rec }) {
  const [chartView, setChartView] = useState('pie') // 'pie' | 'bar'
  const [expanded, setExpanded]   = useState(false)
  const [toast, setToast]         = useState('')
  const { mutate: markRead, isPending } = useMarkAsRead()

  const allocation = rec.suggested_allocation ?? {}
  const assetClass = rec.asset_class ?? Object.keys(allocation)[0] ?? 'other'
  const accentColor = getColor(assetClass)

  const handleMarkRead = () => {
    markRead(rec.id, {
      onSuccess: () => {
        setToast('Marked as read!')
        setTimeout(() => setToast(''), 2500)
      },
      onError: () => {
        setToast('Failed — please retry.')
        setTimeout(() => setToast(''), 2500)
      },
    })
  }

  const breakdownPairs = Object.entries(allocation)

  return (
    <div
      className="rounded-2xl overflow-hidden transition-opacity"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--bg-border)',
        borderLeft: `4px solid ${accentColor}`,
        opacity: rec.is_read ? 0.65 : 1,
      }}
      aria-label={`Recommendation: ${rec.title}`}
    >
      {/* Toast */}
      {toast && (
        <div
          className="text-xs px-4 py-2 font-medium"
          style={{ background: accentColor, color: 'white' }}
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-display font-semibold text-base leading-snug" style={{ color: 'var(--text-primary)' }}>
              {rec.title}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {rec.created_at ? fmtDate(rec.created_at) : ''}
            </p>
          </div>
          {rec.is_read && (
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
              <CheckCircle size={12} /> Read
            </span>
          )}
        </div>

        {/* Body text */}
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
          {rec.recommendation_text ?? rec.text ?? ''}
        </p>

        {/* Chart toggle */}
        {breakdownPairs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Suggested Allocation
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setChartView('pie')}
                  aria-label="Pie chart view"
                  className="p-1 rounded-lg transition-colors"
                  style={{
                    background: chartView === 'pie' ? 'rgba(168,85,247,0.15)' : 'transparent',
                    color: chartView === 'pie' ? '#a855f7' : 'var(--text-muted)',
                  }}
                >
                  <PieIcon size={14} />
                </button>
                <button
                  onClick={() => setChartView('bar')}
                  aria-label="Bar chart view"
                  className="p-1 rounded-lg transition-colors"
                  style={{
                    background: chartView === 'bar' ? 'rgba(168,85,247,0.15)' : 'transparent',
                    color: chartView === 'bar' ? '#a855f7' : 'var(--text-muted)',
                  }}
                >
                  <BarChart2 size={14} />
                </button>
              </div>
            </div>

            {chartView === 'pie'
              ? <AllocationDoughnut allocation={allocation} />
              : <AllocationBarChart allocation={allocation} />
            }
          </div>
        )}

        {/* Full Breakdown expansion panel */}
        {breakdownPairs.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: accentColor }}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? 'Hide' : 'View'} Full Breakdown
            </button>

            {expanded && (
              <div
                className="mt-3 rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--bg-border)' }}
              >
                <table className="w-full text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface)' }}>
                      <th className="text-left px-3 py-2 font-medium capitalize" style={{ color: 'var(--text-muted)' }}>Asset Class</th>
                      <th className="text-right px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Value / %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdownPairs.map(([key, val]) => (
                      <tr key={key} style={{ borderTop: '1px solid var(--bg-border)' }}>
                        <td className="px-3 py-2 capitalize flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: getColor(key) }} />
                          {key.replace(/_/g, ' ')}
                        </td>
                        <td className="px-3 py-2 text-right font-mono" style={{ color: 'var(--text-primary)' }}>
                          {typeof val === 'number' && val < 1 ? `${(val * 100).toFixed(1)}%` : fmt(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Mark as Read */}
        {!rec.is_read && (
          <button
            onClick={handleMarkRead}
            disabled={isPending}
            className="mt-4 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: 'rgba(168,85,247,0.1)',
              color: '#a855f7',
              opacity: isPending ? 0.6 : 1,
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
            aria-label="Mark recommendation as read"
          >
            {isPending ? 'Saving…' : '✓ Mark as Read'}
          </button>
        )}
      </div>
    </div>
  )
}