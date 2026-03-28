import React from 'react';

const SuggestionCard = ({ suggestion }) => {
    const isBuy = suggestion.action === 'BUY';

    return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        isBuy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {suggestion.action}
                    </span>
                    <span className="font-semibold text-gray-900">{suggestion.symbol}</span>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">
                        {suggestion.qty_change?.toFixed(2)} units
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                        ₹{suggestion.estimated_value?.toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="mt-2 flex items-center">
                <span className={`text-sm ${suggestion.drift_impact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {suggestion.drift_impact > 0 ? '↑' : '↓'} Drift impact: {Math.abs(suggestion.drift_impact || 0).toFixed(1)}%
                </span>
            </div>
        </div>
    );
};

export default SuggestionCard;