// RiskProfileBadge — reusable across Profile, Dashboard, Recommendations pages
// Props:
//   riskProfile: 'conservative' | 'moderate' | 'aggressive'
//   size: 'sm' | 'md' | 'lg'  (default 'md')

const PROFILE_STYLES = {
  conservative: { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', label: 'Conservative' },
  moderate:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Moderate'     },
  aggressive:   { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',  label: 'Aggressive'   },
}

const SIZE_CLASSES = {
  sm: { px: '6px', py: '2px', fontSize: '10px' },
  md: { px: '10px', py: '4px', fontSize: '12px' },
  lg: { px: '14px', py: '6px', fontSize: '14px' },
}

export default function RiskProfileBadge({ riskProfile, size = 'md' }) {
  const key    = riskProfile?.toLowerCase() ?? 'moderate'
  const styles = PROFILE_STYLES[key] ?? PROFILE_STYLES.moderate
  const sz     = SIZE_CLASSES[size] ?? SIZE_CLASSES.md

  return (
    <span
      role="status"
      aria-label={`Risk profile: ${styles.label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: styles.bg,
        color: styles.color,
        borderRadius: '9999px',
        padding: `${sz.py} ${sz.px}`,
        fontSize: sz.fontSize,
        fontWeight: 600,
        letterSpacing: '0.01em',
        lineHeight: 1.4,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: styles.color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {styles.label}
    </span>
  )
}