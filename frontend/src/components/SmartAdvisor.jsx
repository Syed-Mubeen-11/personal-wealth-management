import React, { useEffect, useState } from 'react';
import { fetchRecommendations } from '../services/recommendationService';

const SmartAdvisor = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchRecommendations();
        setData(res);
      } catch (err) {
        console.error("Advisor error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-6 bg-white rounded-2xl animate-pulse h-32">Loading insights...</div>;
  if (!data) return null;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg mb-8">
      <div className="flex items-start gap-4">
        <div className="bg-white/20 p-3 rounded-xl text-2xl">💡</div>
        <div>
          <h2 className="text-lg font-bold mb-2">Smart Financial Advisor</h2>
          <p className="text-blue-50 leading-relaxed mb-4">
            {data.recommendation_text}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.suggested_allocation).map(([key, val]) => (
              <span key={key} className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                {key}: {val}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAdvisor;