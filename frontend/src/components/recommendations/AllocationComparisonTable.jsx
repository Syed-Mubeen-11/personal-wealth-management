import { useState } from 'react'
import { ArrowUp, ArrowDown, Minus, ChevronUp, ChevronDown } from 'lucide-react'

function DriftCell({ drift }) {
  const abs = Math.abs(drift)
  let bg, color, icon

  if (drift > 0.02) {
    bg = 'rgba(244,63,94,0.12)'; color = '#fb7185'
    icon = <ArrowUp size={11} />
  } else if (drift < -0.02) {
    bg = 'rgba(16,185,129,0.12)'; color = '#34d399'
    icon = <ArrowDown size={11} />
  } else {
    bg = 'transparent'; color = 'var(--text-muted)'
    icon = <Minus size={11} />
  }

  return (
    <td className="px-3 py-2.5 text-right">
      <span className="inline-flex items-center gap-1 font-num text-xs font-semibold rounded-md px-2 py-0.5"
        style={{ background: bg, color }}>
        {icon}
        {(abs * 100).toFixed(1)}%
      </span>
    </td>
  )
}

export default function AllocationComparisonTable({ currentWeights = {}, targetWeights = {} }) {
  const [sortDir, setSortDir] = useState('desc') // 'asc' | 'desc'

  const rows = Object.keys(targetWeights).map(key => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    key,
    current: currentWeights[key] ?? 0,
    target:  targetWeights[key] ?? 0,
    drift:   (currentWeights[key] ?? 0) - (targetWeights[key] ?? 0),
  }))

  rows.sort((a, b) =>
    sortDir === 'desc'
      ? Math.abs(b.drift) - Math.abs(a.drift)
      : Math.abs(a.drift) - Math.abs(b.drift)
  )

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--bg-border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--bg-surface)' }}>
            <th className="text-left px-3 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Asset Class
            </th>
            <th className="text-right px-3 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Current %
            </th>
            <th className="text-right px-3 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Target %
            </th>
            <th className="text-right px-3 py-2.5 text-xs font-semibold cursor-pointer select-none"
              style={{ color: 'var(--purple)' }}
              scope="col"
              onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
            >
              <span className="inline-flex items-center gap-1">
                Drift
                {sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.key} className="dark-tr" style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-surface)' }}>
              <td className="px-3 py-2.5" style={{ color: 'var(--text-primary)' }}>{row.label}</td>
              <td className="px-3 py-2.5 text-right font-num" style={{ color: 'var(--text-secondary)' }}>
                {(row.current * 100).toFixed(1)}%
              </td>
              <td className="px-3 py-2.5 text-right font-num" style={{ color: 'var(--text-secondary)' }}>
                {(row.target * 100).toFixed(1)}%
              </td>
              <DriftCell drift={row.drift} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
