import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import SuggestionCard from './SuggestionCard';
import { ThemeContext } from '../context/Themecontext';

// ─── Helper ───────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// ─── Component ────────────────────────────────────────────────────────────────

const RebalanceDrawer = ({ isOpen, onClose }) => {
  const { darkMode: dark } = useContext(ThemeContext);

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [sortBy, setSortBy]   = useState('drift'); // 'drift' | 'asset'

  useEffect(() => {
    if (isOpen) {
      fetchRebalanceData();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const fetchRebalanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/recommendations/rebalance');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch rebalance data', err);
      setError('Failed to load rebalance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const drawerBg    = dark ? '#111827'  : 'white';
  const headerColor = dark ? 'white'    : '#111827';
  const subColor    = dark ? 'rgba(255,255,255,0.5)' : '#6b7280';
  const divider     = dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6';
  const sectionTitleC = dark ? 'white'  : '#111827';
  const rowBg       = dark ? 'rgba(255,255,255,0.03)' : '#f9fafb';
  const rowBorder   = dark ? 'rgba(255,255,255,0.06)' : '#e5e7eb';
  const emptySub    = dark ? 'rgba(255,255,255,0.45)' : '#9ca3af';
  const sortBtnC    = dark ? '#6366f1'  : '#6366f1';
  const closeBtnC   = dark ? 'rgba(255,255,255,0.5)' : '#9ca3af';
  const closeBtnH   = dark ? 'white'    : '#111827';
  const colHeader   = dark ? 'rgba(255,255,255,0.4)' : '#9ca3af';
  const summaryBg   = dark ? 'rgba(99,102,241,0.1)'  : '#eef2ff';
  const summaryBor  = dark ? 'rgba(99,102,241,0.2)'  : '#c7d2fe';
  const summaryTxt  = dark ? 'rgba(255,255,255,0.7)' : '#4b5563';

  // ── Sort allocation rows ──────────────────────────────────────────────────
  const getSortedRows = () => {
    if (!data?.currentWeights) return [];
    const rows = Object.keys(data.currentWeights).map(asset => ({
      asset,
      current: data.currentWeights[asset] * 100,
      target:  (data.targetWeights?.[asset] ?? 0) * 100,
      drift:   ((data.currentWeights[asset] - (data.targetWeights?.[asset] ?? 0)) * 100),
    }));
    if (sortBy === 'drift') {
      return rows.sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));
    }
    return rows.sort((a, b) => a.asset.localeCompare(b.asset));
  };

  const sortedRows = getSortedRows();

  const getDriftColor = (drift) => {
    if (Math.abs(drift) < 3) return { bg: dark ? 'rgba(16,185,129,0.1)' : '#ecfdf5', text: '#10b981' };
    if (Math.abs(drift) < 8) return { bg: dark ? 'rgba(245,158,11,0.1)' : '#fffbeb', text: '#f59e0b' };
    return { bg: dark ? 'rgba(239,68,68,0.1)' : '#fef2f2', text: '#ef4444' };
  };

  // ── Backdrop ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 40, backdropFilter: 'blur(2px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed', right: 0, top: 0, height: '100%',
          width: '100%', maxWidth: '440px',
          background: drawerBg,
          boxShadow: '-8px 0 40px rgba(0,0,0,0.25)',
          zIndex: 50, overflowY: 'auto',
          animation: 'slideIn 0.25s ease',
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}
      >
        <style>{`
          @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
          @keyframes spin    { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        `}</style>

        <div style={{ padding: '24px' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: headerColor, margin: 0 }}>
                 Rebalance Portfolio
              </h2>
              {data?.riskProfile && (
                <p style={{ fontSize: '12px', color: subColor, margin: '4px 0 0', textTransform: 'capitalize' }}>
                  Target: <strong>{data.riskProfile}</strong> profile
                  {data.totalPortfolioValue ? ` · Total: ${fmt(data.totalPortfolioValue)}` : ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '22px', color: closeBtnC,
                lineHeight: 1, padding: '4px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = closeBtnH}
              onMouseLeave={e => e.currentTarget.style.color = closeBtnC}
            >
              ✕
            </button>
          </div>

          <div style={{ height: '1px', background: divider, margin: '16px 0' }} />

          {/* ── Loading ── */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
              }} />
              <p style={{ color: subColor, fontSize: '14px', margin: 0 }}>Analysing your portfolio…</p>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
              <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
              <button
                onClick={fetchRebalanceData}
                style={{
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white',
                  border: 'none', borderRadius: '8px', padding: '8px 18px',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Balanced ── */}
          {!loading && !error && data && !data.suggestions?.length && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: headerColor, margin: '0 0 8px' }}>
                Portfolio is Balanced!
              </h3>
              <p style={{ fontSize: '13px', color: subColor, margin: 0 }}>
                Your allocation is within 5% of your {data.riskProfile} target.
              </p>
            </div>
          )}

          {/* ── Main content ── */}
          {!loading && !error && data?.suggestions?.length > 0 && (
            <>
              {/* Summary box */}
              <div style={{
                background: summaryBg, border: `1px solid ${summaryBor}`,
                borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
              }}>
                <p style={{ fontSize: '12px', color: summaryTxt, margin: 0, lineHeight: '1.6' }}>
                  💡 <strong>{data.suggestions.length} rebalancing action{data.suggestions.length > 1 ? 's' : ''}</strong> suggested
                  to align your portfolio with the <em>{data.riskProfile}</em> wealth target.
                  Drift threshold: ±5%.
                </p>
              </div>

              {/* ── Allocation comparison ── */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: sectionTitleC, margin: 0 }}>
                    Allocation Drift
                  </h3>
                  <button
                    onClick={() => setSortBy(s => s === 'drift' ? 'asset' : 'drift')}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '12px', color: sortBtnC, fontWeight: '600',
                    }}
                  >
                    Sort by {sortBy === 'drift' ? 'Asset' : 'Drift'} ↕
                  </button>
                </div>

                {/* Column headers */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 60px 60px 65px',
                  gap: '4px', padding: '4px 10px', marginBottom: '4px',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: colHeader, textTransform: 'uppercase' }}>Asset</span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: colHeader, textAlign: 'right', textTransform: 'uppercase' }}>Now</span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#f59e0b', textAlign: 'right', textTransform: 'uppercase' }}>Target</span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: colHeader, textAlign: 'right', textTransform: 'uppercase' }}>Drift</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {sortedRows.map((row) => {
                    const dc = getDriftColor(row.drift);
                    return (
                      <div key={row.asset} style={{
                        display: 'grid', gridTemplateColumns: '1fr 60px 60px 65px',
                        gap: '4px', padding: '8px 10px',
                        background: dc.bg, borderRadius: '8px',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: sectionTitleC, textTransform: 'capitalize' }}>
                          {row.asset.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontSize: '12px', color: subColor, textAlign: 'right' }}>
                          {row.current.toFixed(1)}%
                        </span>
                        <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600', textAlign: 'right' }}>
                          {row.target.toFixed(1)}%
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: dc.text, textAlign: 'right' }}>
                          {row.drift > 0 ? '+' : ''}{row.drift.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Suggested actions ── */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: sectionTitleC, margin: '0 0 12px' }}>
                  Suggested Actions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.suggestions.map((suggestion, idx) => (
                    <SuggestionCard key={idx} suggestion={suggestion} />
                  ))}
                </div>
              </div>

              {/* Refresh link */}
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <button
                  onClick={fetchRebalanceData}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '12px', color: sortBtnC, fontWeight: '600',
                  }}
                >
                 ↻ Refresh analysis
                </button>
              </div>
            </>
          )}

          {/* No investments */}
          {!loading && !error && data?.message && !data.suggestions?.length && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: subColor, fontSize: '14px' }}>
              {data.message}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default RebalanceDrawer;