import { useRecommendations } from '../hooks/useRecommendations'
import RecommendationCard from '../components/recommendations/RecommendationCard'
import RecommendationSkeleton, { EmptyRecommendations } from '../components/recommendations/RecommendationSkeleton'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function RecommendationsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useRecommendations()

  // Normalise response shape — backend may return array or { items: [] } or { recommendations: [] }
  const items = Array.isArray(data)
    ? data
    : data?.items ?? data?.recommendations ?? []

  // Sort most recent first
  const sorted = [...items].sort(
    (a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0)
  )

  return (
    <div className="p-5 lg:p-6 max-w-3xl mx-auto fade-up">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="font-display font-bold text-2xl"
            style={{ color: 'var(--text-primary)' }}
          >
            Recommendations
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Personalised allocation suggestions based on your risk profile
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh recommendations"
          className="p-2 rounded-xl transition-colors"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            color: isFetching ? 'var(--text-muted)' : 'var(--text-secondary)',
          }}
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Loading state — visible for min 200ms via React Query skeleton */}
      {isLoading && <RecommendationSkeleton />}

      {/* Error state */}
      {isError && !isLoading && (
        <div
          className="rounded-2xl p-6 flex items-start gap-4"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)' }}
          role="alert"
        >
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#f43f5e' }} />
          <div>
            <p className="font-medium text-sm" style={{ color: '#f43f5e' }}>
              Failed to load recommendations
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {error?.message ?? 'An unexpected error occurred. Please try again.'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e' }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && sorted.length === 0 && <EmptyRecommendations />}

      {/* Recommendation cards */}
      {!isLoading && !isError && sorted.length > 0 && (
        <div className="space-y-4">
          {sorted.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      )}
    </div>
  )
}