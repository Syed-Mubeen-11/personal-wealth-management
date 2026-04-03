import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';
import { ThemeContext } from '../context/Themecontext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const pct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

const formatRefreshTime = (dt) => {
  if (!dt) return '';
  return dt.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

// ─── Priority / Status config (colours are accent-only, work on both modes) ──

const PRIORITY_CFG = {
  critical: { border: '#ef4444', badge: '#ef4444', label: 'Critical',
              lightBg: 'rgba(239,68,68,0.08)',  darkBg: 'rgba(239,68,68,0.12)' },
  high:     { border: '#f59e0b', badge: '#f59e0b', label: 'High',
              lightBg: 'rgba(245,158,11,0.08)', darkBg: 'rgba(245,158,11,0.12)' },
  medium:   { border: '#6366f1', badge: '#6366f1', label: 'Medium',
              lightBg: 'rgba(99,102,241,0.08)', darkBg: 'rgba(99,102,241,0.12)' },
  low:      { border: '#10b981', badge: '#10b981', label: 'Low',
              lightBg: 'rgba(16,185,129,0.08)', darkBg: 'rgba(16,185,129,0.12)' },
};

const GOAL_ICONS = { retirement: 'Retirement', home: 'Home', education: 'Education', custom: 'Custom' };

const STATUS_CFG = {
  on_track: { color: '#10b981', label: 'On Track',  icon: '✓' },
  at_risk:  { color: '#f59e0b', label: 'At Risk',   icon: '!' },
  overdue:  { color: '#ef4444', label: 'Overdue',   icon: '✕' },
};

const TABS = ['Overview', 'Smart Actions', 'Goal Insights', 'Allocation'];

// ─── Theme-aware style factory ────────────────────────────────────────────────

const T = (dark, darkVal, lightVal) => dark ? darkVal : lightVal;

// ─── Sub-components (all theme-aware) ────────────────────────────────────────

const WealthScoreGauge = ({ score, grade, label, color, dark }) => {
  const colorMap = { emerald: '#10b981', amber: '#f59e0b', rose: '#ef4444' };
  const c = colorMap[color] || '#6366f1';
  const radius = 70;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const textFill = T(dark, 'white', '#1f2937');
  const trackStroke = T(dark, 'rgba(255,255,255,0.08)', 'rgba(0,0,0,0.08)');

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d={`M 10 90 A ${radius} ${radius} 0 0 1 170 90`}
          fill="none" stroke={trackStroke} strokeWidth="14" strokeLinecap="round" />
        <path d={`M 10 90 A ${radius} ${radius} 0 0 1 170 90`}
          fill="none" stroke={c} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: 'stroke-dasharray 1.2s ease' }} />
        <text x="90" y="82" textAnchor="middle" fill={textFill} fontSize="28" fontWeight="700">
          {score}
        </text>
      </svg>
      <div style={{ marginTop: '-8px' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', color: c }}>{grade}</div>
        <div style={{ fontSize: '13px', color: T(dark, 'rgba(255,255,255,0.6)', '#6b7280'), marginTop: '2px' }}>
          {label}
        </div>
      </div>
    </div>
  );
};

