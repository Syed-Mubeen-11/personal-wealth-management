import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ThemeContext } from '../context/Themecontext';

/**
 * WealthScoreWidget
 * ─────────────────────────────────────────────────────────────────────────────
 * Compact Dashboard card that shows the live portfolio wealth score,
 * grade, sub-scores, and the top-priority action item.
 * Clicking the card navigates to /recommendations.
 */
const WealthScoreWidget = () => {
  const { darkMode: dark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/recommendations/analyze')
      .then(res => { if (!cancelled) { setData(res.data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const T   = (dv, lv) => dark ? dv : lv;
  const bg  = T('bg-gray-800', 'bg-white');
  const bor = T('border-gray-700', 'border-gray-100');

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`rounded-2xl shadow-sm border p-6 ${bg} ${bor}`}>
        <style>{`
          @keyframes shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position:  200% 0; }
          }
          .ws-skeleton {
            border-radius: 6px;
            animation: shimmer 1.5s infinite;
            background-size: 200% 100%;
          }
        `}</style>
        <div className="ws-skeleton" style={{
          height: '18px', width: '55%', marginBottom: '16px',
          background: T(
            'linear-gradient(90deg,rgba(255,255,255,0.06) 25%,rgba(255,255,255,0.12) 50%,rgba(255,255,255,0.06) 75%)',
            'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)'
          )
        }} />
        {[80, 100, 65].map((w, i) => (
          <div key={i} className="ws-skeleton" style={{
            height: '10px', width: `${w}%`, marginBottom: '10px',
            background: T(
              'linear-gradient(90deg,rgba(255,255,255,0.06) 25%,rgba(255,255,255,0.12) 50%,rgba(255,255,255,0.06) 75%)',
              'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)'
            )
          }} />
        ))}
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className={`rounded-2xl shadow-sm border p-6 ${bg} ${bor} flex flex-col items-center justify-center`}
        style={{ minHeight: '160px' }}>
        <p style={{ color: T('rgba(255,255,255,0.5)', '#9ca3af'), fontSize: '13px', margin: 0 }}>
          Unable to load wealth score
        </p>
      </div>
    );
  }

  const { wealth_score: ws, smart_actions, risk_profile } = data;
  const colorMap = { emerald: '#10b981', amber: '#f59e0b', rose: '#ef4444' };
  const accentColor = colorMap[ws.color] || '#6366f1';
  const topAction = smart_actions[0] || null;
  const criticalCount = smart_actions.filter(a => a.priority === 'critical').length;

  // SVG gauge values
  const radius = 52;
  const circumference = Math.PI * radius;
  const progress = (ws.composite_score / 100) * circumference;
  const trackStroke = T('rgba(255,255,255,0.08)', 'rgba(0,0,0,0.07)');
  const textFill = T('white', '#1f2937');
  const labelColor = T('rgba(255,255,255,0.55)', '#6b7280');
  const titleColor = T('white', '#111827');
  const barTrack = T('rgba(255,255,255,0.08)', '#e5e7eb');
  const dividerBg = T('rgba(255,255,255,0.06)', '#f3f4f6');

  const gradientId = 'wsGrad';

  return (
    <div
      className={`rounded-2xl shadow-sm border p-6 ${bg} ${bor} cursor-pointer`}
      style={{ transition: 'box-shadow 0.2s, transform 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
      onClick={() => navigate('/recommendations')}
      title="Open full wealth analysis"
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '600', color: labelColor, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>
            Portfolio Wealth Score
          </p>
          <p style={{ fontSize: '11px', color: labelColor, margin: '3px 0 0', textTransform: 'capitalize' }}>
            {risk_profile} profile
          </p>
        </div>
        {criticalCount > 0 && (
          <span style={{
            fontSize: '11px', fontWeight: '700', background: '#ef4444', color: 'white',
            borderRadius: '20px', padding: '3px 9px',
          }}>
            {criticalCount} alert{criticalCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Gauge + score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
        <svg width="130" height="72" viewBox="0 0 130 72" style={{ flexShrink: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={accentColor} />
              <stop offset="100%" stopColor={accentColor + 'bb'} />
            </linearGradient>
          </defs>
          {/* Track */}
          <path d={`M 12 65 A ${radius} ${radius} 0 0 1 118 65`}
            fill="none" stroke={trackStroke} strokeWidth="11" strokeLinecap="round" />
          {/* Progress */}
          <path d={`M 12 65 A ${radius} ${radius} 0 0 1 118 65`}
            fill="none" stroke={`url(#${gradientId})`} strokeWidth="11" strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{ transition: 'stroke-dasharray 1.2s ease' }} />
          {/* Score text */}
          <text x="65" y="60" textAnchor="middle" fill={textFill} fontSize="22" fontWeight="800">
            {ws.composite_score}
          </text>
        </svg>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '30px', fontWeight: '900', color: accentColor, lineHeight: 1 }}>
            {ws.grade}
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: titleColor, marginTop: '2px' }}>
            {ws.label}
          </div>
          <div style={{ fontSize: '11px', color: labelColor, marginTop: '4px' }}>
            out of 100
          </div>
        </div>
      </div>

      {/* Sub-scores */}
      <div style={{ marginBottom: '14px' }}>
        {[
          { label: 'Diversification', score: ws.diversification.score, grade: ws.diversification.grade },
          { label: 'Risk Alignment',  score: ws.risk_alignment.score,  grade: ws.risk_alignment.grade  },
        ].map(({ label, score, grade }) => {
          const barColor = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
          return (
            <div key={label} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: labelColor }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: barColor }}>{score}/100 · {grade}</span>
              </div>
              <div style={{ height: '5px', background: barTrack, borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${score}%`, background: barColor, borderRadius: '4px', transition: 'width 1s ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top action */}
      {topAction && (
        <div style={{ borderTop: `1px solid ${dividerBg}`, paddingTop: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: labelColor, textTransform: 'uppercase', letterSpacing: '0.4px', margin: '0 0 6px' }}>
            Top Action
          </p>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            background: T('rgba(255,255,255,0.04)', '#f9fafb'),
            borderTop: `1px solid ${T('rgba(255,255,255,0.07)','#e5e7eb')}`,
      borderRight: `1px solid ${T('rgba(255,255,255,0.07)','#e5e7eb')}`,
      borderBottom: `1px solid ${T('rgba(255,255,255,0.07)','#e5e7eb')}`,
      borderLeft: `3px solid ${
        topAction.priority === 'critical' ? '#ef4444' :
        topAction.priority === 'high' ? '#f59e0b' : '#6366f1'
      }`,
      borderRadius: '8px', padding: '9px 10px'
          }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: titleColor, margin: '0 0 2px' }}>
                {topAction.title}
              </p>
              <p style={{ fontSize: '11px', color: labelColor, margin: 0, lineHeight: '1.5',
                          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {topAction.body}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div style={{ marginTop: '12px', textAlign: 'center' }}>
        <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '600' }}>
          View full analysis →
        </span>
      </div>
    </div>
  );
};

export default WealthScoreWidget;
