import { useState, useEffect, useCallback } from 'react'
import { Sparkles, RefreshCw, Loader2, AlertCircle, TrendingUp } from 'lucide-react'
import { recommendationsApi } from '../services/recommendationsApi'
import RecommendationCard from '../components/recommendations/RecommendationCard'
import RiskProfileBadge from '../components/common/RiskProfileBadge'
import { useAuth } from '../context/AuthContext'
// import { toast } from '../utils/toast'

// Skeleton loader
function RecommendationSkeleton() {
  return (
    <div className="dark-card p-5 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 rounded" style={{ background: 'var(--bg-border)', width: '60%' }} />
          <div className="h-3 rounded" style={{ background: 'var(--bg-border)', width: '25%' }} />
        </div>
        <div className="h-7 w-20 rounded-lg" style={{ background: 'var(--bg-border)' }} />
      </div>
      <div className="h-3 rounded mb-2" style={{ background: 'var(--bg-border)', width: '90%' }} />
      <div className="h-3 rounded mb-4" style={{ background: 'var(--bg-border)', width: '75%' }} />
      <div className="h-48 rounded-xl" style={{ background: 'var(--bg-border)' }} />
    </div>
  )
}

// Empty state
function EmptyState({ onGenerate, generating }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <Sparkles size={28} style={{ color: 'var(--purple)' }} />
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        No Recommendations Yet
      </h3>
      <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
        Complete your risk profile and generate your first personalised portfolio recommendation.
      </p>
      <button className="btn-purple" onClick={onGenerate} disabled={generating}>
        {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {generating ? 'Generating…' : 'Generate Recommendation'}
      </button>
    </div>
  )
}

export default function RecommendationsPage() {
  const { user } = useAuth()
  const [recs,       setRecs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [generating, setGenerating] = useState(false)
  const [total,      setTotal]      = useState(0)
  const [offset,     setOffset]     = useState(0)
  const LIMIT = 5

  const load = useCallback(async (off = 0) => {
    setLoading(true); setError('')
    try {
      const res = await recommendationsApi.list(LIMIT, off)
      const data = res.data
      setRecs(off === 0 ? data.items : prev => [...prev, ...data.items])
      setTotal(data.total)
      setOffset(off)
    } catch {
      setError('Failed to load recommendations. Check the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(0) }, [load])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await recommendationsApi.generate()
      if (res.status === 201) {
        await load(0)
        // small toast
        showToast('New recommendation generated!')
      } else {
        showToast('Your recommendation is already up to date.')
      }
    } catch (e) {
      setError('Failed to generate recommendation.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleMarkRead(id) {
    try {
      await recommendationsApi.markRead(id)
      setRecs(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r))
    } catch {
      showToast('Failed to mark as read. Please try again.', 'error')
      throw new Error('mark-read failed') // triggers rollback in card
    }
  }

  function showToast(msg, type = 'success') {
    // Simple inline toast — styled per theme
    const el = document.createElement('div')
    el.textContent = msg
    el.style.cssText = `
      position:fixed; bottom:24px; right:24px; z-index:9999;
      background:${type === 'error' ? '#f43f5e' : '#10b981'};
      color:white; padding:10px 18px; border-radius:10px;
      font-size:13px; font-weight:600; box-shadow:0 4px 20px rgba(0,0,0,0.4);
      animation:fadeUp 0.3s ease;
    `
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 3000)
  }

  const hasMore = recs.length < total

  return (
    <div className="p-6 max-w-3xl mx-auto fade-up">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Recommendations
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Personalised allocation advice
            </p>
            {user?.risk_profile && (
              <RiskProfileBadge riskProfile={user.risk_profile} size="sm" />
            )}
          </div>
        </div>

        <button
          className="btn-purple flex items-center gap-2"
          onClick={handleGenerate}
          disabled={generating || loading}
          aria-label="Generate new recommendation"
        >
          {generating
            ? <Loader2 size={14} className="animate-spin" />
            : <Sparkles size={14} />}
          {generating ? 'Generating…' : 'Generate New'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl p-4 mb-5 flex items-center gap-3"
          style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <AlertCircle size={16} style={{ color: 'var(--red)', flexShrink: 0 }} />
          <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && recs.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <RecommendationSkeleton key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && recs.length === 0 && !error && (
        <EmptyState onGenerate={handleGenerate} generating={generating} />
      )}

      {/* Recommendations list */}
      {recs.length > 0 && (
        <>
          <div className="space-y-4">
            {recs.map(rec => (
              <RecommendationCard key={rec.id} rec={rec} onMarkRead={handleMarkRead} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                className="btn-ghost flex items-center gap-2"
                onClick={() => load(offset + LIMIT)}
                disabled={loading}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Load More
              </button>
            </div>
          )}

          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Showing {recs.length} of {total} recommendations
          </p>
        </>
      )}
    </div>
  )
}
