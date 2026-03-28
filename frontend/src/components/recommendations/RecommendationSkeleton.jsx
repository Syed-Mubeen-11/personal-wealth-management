export default function RecommendationSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl p-5 animate-pulse"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl" style={{ background: 'var(--bg-border)' }} />
            <div className="flex-1 space-y-2">
              <div className="h-4 rounded-lg w-1/3" style={{ background: 'var(--bg-border)' }} />
              <div className="h-3 rounded-lg w-1/4" style={{ background: 'var(--bg-border)' }} />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 rounded-lg w-full" style={{ background: 'var(--bg-border)' }} />
            <div className="h-3 rounded-lg w-5/6" style={{ background: 'var(--bg-border)' }} />
          </div>
          <div className="h-40 rounded-xl" style={{ background: 'var(--bg-border)' }} />
        </div>
      ))}
    </div>
  )
}

export function EmptyRecommendations() {
  return (
    <div
      className="rounded-2xl p-16 flex flex-col items-center justify-center text-center"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl"
        style={{ background: 'rgba(168,85,247,0.1)' }}
      >
        ✅
      </div>
      <h2 className="font-display font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        You're all caught up!
      </h2>
      <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
        No recommendations yet. We'll notify you when there's something to review.
      </p>
    </div>
  )
}