import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RecommendationCard from '../components/RecommendationCard';

// ────────────────────────────────────────────────────────────────────────────

const Recommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const response = await api.get('/recommendations');
            setRecommendations(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch recommendations', err);
            setError('Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = (id) => {
        setRecommendations(prev =>
            prev.map(rec =>
                rec.id === id ? { ...rec, is_read: true } : rec
            )
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Recommendations</h1>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-5 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                                <div className="h-40 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchRecommendations}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Recommendations Yet</h2>
                    <p className="text-gray-500">
                        Complete your risk profile and add investments to get personalized recommendations.
                    </p>
                    <button
                        onClick={() => window.location.href = '/profile'}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Go to Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommendations</h1>
                <p className="text-gray-500 mb-6">
                    Personalized portfolio suggestions based on your risk profile
                </p>
                <div className="space-y-4">
                    {recommendations.map((rec) => (
                        <RecommendationCard
                            key={rec.id}
                            recommendation={rec}
                            onMarkRead={handleMarkRead}
                            isRead={rec.is_read}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Recommendations;