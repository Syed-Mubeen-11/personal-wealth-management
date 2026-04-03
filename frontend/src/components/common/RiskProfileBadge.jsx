/**
 * RiskProfileBadge — shared across Dashboard, Profile, Recommendations pages.
 * Props:
 *   riskProfile: 'conservative' | 'moderate' | 'aggressive'
 *   size: 'sm' | 'md' | 'lg'
 */

const PROFILE_CONFIG = {
  conservative: {
    label: 'Conservative',
    color: '#67e8f9',
    bg: 'rgba(6,182,212,0.15)',
    border: 'rgba(6,182,212,0.3)',
    dot: '#06b6d4',
  },
  moderate: {
    label: 'Moderate',
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.3)',
    dot: '#f59e0b',
  },
  aggressive: {
    label: 'Aggressive',
    color: '#fb7185',
    bg: 'rgba(244,63,94,0.15)',
    border: 'rgba(244,63,94,0.3)',
    dot: '#f43f5e',
  },
}

const SIZE_MAP = {
  sm: { fontSize: '0.65rem', padding: '2px 8px', dotSize: 5 },
  md: { fontSize: '0.75rem', padding: '3px 10px', dotSize: 6 },
  lg: { fontSize: '0.85rem', padding: '4px 13px', dotSize: 7 },
}

export default function RiskProfileBadge({ riskProfile = 'moderate', size = 'md' }) {
  const key = (riskProfile || 'moderate').toLowerCase()
  const cfg = PROFILE_CONFIG[key] || PROFILE_CONFIG.moderate
  const sz  = SIZE_MAP[size] || SIZE_MAP.md

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: 99,
        padding: sz.padding,
        fontSize: sz.fontSize,
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    >
      <span style={{
        width: sz.dotSize,
        height: sz.dotSize,
        borderRadius: '50%',
        background: cfg.dot,
        display: 'inline-block',
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  )
}
