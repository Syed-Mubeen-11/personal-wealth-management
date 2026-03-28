import { useEffect, useRef } from 'react'
import { X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRebalanceSuggestions } from '../../hooks/useRebalanceSuggestions'
import AllocationComparisonTable from './AllocationComparisonTable'
import SuggestionCard from './SuggestionCard'

export default function RebalanceDrawer({ open, onClose }) {
  const drawerRef = useRef(null)

  const { data, isLoading, isError, error } = useRebalanceSuggestions()

  const currentWeights = data?.currentWeights ?? {}
  const targetWeights  = data?.targetWeights  ?? {}
  const suggestions    = data?.suggestions    ?? []

  // Trap focus inside drawer while open
  useEffect(() => {
    if (!open) return
    const el = drawerRef.current
    if (!el) return
    el.focus()

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()

      // Focus trap
      if (e.key !== 'Tab') return
      const focusable = el.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus() }
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.55)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Rebalance Portfolio"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: '520px',
          zIndex: 50,
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--bg-border)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
          outline: 'none',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--bg-border)', zIndex: 1 }}
        >
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Rebalance Portfolio
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Current vs target allocation
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close rebalance drawer"
            className="p-2 rounded-xl transition-colors hover:opacity-70"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-5 py-5 space-y-6">

          {/* Loading */}
          {isLoading && (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl" style={{ background: 'var(--bg-border)' }} />
              ))}
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div
              className="rounded-2xl p-5 flex items-start gap-3"
              style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)' }}
              role="alert"
            >
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#f43f5e' }} />
              <p className="text-sm" style={{ color: '#f43f5e' }}>
                {error?.message ?? 'Failed to load rebalance data.'}
              </p>
            </div>
          )}

          {/* Content */}
          {!isLoading && !isError && (
            <>
              {/* Allocation Comparison Table */}
              <section aria-labelledby="alloc-table-heading">
                <h3
                  id="alloc-table-heading"
                  className="text-sm font-semibold mb-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Allocation Drift
                </h3>
                <AllocationComparisonTable
                  currentWeights={currentWeights}
                  targetWeights={targetWeights}
                />
              </section>

              {/* Suggestions */}
              <section aria-labelledby="suggestions-heading">
                <h3
                  id="suggestions-heading"
                  className="text-sm font-semibold mb-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Suggested Trades
                </h3>

                {suggestions.length === 0 ? (
                  <div
                    className="rounded-2xl p-8 flex flex-col items-center text-center"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}
                  >
                    <CheckCircle2 size={28} style={{ color: '#10b981' }} />
                    <p className="mt-3 font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      Portfolio is balanced!
                    </p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      No trades needed right now.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3" role="list" aria-label="Suggested trades">
                    {suggestions.map((s, i) => (
                      <SuggestionCard key={i} suggestion={s} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </>
  )
}