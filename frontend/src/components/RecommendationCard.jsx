import React, { useState } from 'react';
import api from '../services/api';
import AllocationChart from './AllocationChart';

const RecommendationCard = ({ recommendation, onMarkRead, isRead }) => {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [read, setRead] = useState(isRead);

    const handleMarkAsRead = async () => {
        if (read) return;
        setLoading(true);
        try {
            await api.patch(`/recommendations/${recommendation.id}/read`);
            setRead(true);
            onMarkRead?.(recommendation.id);
        } catch (error) {
        console.error('Failed to mark as read', error);
        alert('Failed to mark as read');
    } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDominantAsset = () => {
        if (!recommendation.suggested_allocation) return 'gray';
        const entries = Object.entries(recommendation.suggested_allocation);
        const max = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
        const colors = {
            stocks: 'blue',
            etfs: 'green',
            mutual_funds: 'orange',
            bonds: 'purple',
            cash: 'red'
        };
        return colors[max[0]] || 'gray';
    };

    const borderColor = getDominantAsset();

    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-${borderColor}-500 transition-all ${read ? 'opacity-75' : ''}`}>
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {recommendation.title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                            {recommendation.recommendation_text}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            {formatDate(recommendation.created_at)}
                        </p>
                    </div>
                    <button
                        onClick={handleMarkAsRead}
                        disabled={read || loading}
                        className={`ml-4 px-3 py-1 rounded text-sm ${
                            read
                                ? 'bg-gray-100 text-gray-500 cursor-default'
                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                    >
                        {loading ? '...' : read ? 'Read' : 'Mark as Read'}
                    </button>
                </div>

                <div className="mt-4">
                    <AllocationChart allocation={recommendation.suggested_allocation} />
                </div>

                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                    {expanded ? '▼ Hide Full Breakdown' : '▶ View Full Breakdown'}
                </button>

                {expanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-2">Detailed Allocation</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(recommendation.suggested_allocation).map(([key, value]) => (
                                <div key={key} className="flex justify-between py-1">
                                    <span className="capitalize text-gray-600">{key.replace(/_/g, ' ')}:</span>
                                    <span className="font-medium">{(value * 100).toFixed(1)}%</span>
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