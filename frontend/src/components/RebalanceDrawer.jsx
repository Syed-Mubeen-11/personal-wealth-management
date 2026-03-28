import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SuggestionCard from './SuggestionCard';
// ────────────────────────────────────────────────────────────────────────────

const RebalanceDrawer = ({ isOpen, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('drift');

    useEffect(() => {
        if (isOpen) {
            fetchRebalanceData();
        }
    }, [isOpen]);

    const fetchRebalanceData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/recommendations/rebalance');
            setData(response.data);
            } catch (error) {
        console.error('Failed to fetch rebalance data', error);
    } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    const getDriftColor = (drift) => {
        if (drift < -2) return 'bg-green-50 text-green-700';
        if (drift > 2) return 'bg-red-50 text-red-700';
        return 'bg-gray-50 text-gray-700';
    };

    const getSortedRows = () => {
        if (!data?.currentWeights) return [];
        const rows = Object.keys(data.currentWeights).map(asset => ({
            asset,
            current: data.currentWeights[asset] * 100,
            target: data.targetWeights[asset] * 100,
            drift: (data.currentWeights[asset] - data.targetWeights[asset]) * 100
        }));
        if (sortBy === 'drift') {
            return rows.sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));
        }
        return rows.sort((a, b) => a.asset.localeCompare(b.asset));
    };

    const sortedRows = getSortedRows();

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 overflow-y-auto"
                onKeyDown={handleKeyDown}
                tabIndex={-1}
            >
                <div className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Rebalance Portfolio</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Analyzing portfolio...</p>
                        </div>
                    ) : !data?.suggestions?.length ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-3">✅</div>
                            <h3 className="text-lg font-semibold">Portfolio is Balanced</h3>
                            <p className="text-gray-500">Your current allocation matches your target.</p>
                        </div>
                    ) : (
                        <>
                            {/* Allocation Comparison Table */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold">Allocation Comparison</h3>
                                    <button
                                        onClick={() => setSortBy(sortBy === 'drift' ? 'asset' : 'drift')}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        Sort by {sortBy === 'drift' ? 'Asset' : 'Drift'}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {sortedRows.map((row) => (
                                        <div key={row.asset} className={`p-3 rounded-lg ${getDriftColor(row.drift)}`}>
                                            <div className="flex justify-between text-sm">
                                                <span className="capitalize font-medium">{row.asset.replace(/_/g, ' ')}</span>
                                                <span className={row.drift > 0 ? 'text-red-600' : row.drift < 0 ? 'text-green-600' : ''}>
                                                    {row.drift > 0 ? '+' : ''}{row.drift.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs mt-1">
                                                <span>Current: {row.current.toFixed(1)}%</span>
                                                <span>Target: {row.target.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Suggested Actions */}
                            <div>
                                <h3 className="font-semibold mb-3">Suggested Actions</h3>
                                <div className="space-y-3">
                                    {data.suggestions.map((suggestion, idx) => (
                                        <SuggestionCard key={idx} suggestion={suggestion} />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default RebalanceDrawer;