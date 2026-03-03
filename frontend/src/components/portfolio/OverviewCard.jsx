import React from 'react';

function OverviewCard({ title, value, subtitle, isPositive, showPercent }) {
    const formatValue = (val) => {
        if (typeof val === 'number') {
            return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return val;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">{title}</p>
            <p className={`text-2xl font-bold ${
                isPositive !== undefined 
                    ? (isPositive ? 'text-green-600' : 'text-red-600') 
                    : 'text-gray-900'
            }`}>
                {isPositive !== undefined && (isPositive ? '+' : '')}
                ${formatValue(value)}
                {showPercent && subtitle && (
                    <span className="text-sm ml-2">({subtitle}%)</span>
                )}
            </p>
            {!showPercent && subtitle && (
                <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
        </div>
    );
}

export default OverviewCard;
