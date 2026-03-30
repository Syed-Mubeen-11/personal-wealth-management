import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getRecommendations } from '../services/recommendationService';
import RecommendationCard from '../components/RecommendationCard';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const data = await getRecommendations();
        // Ensure data is an array before setting state
        setRecommendations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching recommendations", err);
      } finally {
        // Task F1-3: Simulate minimum 200ms loading for skeleton visibility
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };
    fetchRecs();
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar />

      <main className="ml-64 p-8 w-full">
        {/* Page Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight underline decoration-blue-500/30 underline-offset-8">
              Wealth Advisor
            </h1>
            <p className="text-gray-500 mt-2">
              Personalized asset allocation based on your financial pulse.
            </p>
          </div>
        </header>

        {/* Conditional Rendering Logic */}
        {loading ? (
          /* Task F1-3: Loading Skeleton - 3 pulsing grey cards */
          <div className="grid gap-8">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="h-[400px] bg-white rounded-[2rem] animate-pulse border border-gray-100 shadow-sm" 
              />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          /* Task F1-3: Empty State Illustration */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 shadow-inner">
            <div className="text-7xl mb-6 animate-bounce">💎</div>
            <h3 className="text-2xl font-bold text-gray-800">No Recommendations Yet</h3>
            <p className="text-gray-500 mb-8 max-w-xs text-center">
              Complete your risk profile and add your income/expenses to unlock AI suggestions.
            </p>
            <button 
              onClick={() => window.location.href = '/profile'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              UPDATE PROFILE
            </button>
          </div>
        ) : (
          /* Task F1-4: Recommendation Cards Grid */
          <div className="grid gap-8 pb-12">
            {recommendations.map((item) => (
              <RecommendationCard 
                key={item.id} 
                recommendation={item} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Recommendations;