const SubScoreBar = ({ label, score, grade, dark }) => {
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const trackColor = T(dark, 'rgba(255,255,255,0.08)', 'rgba(0,0,0,0.08)');
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: T(dark, 'rgba(255,255,255,0.7)', '#4b5563') }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: '700', color }}>{score}/100 ({grade})</span>
      </div>
      <div style={{ height: '6px', background: trackColor, borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${score}%`, background: color,
          borderRadius: '4px', transition: 'width 1s ease'
        }} />
      </div>
    </div>
  );
};

const ActionCard = ({ action, dark }) => {
  const cfg = PRIORITY_CFG[action.priority] || PRIORITY_CFG.low;
  const bg = T(dark, cfg.darkBg, cfg.lightBg);
  const titleColor = T(dark, 'white', '#111827');
  const bodyColor = T(dark, 'rgba(255,255,255,0.65)', '#4b5563');
  const liveAnalysisBg = T(dark, 'rgba(99,102,241,0.3)', 'rgba(99,102,241,0.12)');
  const liveAnalysisColor = T(dark, '#a5b4fc', '#6366f1');

  return (
    <div style={{
      background: bg,
      border: `1px solid ${cfg.border}30`,
      borderLeft: `3px solid ${cfg.border}`,
      borderRadius: '12px',
      padding: '16px',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 4px 20px ${cfg.border}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: titleColor }}>{action.title}</span>
            <span style={{
              fontSize: '10px', fontWeight: '600', padding: '2px 7px',
              borderRadius: '20px', background: cfg.badge, color: 'white', textTransform: 'uppercase'
            }}>
              {cfg.label}
            </span>
            {action.source === 'analysis' && (
              <span style={{
                fontSize: '10px', padding: '2px 7px', borderRadius: '20px',
                background: liveAnalysisBg, color: liveAnalysisColor,
                border: `1px solid ${cfg.border}30`
              }}>
                Live Analysis
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: bodyColor, lineHeight: '1.6', margin: 0 }}>
            {action.body}
          </p>
        </div>
      </div>
    </div>
  );
};

const GoalInsightCard = ({ insight, dark }) => {
  const status = STATUS_CFG[insight.status] || STATUS_CFG.at_risk;
  const goalLabel = GOAL_ICONS[insight.goal_type] || insight.goal_type;
  const cardBg  = T(dark, 'rgba(255,255,255,0.04)', 'white');
  const cardBor = T(dark, 'rgba(255,255,255,0.08)', '#e5e7eb');
  const cardBgH = T(dark, 'rgba(255,255,255,0.07)', '#f9fafb');
  const titleCol = T(dark, 'white', '#111827');
  const subCol   = T(dark, 'rgba(255,255,255,0.5)', '#6b7280');
  const barTrack = T(dark, 'rgba(255,255,255,0.08)', '#e5e7eb');
  const actionBg = T(dark, 'rgba(99,102,241,0.1)', '#eef2ff');
  const actionBorder = T(dark, 'rgba(99,102,241,0.2)', '#c7d2fe');
  const actionText   = T(dark, 'rgba(255,255,255,0.7)', '#374151');

  return (
    <div style={{
      background: cardBg, border: `1px solid ${cardBor}`,
      borderRadius: '14px', padding: '18px', transition: 'background 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = cardBgH}
      onMouseLeave={e => e.currentTarget.style.background = cardBg}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: titleCol, textTransform: 'capitalize' }}>
            {goalLabel}
          </div>
          <div style={{ fontSize: '12px', color: subCol, marginTop: '2px' }}>
            {insight.years_left > 0 ? `${insight.years_left}y remaining` : 'Deadline passed'}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px',
          fontWeight: '600', color: status.color, background: `${status.color}18`,
          padding: '4px 10px', borderRadius: '20px', flexShrink: 0
        }}>
          <span style={{ fontSize: '10px', fontWeight: '800' }}>{status.icon}</span> {status.label}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: subCol, marginBottom: '6px' }}>
          <span>Projected: {fmt(insight.projected_value)}</span>
          <span>Target: {fmt(insight.target_amount)}</span>
        </div>
        <div style={{ height: '8px', background: barTrack, borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${insight.progress_pct}%`,
            background: insight.on_track
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : insight.progress_pct > 50
                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                : 'linear-gradient(90deg, #ef4444, #f87171)',
            borderRadius: '6px', transition: 'width 1s ease'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: subCol, marginTop: '4px' }}>
          <span>{insight.progress_pct}% projected</span>
          {!insight.on_track && <span style={{ color: '#f59e0b' }}>Gap: {fmt(insight.gap)}</span>}
        </div>
      </div>

      <div style={{ background: actionBg, border: `1px solid ${actionBorder}`, borderRadius: '8px', padding: '10px 12px' }}>
        <p style={{ fontSize: '12px', color: actionText, margin: 0, lineHeight: '1.6' }}>
          {insight.action}
        </p>
      </div>
    </div>
  );
};

