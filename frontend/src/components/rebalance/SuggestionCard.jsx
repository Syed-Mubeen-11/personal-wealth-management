// SuggestionCard — renders one rebalance suggestion from the suggestions array
// Each suggestion: { action, symbol, quantity, estimatedTradeValue, driftImpact }

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0)

export default function SuggestionCard({ suggestion }) {
  const { action, symbol, quantity, estimatedTradeValue, driftImpact } = suggestion

  const isBuy  = action?.toUpperCase() === 'BUY'
  const isSell = action?.toUpperCase() === 'SELL'

  const actionStyle = isBuy
    ? { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'BUY'  }
    : { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',  label: 'SELL' }

  const driftNum = typeof driftImpact === 'number' ? driftImpact : parseFloat(driftImpact ?? 0)
  const driftPositive = driftNum >= 0

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}
      role="listitem"
      aria-label={`${action} ${quantity} units of ${symbol}`}
    >
      {/* Action badge */}
      <span
        className="flex-shrink-0 font-bold text-xs px-2.5 py-1 rounded-lg"
        style={{ background: actionStyle.bg, color: actionStyle.color, minWidth: 40, textAlign: 'center' }}
      >
        {actionStyle.label}
      </span>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          {symbol}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {quantity} units · {fmt(estimatedTradeValue)}
        </p>
      </div>

      {/* Drift impact */}
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Drift impact</p>
        <p
          className="text-sm font-semibold font-mono"
          style={{ color: driftPositive ? '#10b981' : '#f43f5e' }}
        >
          {driftPositive ? '↑' : '↓'} {Math.abs(driftNum).toFixed(2)}%
        </p>
      </div>
    </div>
  )
}