import { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { CheckCheck, ChevronDown, ChevronUp, BookOpen, BarChart2, PieChart as PieIcon } from 'lucide-react'

// Asset class colours matching the dark theme
const ASSET_COLORS = {
  stocks:       '#a855f7',
  etfs:         '#06b6d4',
  mutual_funds: '#10b981',
  bonds:        '#f59e0b',
  cash:         '#64748b',
}
const FALLBACK_COLORS = ['#a855f7','#06b6d4','#10b981','#f59e0b','#f43f5e','#ec4899']

const ASSET_BORDER_COLORS = {
  stocks:       '#7c3aed',
  etfs:         '#0891b2',
  mutual_funds: '#059669',
  bonds:        '#d97706',
  cash:         '#475569',
}

function getAllocData(suggestedAllocation) {
  if (!suggestedAllocation) return []
  const entries = Object.entries(suggestedAllocation)
  const OTHER_THRESHOLD = 0.02
  const main = []
  let otherTotal = 0

  entries.forEach(([key, value]) => {
    const v = parseFloat(value)
    if (v < OTHER_THRESHOLD) {
      otherTotal += v
    } else {
      main.push({
        name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        key,
        value: parseFloat((v * 100).toFixed(1)),
      })
    }
  })

  if (otherTotal > 0) {
    main.push({ name: 'Other', key: 'other', value: parseFloat((otherTotal * 100).toFixed(1)) })
  }
  return main
}

function getColor(key, idx) {
  return ASSET_COLORS[key] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
}

function getBorderColor(assetClass) {
  return ASSET_BORDER_COLORS[assetClass] || '#7c3aed'
}

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })

export default function RecommendationCard({ rec, onMarkRead }) {
  const [chartMode, setChartMode]   = useState('donut') // 'donut' | 'bar'
  const [expanded, setExpanded]     = useState(false)
  const [marking,  setMarking]      = useState(false)

  const allocData = getAllocData(rec.suggested_allocation)
  const dominantAsset = Object.entries(rec.suggested_allocation || {})
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'stocks'
  const borderColor = getBorderColor(dominantAsset)

  async function handleMarkRead() {
    if (rec.is_read || marking) return
    setMarking(true)
    try {
      await onMarkRead(rec.id)
    } finally {
      setMarking(false)
    }
  }

  return (
    <div
      className="dark-card fade-up"
      style={{
        borderLeft: `3px solid ${borderColor}`,
        opacity: rec.is_read ? 0.75 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Header */}
      <div className="p-5 pb-3 flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)', maxWidth: 400 }}>
              {rec.title}
            </h3>
            {rec.is_read && (
              <span className="badge-green flex items-center gap-1">
                <CheckCheck size={10} /> Read
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(rec.created_at)}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Chart toggle */}
          <button
            className="btn-ghost py-1 px-2 text-xs flex items-center gap-1"
            onClick={() => setChartMode(m => m === 'donut' ? 'bar' : 'donut')}
            aria-label={`Switch to ${chartMode === 'donut' ? 'bar' : 'doughnut'} chart`}
          >
            {chartMode === 'donut' ? <BarChart2 size={13} /> : <PieIcon size={13} />}
            {chartMode === 'donut' ? 'Bar' : 'Chart'}
          </button>

          {/* Mark as read */}
          {!rec.is_read && (
            <button
              className="btn-ghost py-1 px-2 text-xs flex items-center gap-1"
              onClick={handleMarkRead}
              disabled={marking}
              aria-label="Mark recommendation as read"
            >
              <CheckCheck size={13} />
              {marking ? 'Saving…' : 'Mark Read'}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-4">
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {rec.recommendation_text}
        </p>

        {/* Chart */}
        {allocData.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', padding: '12px 8px' }}>
            {chartMode === 'donut' ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={allocData}
                    innerRadius="55%"
                    outerRadius="78%"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {allocData.map((entry, idx) => (
                      <Cell
                        key={entry.key}
                        fill={getColor(entry.key, idx)}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, '']}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend
                    formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{value}</span>}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={allocData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={v => `${v}%`}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Target']}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                    cursor={{ fill: 'rgba(168,85,247,0.06)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {allocData.map((entry, idx) => (
                      <Cell key={entry.key} fill={getColor(entry.key, idx)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Expansion panel */}
        <button
          className="flex items-center gap-1 mt-3 text-xs font-medium"
          style={{ color: 'var(--purple)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          aria-label="View full breakdown"
        >
          <BookOpen size={12} />
          View Full Breakdown
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <div
          style={{
            overflow: 'hidden',
            maxHeight: expanded ? 400 : 0,
            transition: 'max-height 0.3s ease',
          }}
        >
          <div className="mt-3 rounded-xl overflow-hidden" style={{ border: '1px solid var(--bg-border)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--bg-surface)' }}>
                  <th className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Asset Class</th>
                  <th className="text-right px-3 py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Target %</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(rec.suggested_allocation || {}).map(([k, v], i) => (
                  <tr key={k} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-surface)' }}>
                    <td className="px-3 py-2" style={{ color: 'var(--text-primary)' }}>
                      <span className="flex items-center gap-2">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: getColor(k, i), display: 'inline-block' }} />
                        {k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-num font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {(parseFloat(v) * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
