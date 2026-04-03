import { useEffect, useRef } from 'react'
import { X, CheckCircle2, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react'
import AllocationComparisonTable from './AllocationComparisonTable'

// ── SuggestionCard ────────────────────────────────────────────────────────────

function SuggestionCard({ s }) {
  const isBuy = s.action === 'BUY'
  return (
    <div className="rounded-xl p-3 flex items-center justify-between gap-3"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: isBuy ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
            border: `1px solid ${isBuy ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
          }}>
          {isBuy ? (
            <TrendingUp size={15} style={{ color: '#10b981' }} />
          ) : (
            <TrendingDown size={15} style={{ color: '#f43f5e' }} />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md"
              style={{
                background: isBuy ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                color: isBuy ? '#34d399' : '#fb7185',
                border: `1px solid ${isBuy ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
              }}>
              {s.action}
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {s.asset_class?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Drift: {(s.drift_impact * 100).toFixed(1)}% off target
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold font-num" style={{ color: 'var(--text-primary)' }}>
          ${s.estimated_value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          est. rebalance
        </p>
      </div>
    </div>
  )
}

// ── RebalanceDrawer ───────────────────────────────────────────────────────────

export default function RebalanceDrawer({ open, onClose, data, loading, error }) {
  const drawerRef = useRef(null)

  // Focus trap & Escape key
  useEffect(() => {
    if (!open) return
    const el = drawerRef.current
    if (el) el.focus()

    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background: 'rgba(0,0,0,0.55)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Rebalance Portfolio"
        className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-y-auto"
        style={{
          width: 'min(420px, 100vw)',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--bg-border)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          outline: 'none',
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--bg-border)' }}>
          <div>
            <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              Portfolio Rebalance
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Current vs target allocation
            </p>
          </div>
          <button
            className="btn-ghost p-1.5"
            onClick={onClose}
            aria-label="Close rebalance panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--purple)' }} />
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
              <AlertCircle size={16} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }} />
              <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Allocation comparison table */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--text-muted)' }}>Allocation Comparison</h3>
                <AllocationComparisonTable
                  currentWeights={data.currentWeights}
                  targetWeights={data.targetWeights}
                />
              </section>

              {/* Suggestions */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--text-muted)' }}>Suggested Actions</h3>
                {data.suggestions?.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <CheckCircle2 size={28} className="mb-3" style={{ color: '#10b981' }} />
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Portfolio is balanced!
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Your allocation is within 2% of the target.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.suggestions.map((s, i) => <SuggestionCard key={i} s={s} />)}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
