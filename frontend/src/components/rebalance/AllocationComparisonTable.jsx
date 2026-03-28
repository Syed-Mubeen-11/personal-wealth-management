import { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'

// Colour logic per spec:
//   green  = drift < -2%  (under-weight)
//   white  = drift within ±2%
//   red    = drift > +2%  (over-weight)
const driftStyle = (drift) => {
  if (drift > 2)  return { color: '#f43f5e', bg: 'rgba(244,63,94,0.10)'  }
  if (drift < -2) return { color: '#10b981', bg: 'rgba(16,185,129,0.10)' }
  return { color: 'var(--text-primary)', bg: 'transparent' }
}

const fmtPct = (n) => `${n >= 0 ? '+' : ''}${Number(n ?? 0).toFixed(2)}%`

export default function AllocationComparisonTable({ currentWeights = {}, targetWeights = {} }) {
  const [sortDesc, setSortDesc] = useState(true) // sort by absolute drift descending by default

  // Build rows
  const assetClasses = Array.from(
    new Set([...Object.keys(currentWeights), ...Object.keys(targetWeights)])
  )

  const rows = assetClasses.map((ac) => {
    const current = (currentWeights[ac] ?? 0) * 100
    const target  = (targetWeights[ac]  ?? 0) * 100
    const drift   = current - target
    return { ac, current, target, drift }
  })

  const sorted = [...rows].sort((a, b) =>
    sortDesc
      ? Math.abs(b.drift) - Math.abs(a.drift)
      : Math.abs(a.drift) - Math.abs(b.drift)
  )

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--bg-border)' }}
    >
      <div
        className="overflow-x-auto"
        role="region"
        aria-label="Allocation comparison table"
      >
        <table className="w-full text-sm" style={{ color: 'var(--text-secondary)' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)' }}>
              <th
                scope="col"
                className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                Asset Class
              </th>
              <th
                scope="col"
                className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                Current %
              </th>
              <th
                scope="col"
                className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                Target %
              </th>
              <th
                scope="col"
                className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide"
                style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}
              >
                <button
                  onClick={() => setSortDesc((v) => !v)}
                  className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
                  aria-label="Toggle drift sort order"
                >
                  Drift % <ArrowUpDown size={12} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const ds = driftStyle(row.drift)
              return (
                <tr
                  key={row.ac}
                  style={{
                    borderTop: i === 0 ? 'none' : '1px solid var(--bg-border)',
                    background: 'var(--bg-card)',
                  }}
                >
                  <td className="px-4 py-3 capitalize font-medium" style={{ color: 'var(--text-primary)' }}>
                    {row.ac.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {row.current.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {row.target.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="inline-block px-2 py-0.5 rounded-lg font-mono font-semibold text-xs"
                      style={{ background: ds.bg, color: ds.color }}
                    >
                      {fmtPct(row.drift)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}