const AllocationRow = ({ asset, current, target, dark }) => {
  const drift = current - target;
  const driftColor = Math.abs(drift) < 3 ? '#10b981' : Math.abs(drift) < 8 ? '#f59e0b' : '#ef4444';
  const assetColor = T(dark, 'rgba(255,255,255,0.8)', '#374151');
  const numColor   = T(dark, 'rgba(255,255,255,0.6)', '#6b7280');
  const rowBorder  = T(dark, 'rgba(255,255,255,0.05)', '#f3f4f6');
  const barTrack   = T(dark, 'rgba(255,255,255,0.06)', '#e5e7eb');

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 0', borderBottom: `1px solid ${rowBorder}`
    }}>
      <span style={{ width: '110px', fontSize: '13px', fontWeight: '600', color: assetColor, textTransform: 'capitalize', flexShrink: 0 }}>
        {asset.replace('_', ' ')}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ position: 'relative', height: '8px', background: barTrack, borderRadius: '4px' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            width: `${Math.min(current, 100)}%`,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            borderRadius: '4px', transition: 'width 0.8s ease'
          }} />
          <div style={{
            position: 'absolute', top: '-3px', left: `${target}%`,
            width: '2px', height: '14px', background: '#f59e0b',
            borderRadius: '1px', transform: 'translateX(-50%)'
          }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', color: numColor, width: '48px', textAlign: 'right' }}>
          {current.toFixed(1)}%
        </span>
        <span style={{ fontSize: '12px', color: '#f59e0b', width: '48px', textAlign: 'right', fontWeight: '600' }}>
          {target.toFixed(1)}%
        </span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: driftColor, width: '48px', textAlign: 'right' }}>
          {drift > 0 ? '+' : ''}{drift.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, sub, accentColor, dark }) => {
  const cardBg  = T(dark, 'rgba(255,255,255,0.04)', 'white');
  const cardBor = T(dark, 'rgba(255,255,255,0.08)', '#e5e7eb');
  const cardBgH = T(dark, 'rgba(255,255,255,0.07)', '#f9fafb');
  const valCol  = T(dark, 'white', '#111827');
  const subCol  = T(dark, 'rgba(255,255,255,0.45)', '#6b7280');
  const lblCol  = T(dark, 'rgba(255,255,255,0.55)', '#374151');

  return (
    <div style={{
      background: cardBg, border: `1px solid ${cardBor}`,
      borderRadius: '14px', padding: '18px',
      transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
      borderTop: `3px solid ${accentColor}`,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = cardBgH; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = cardBg; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div>
        <div style={{ fontSize: '11px', color: lblCol, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</div>
        <div style={{ fontSize: '22px', fontWeight: '800', color: valCol }}>{value}</div>
        <div style={{ fontSize: '11px', color: subCol, marginTop: '4px' }}>{sub}</div>
      </div>
    </div>
  );
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const Skeleton = ({ w = '100%', h = '16px', r = '8px', dark, style: extraStyle = {} }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: T(dark,
      'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
      'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)'
    ),
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.6s infinite',
    ...extraStyle
  }} />
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const Recommendations = () => {
  const { darkMode: dark } = useContext(ThemeContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchAnalysis = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get('/recommendations/analyze');
      setData(res.data);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch recommendations analysis', err);
      setError('Failed to load wealth analysis. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);

  // ── Theme-aware tokens ─────────────────────────────────────────────────────
  const pageBg     = T(dark, 'transparent', 'transparent');
  const headCol    = T(dark, 'white', '#111827');
  const subCol     = T(dark, 'rgba(255,255,255,0.5)', '#6b7280');
  const cardBg     = T(dark, 'rgba(255,255,255,0.04)', 'white');
  const cardBorder = T(dark, 'rgba(255,255,255,0.08)', '#e5e7eb');
  const cardTitleC = T(dark, 'white', '#111827');
  const rowBorder  = T(dark, 'rgba(255,255,255,0.05)', '#f3f4f6');
  const tabBarBg   = T(dark, 'rgba(255,255,255,0.05)', '#f3f4f6');
  const tabInactC  = T(dark, 'rgba(255,255,255,0.55)', '#6b7280');
  const noteBoxBg  = T(dark, 'rgba(255,255,255,0.04)', '#f9fafb');
  const noteBoxBor = T(dark, 'rgba(255,255,255,0.08)', '#e5e7eb');
  const noteText   = T(dark, 'rgba(255,255,255,0.55)', '#4b5563');
  const tipBoxBg   = T(dark, 'rgba(99,102,241,0.1)', '#eef2ff');
  const tipBoxBor  = T(dark, 'rgba(99,102,241,0.2)', '#c7d2fe');
  const tipText    = T(dark, 'rgba(255,255,255,0.65)', '#374151');
  const emptyText  = T(dark, 'rgba(255,255,255,0.45)', '#6b7280');

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '8px 4px' }}>
        <style>{globalCSS}</style>
        <Skeleton dark={dark} w="260px" h="32px" r="8px" extraStyle={{ marginBottom: '8px' }} />
        <Skeleton dark={dark} w="220px" h="14px" r="6px" extraStyle={{ marginBottom: '28px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {[1,2,3,4].map(i => <Skeleton key={i} dark={dark} h="90px" r="14px" />)}
        </div>
        <Skeleton dark={dark} h="340px" r="16px" />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ padding: '8px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <style>{globalCSS}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444', marginBottom: '8px' }}>Analysis Unavailable</div>
          <p style={{ color: T(dark, 'rgba(255,255,255,0.6)', '#6b7280'), fontSize: '14px', marginBottom: '16px' }}>{error}</p>
          <button style={btnStyle} onClick={() => fetchAnalysis()}>Retry Analysis</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { portfolio_summary: ps, wealth_score: ws, smart_actions, goal_insights, current_weights, target_weights, risk_profile } = data;

  const allocationRows = Object.keys(target_weights).map(asset => ({
    asset,
    current: (current_weights[asset] || 0) * 100,
    target: target_weights[asset] * 100,
  }));

  const criticalCount = smart_actions.filter(a => a.priority === 'critical').length;
  const highCount     = smart_actions.filter(a => a.priority === 'high').length;
  const goalsOnTrack  = goal_insights.filter(g => g.on_track).length;
  const wsColor = ws.color === 'emerald' ? '#10b981' : ws.color === 'amber' ? '#f59e0b' : '#ef4444';

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '8px 4px', background: pageBg, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <style>{globalCSS}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: headCol, margin: 0 }}>
            Wealth Recommendations
          </h1>
          <p style={{ fontSize: '13px', color: subCol, marginTop: '5px', margin: '5px 0 0' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: T(dark, 'rgba(99,102,241,0.15)', '#eef2ff'),
              color: T(dark, '#a5b4fc', '#6366f1'),
              border: `1px solid ${T(dark, 'rgba(99,102,241,0.3)', '#c7d2fe')}`,
              borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '600'
            }}>
              AI-Powered
            </span>
            {'  '}
            <span style={{ textTransform: 'capitalize', fontWeight: '500', color: T(dark,'rgba(255,255,255,0.7)','#374151') }}>
              {risk_profile} profile
            </span>
            {lastRefreshed && (
              <span style={{ color: subCol, marginLeft: '6px' }}>
                · Last refreshed: <strong style={{ color: T(dark,'rgba(255,255,255,0.8)','#1f2937') }}>
                  {formatRefreshTime(lastRefreshed)}
                </strong>
              </span>
            )}
          </p>
        </div>
        <button
          id="refresh-btn"
          style={btnStyle}
          onClick={() => fetchAnalysis(true)}
          disabled={refreshing}
        >
          <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none', fontSize: '14px' }}>↻</span>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <KpiCard dark={dark} label="Total Wealth" accentColor="#6366f1"
          value={fmt(ps.total_value)}
          sub={`${pct(ps.overall_gain_pct)} overall return`} />
        <KpiCard dark={dark} label="Wealth Score" accentColor={wsColor}
          value={`${ws.composite_score}/100`}
          sub={`Grade ${ws.grade} · ${ws.label}`} />
        <KpiCard dark={dark} label="Alerts" accentColor={criticalCount > 0 ? '#ef4444' : '#f59e0b'}
          value={`${criticalCount + highCount}`}
          sub={`${criticalCount} critical · ${highCount} high`} />
        <KpiCard dark={dark} label="Goals On Track" accentColor="#10b981"
          value={`${goalsOnTrack}/${goal_insights.length}`}
          sub="wealth goals on track" />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: tabBarBg, borderRadius: '12px', padding: '4px', width: 'fit-content', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            id={`tab-${tab.toLowerCase().replace(' ', '-')}`}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
              background: activeTab === tab ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
              color: activeTab === tab ? 'white' : tabInactC,
              boxShadow: activeTab === tab ? '0 2px 10px rgba(99,102,241,0.35)' : 'none',
            }}
          >
            {tab}
            {tab === 'Smart Actions' && criticalCount > 0 && (
              <span style={{
                marginLeft: '6px', background: '#ef4444', color: 'white',
                borderRadius: '10px', fontSize: '10px', padding: '1px 6px', fontWeight: '700'
              }}>{criticalCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ Tab: Overview ══ */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

          {/* Wealth Score Card */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: cardTitleC, marginTop: 0, marginBottom: '16px' }}>
              Portfolio Wealth Score
            </h3>
            <WealthScoreGauge dark={dark} {...ws} />
            <div style={{ marginTop: '20px' }}>
              <SubScoreBar dark={dark} label="Diversification" score={ws.diversification.score} grade={ws.diversification.grade} />
              <SubScoreBar dark={dark} label="Risk Alignment"  score={ws.risk_alignment.score}  grade={ws.risk_alignment.grade} />
            </div>
            <div style={{ marginTop: '14px', background: noteBoxBg, border: `1px solid ${noteBoxBor}`, borderRadius: '8px', padding: '10px 12px' }}>
              <p style={{ fontSize: '12px', color: noteText, margin: 0, lineHeight: '1.6' }}>
                {ws.diversification.detail}
              </p>
              <p style={{ fontSize: '12px', color: noteText, margin: '6px 0 0', lineHeight: '1.6' }}>
                {ws.risk_alignment.detail}
              </p>
            </div>
          </div>

          {/* Top Actions (preview) */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: cardTitleC, margin: 0 }}>Top Wealth Actions</h3>
              <button style={{ fontSize: '12px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                onClick={() => setActiveTab('Smart Actions')}>
                See all →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {smart_actions.slice(0, 3).map((action, i) => <ActionCard key={i} dark={dark} action={action} />)}
              {smart_actions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: emptyText }}>
                  <p style={{ margin: 0, fontStyle: 'italic' }}>No urgent actions — your wealth strategy is well-optimised.</p>
                </div>
              )}
            </div>
          </div>

          {/* Wealth Snapshot */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: cardTitleC, marginTop: 0, marginBottom: '16px' }}>
              Wealth Snapshot
            </h3>
            {[
              { label: 'Total Invested',  value: fmt(ps.total_cost) },
              { label: 'Current Value',   value: fmt(ps.total_value) },
              { label: 'Overall Return',  value: pct(ps.overall_gain_pct), color: ps.overall_gain_pct >= 0 ? '#10b981' : '#ef4444' },
              { label: 'Investments',     value: ps.num_investments },
              { label: 'Active Goals',    value: ps.num_goals },
              { label: 'Risk Profile',    value: risk_profile.charAt(0).toUpperCase() + risk_profile.slice(1) },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${rowBorder}` }}>
                <span style={{ fontSize: '13px', color: T(dark,'rgba(255,255,255,0.55)','#6b7280') }}>{row.label}</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: row.color || T(dark,'white','#111827') }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ Tab: Smart Actions ══ */}
      {activeTab === 'Smart Actions' && (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['critical','high','medium','low'].map(p => {
              const count = smart_actions.filter(a => a.priority === p).length;
              if (!count) return null;
              const cfg = PRIORITY_CFG[p];
              return (
                <span key={p} style={{
                  fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px',
                  background: T(dark, cfg.darkBg, cfg.lightBg),
                  border: `1px solid ${cfg.border}40`, color: cfg.badge
                }}>
                  {count} {cfg.label}
                </span>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {smart_actions.map((action, i) => <ActionCard key={i} dark={dark} action={action} />)}
            {smart_actions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px' }}>
                <h3 style={{ color: cardTitleC, margin: '0 0 8px' }}>Excellent Wealth Strategy</h3>
                <p style={{ color: emptyText, margin: 0 }}>
                  Your portfolio is well-aligned with your wealth goals.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ Tab: Goal Insights ══ */}
      {activeTab === 'Goal Insights' && (
        <div>
          {goal_insights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px' }}>
              <h3 style={{ color: cardTitleC, margin: '0 0 8px' }}>No Wealth Goals Set</h3>
              <p style={{ color: emptyText, margin: '0 0 20px' }}>
                Add goals (retirement, home, education) to get personalised wealth projections.
              </p>
              <button style={btnStyle} onClick={() => window.location.href = '/goals'}>
                Add Wealth Goals →
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {goal_insights.map((insight, i) => <GoalInsightCard key={i} dark={dark} insight={insight} />)}
            </div>
          )}
        </div>
      )}

      {/* ══ Tab: Allocation ══ */}
      {activeTab === 'Allocation' && (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '22px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: cardTitleC, marginTop: 0, marginBottom: '16px' }}>
            Wealth Allocation vs Target
          </h3>
          {/* Legend + Header row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', fontSize: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '4px', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '2px' }} />
              <span style={{ color: subCol }}>Current</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '2px', height: '12px', background: '#f59e0b' }} />
              <span style={{ color: '#f59e0b', fontWeight: '600' }}>Target</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto', color: subCol }}>
              <span style={{ minWidth: '110px' }}></span>
              <span style={{ width: '48px', textAlign: 'right', fontSize: '11px' }}>Current</span>
              <span style={{ width: '48px', textAlign: 'right', fontSize: '11px', color: '#f59e0b' }}>Target</span>
              <span style={{ width: '48px', textAlign: 'right', fontSize: '11px' }}>Drift</span>
            </div>
          </div>
          {allocationRows.map((row, i) => <AllocationRow key={i} dark={dark} {...row} />)}
          <div style={{ marginTop: '20px', background: tipBoxBg, border: `1px solid ${tipBoxBor}`, borderRadius: '10px', padding: '12px 14px' }}>
            <p style={{ fontSize: '12px', color: tipText, margin: 0, lineHeight: '1.6' }}>
              <strong>Tip:</strong> Use the{' '}
              <span style={{ color: '#6366f1', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}
                onClick={() => window.location.href = '/portfolio'}>
                Portfolio Rebalance tool
              </span>{' '}
              to generate precise buy/sell orders to bring your allocation back to the <em>{risk_profile}</em> wealth target.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Static styles ────────────────────────────────────────────────────────────

const btnStyle = {
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  padding: '10px 18px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'opacity 0.2s, transform 0.2s',
  boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
};

const globalCSS = `
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  #refresh-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  #refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export default Recommendations;