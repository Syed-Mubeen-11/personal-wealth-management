import React, { useState } from 'react';
import useRecommendations from '../hooks/useRecommendations';
import RecommendationCard from '../components/RecommendationCard';
import RecommendationSkeleton from '../components/RecommendationSkeleton';
import EmptyRecommendations from '../components/EmptyRecommendations';
import { RefreshCw, AlertCircle, X } from 'lucide-react';

export default function Recommendations() {
  const { data, loading, error, refetch, generate, toggleReadOptimistic } = useRecommendations();
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

  const handleManualGenerate = async () => {
    try {
      await generate();
      showToast('Insight refreshed successfully.', 'success');
    } catch (err) {
      showToast('Failed to refresh insights. Ensure your risk profile is complete.');
    }
  };

  const items = Array.isArray(data) ? data : (data?.items || []);

  return (
    <div className="w-full p-6 sm:p-8 lg:p-12 relative min-h-screen bg-[#F8FAFC]">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-12">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-5xl font-black text-[#1B3C53] tracking-tighter mb-4 uppercase leading-none">Perspective</h1>
          <p className="text-base sm:text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
            Strategic asset allocation directives based on your global risk profile and market liquidity analysis.
          </p>
        </div>
        <button
          onClick={handleManualGenerate}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1B3C53] hover:bg-[#234C6A] text-white rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 w-full sm:w-auto"
          aria-label="Refresh recommendations"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span className="font-bold text-xs uppercase tracking-widest">{loading ? 'Processing' : 'Sync'}</span>
        </button>
      </div>

      {loading && items.length === 0 ? (
        <RecommendationSkeleton />
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-2xl shadow-sm text-red-800">
          <div className="flex items-start gap-5">
            <AlertCircle size={28} className="mt-0.5 flex-shrink-0 text-red-600" />
            <div>
              <h3 className="font-black text-xl mb-2 uppercase tracking-wide">Sync Failure</h3>
              <p className="opacity-90 font-medium">{error.response?.data?.detail || error.message || 'An unexpected error occurred.'}</p>
              <button 
                onClick={handleManualGenerate} 
                className="mt-6 bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded-lg font-bold transition shadow-md"
              >
                Retry Insight Generation
              </button>
            </div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <EmptyRecommendations onGenerate={handleManualGenerate} loading={loading} />
      ) : (
        <div className="space-y-10">
          {items.map((item) => (
            <RecommendationCard
              key={item.id}
              id={item.id}
              title={item.title || 'Portfolio Strategy'}
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
        <div className="fixed bottom-10 right-6 sm:right-10 bg-[#1B3C53] text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up z-50 border border-white/10 backdrop-blur-sm">
          <AlertCircle size={22} className={toast.type === 'error' ? 'text-red-400' : 'text-green-400'} />
          <p className="font-bold tracking-wide">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-4 p-1 rounded-full hover:bg-white/10 transition">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}