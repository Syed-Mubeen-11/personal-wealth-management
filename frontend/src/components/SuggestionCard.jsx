import React, { useContext } from 'react';
import { ThemeContext } from '../context/Themecontext';

/**
 * SuggestionCard
 * ──────────────────────────────────────────────────────────────────────────
 * Displays a single rebalance suggestion from the backend.
 *
 * Backend shape (from /recommendations/rebalance):
 *   { asset: string, action: "Buy"|"Sell", amount: number, reason: string }
 */
const SuggestionCard = ({ suggestion }) => {
    const { darkMode: dark } = useContext(ThemeContext);
    const isBuy = suggestion.action === 'Buy';

    // ── Theme tokens ──────────────────────────────────────────────────────────
    const cardBg     = dark ? 'rgba(255,255,255,0.04)' : '#f9fafb';
    const cardBorder = dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
    const assetColor = dark ? 'white'   : '#111827';
    const reasonColor= dark ? 'rgba(255,255,255,0.6)' : '#6b7280';
    const amtColor   = dark ? 'white'   : '#111827';

    const buyStyle  = { background: '#dcfce7', color: '#15803d' };
    const sellStyle = { background: '#fee2e2', color: '#dc2626' };
    const actionStyle = isBuy ? buyStyle : sellStyle;

    const fmt = (n) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(n);

    return (
        <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderLeft: `3px solid ${isBuy ? '#10b981' : '#ef4444'}`,
            borderRadius: '10px',
            padding: '14px 16px',
            transition: 'background 0.15s',
        }}>
            {/* Top row: action badge + asset name + amount */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        ...actionStyle,
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                        letterSpacing: '0.4px', flexShrink: 0,
                    }}>
                        {isBuy ? '↑ Buy' : '↓ Sell'}
                    </span>
                    <span style={{
                        fontWeight: '700', fontSize: '14px', color: assetColor,
                        textTransform: 'capitalize',
                    }}>
                        {String(suggestion.asset).replace(/_/g, ' ')}
                    </span>
                </div>
                <span style={{ fontSize: '15px', fontWeight: '800', color: isBuy ? '#10b981' : '#ef4444' }}>
                    {fmt(suggestion.amount)}
                </span>
            </div>

            {/* Reason */}
            <p style={{
                fontSize: '12px', color: reasonColor, margin: '8px 0 0',
                lineHeight: '1.5',
            }}>
                {suggestion.reason}
            </p>
        </div>
    );
};

export default SuggestionCard;