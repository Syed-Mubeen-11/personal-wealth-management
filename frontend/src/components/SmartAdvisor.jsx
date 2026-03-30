import React, { useEffect, useState } from 'react';
// We use getRecommendations to match your service file
import { getRecommendations } from '../services/recommendationService';

const SmartAdvisor = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // FIX: Calling getRecommendations (the imported name)
        const res = await getRecommendations();
        
        // The API returns a list. We want the most recent/first recommendation.
        if (res && res.length > 0) {
          setData(res[0]); 
        }
      } catch (err) {
        console.error("Advisor error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-6 bg-white rounded-2xl animate-pulse h-32 mb-8 border border-gray-100">Loading insights...</div>;
  
  // If no data exists yet, we show a friendly prompt instead of returning null
  if (!data) return (
    <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8 flex items-center gap-4">
      <span className="text-2xl">⏳</span>
      <p className="text-blue-800 text-sm font-medium">अपनी पहली निवेश अनुशंसा प्राप्त करने के लिए अपनी प्रोफ़ाइल पूरी करें।</p>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg mb-8">
      <div className="flex items-start gap-4">
        <div className="bg-white/20 p-3 rounded-xl text-2xl">💡</div>
        <div className="flex-1">
          <h2 className="text-lg font-bold mb-1">Smart Financial Advisor</h2>
          <p className="text-blue-50 text-xs mb-3 opacity-80 uppercase tracking-widest font-bold">Recommended Strategy</p>
          
          <p className="text-blue-50 leading-relaxed mb-4 text-sm">
            {data.recommendation_text}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {data.suggested_allocation && Object.entries(data.suggested_allocation).map(([key, val]) => (
              <span key={key} className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black border border-white/20 uppercase">
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