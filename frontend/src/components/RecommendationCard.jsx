import React, { useState, useContext } from 'react';
import api from '../services/api';
import AllocationChart from './AllocationChart';
import { ThemeContext } from '../context/Themecontext';

const RecommendationCard = ({ recommendation, onMarkRead, isRead }) => {
    const { darkMode: dark } = useContext(ThemeContext);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [read, setRead]         = useState(isRead);

    // ── Theme tokens ──────────────────────────────────────────────────────────
    const cardBg      = dark ? '#1f2937'       : 'white';
    const cardBorder  = dark ? '#374151'       : '#e5e7eb';
    const titleColor  = dark ? 'white'         : '#111827';
    const bodyColor   = dark ? 'rgba(255,255,255,0.65)' : '#4b5563';
    const metaColor   = dark ? 'rgba(255,255,255,0.4)'  : '#9ca3af';
    const dividerColor= dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6';
    const detailBg    = dark ? 'rgba(255,255,255,0.04)' : '#f9fafb';
    const detailLabel = dark ? 'rgba(255,255,255,0.6)'  : '#6b7280';
    const detailValue = dark ? 'white' : '#111827';

    const readBtnStyle = read
        ? { background: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: dark ? 'rgba(255,255,255,0.45)' : '#9ca3af', cursor: 'default' }
        : { background: dark ? 'rgba(99,102,241,0.2)' : '#eef2ff', color: '#6366f1', cursor: 'pointer' };

    const handleMarkAsRead = async () => {
        if (read) return;
        setLoading(true);
        try {
            await api.patch(`/recommendations/${recommendation.id}/read`);
            setRead(true);
            onMarkRead?.(recommendation.id);
        } catch (error) {
            console.error('Failed to mark as read', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    // Left-border accent colour by dominant asset
    const getBorderColor = () => {
        if (!recommendation.suggested_allocation) return '#6b7280';
        const entries = Object.entries(recommendation.suggested_allocation);
        const max = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
        const colors = { stock: '#3b82f6', etf: '#10b981', mutual_fund: '#f59e0b', bond: '#8b5cf6', cash: '#ef4444' };
        return colors[max[0]] || '#6b7280';
    };

    const accentColor = getBorderColor();

    return (
        <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderLeft: `4px solid ${accentColor}`,
            borderRadius: '12px',
            overflow: 'hidden',
            opacity: read ? 0.75 : 1,
            transition: 'box-shadow 0.2s, transform 0.2s',
            boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
        }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = dark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = dark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 1px 4px rgba(0,0,0,0.06)'; }}
        >
            <div style={{ padding: '20px' }}>
                {/* Title row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: titleColor, margin: '0 0 6px' }}>
                            {recommendation.title}
                        </h3>
                        <p style={{ fontSize: '14px', color: bodyColor, margin: '0 0 6px', lineHeight: '1.6' }}>
                            {recommendation.recommendation_text}
                        </p>
                        <p style={{ fontSize: '12px', color: metaColor, margin: 0 }}>
                            {formatDate(recommendation.created_at)}
                        </p>
                    </div>
                    <button
                        onClick={handleMarkAsRead}
                        disabled={read || loading}
                        style={{
                            ...readBtnStyle,
                            border: 'none', borderRadius: '8px',
                            padding: '6px 12px', fontSize: '12px', fontWeight: '600',
                            flexShrink: 0, transition: 'opacity 0.2s',
                        }}
                    >
                        {loading ? '…' : read ? '✓ Read' : 'Mark Read'}
                    </button>
                </div>

                {/* Allocation chart */}
                <div style={{ marginTop: '16px' }}>
                    <AllocationChart allocation={recommendation.suggested_allocation} />
                </div>

                {/* Expand toggle */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        marginTop: '12px', background: 'none', border: 'none',
                        cursor: 'pointer', fontSize: '13px', color: '#6366f1',
                        fontWeight: '600', padding: 0,
                    }}
                >
                    {expanded ? '▼ Hide Breakdown' : '▶ View Full Breakdown'}
                </button>

                {/* Expanded allocation table */}
                {expanded && (
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${dividerColor}` }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: titleColor, margin: '0 0 10px' }}>
                            Detailed Allocation
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                            {Object.entries(recommendation.suggested_allocation).map(([key, value]) => (
                                <div key={key} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '8px 10px', background: detailBg, borderRadius: '8px',
                                }}>
                                    <span style={{ fontSize: '13px', textTransform: 'capitalize', color: detailLabel }}>
                                        {key.replace(/_/g, ' ')}
                                    </span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: detailValue }}>
                                        {(value * 100).toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendationCard;