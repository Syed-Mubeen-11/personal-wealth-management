import React, { useState } from 'react';
import useRecommendations from '../hooks/useRecommendations';
import RecommendationCard from '../components/RecommendationCard';
import RecommendationSkeleton from '../components/RecommendationSkeleton';
import EmptyRecommendations from '../components/EmptyRecommendations';
import { RefreshCw, AlertCircle, X } from 'lucide-react';

export default function Recommendations() {
  const { data, loading, error, refetch, toggleReadOptimistic } = useRecommendations();
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = React.useRef(null);
  const fallbackDate = React.useMemo(() => new Date().toISOString(), []);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await toggleReadOptimistic(id, false);
    } catch (err) {
      showToast('Failed to mark as read. Please try again.');
    }
  };

  const items = Array.isArray(data) ? data : (data?.items || []);

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI Recommendations</h1>
          <p className="text-gray-500 mt-1">Personalized asset allocation advice based on your risk profile</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded shadow-sm text-gray-600 hover:text-blue-600 hover:border-blue-200 transition disabled:opacity-50"
          aria-label="Refresh recommendations"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {loading && items.length === 0 ? (
        <RecommendationSkeleton />
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded shadow-sm text-red-800">
          <div className="flex items-start gap-4">
            <AlertCircle size={24} className="mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-1">Failed to load recommendations</h3>
              <p className="opacity-90">{error.response?.data?.detail || error.message || 'An unexpected error occurred.'}</p>
              <button 
                onClick={() => refetch()} 
                className="mt-4 bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded font-medium transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <EmptyRecommendations />
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <RecommendationCard
              key={item.id}
              id={item.id}
              title={item.title || 'Allocation Recommendation'}
              recommendationText={item.recommendation_text || item.description || ''}
              createdAt={item.created_at || fallbackDate}
              suggestedAllocation={item.suggested_allocation}
              isRead={item.is_read || false}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up z-50">
          <AlertCircle size={20} className={toast.type === 'error' ? 'text-red-400' : 'text-green-400'} />
          <p className="font-medium">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white transition">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}