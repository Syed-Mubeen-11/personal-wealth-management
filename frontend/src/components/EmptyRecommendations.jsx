import React from 'react';
import { Target } from 'lucide-react';

export default function EmptyRecommendations({ onGenerate, loading }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-3xl p-16 shadow-2xl mt-12 text-center max-w-4xl mx-auto">
      <div className="bg-[#1B3C53]/5 p-10 rounded-full mb-10 group-hover:scale-110 transition-transform duration-500">
        <Target size={64} className="text-[#1B3C53]" />
      </div>
      <h2 className="text-4xl font-[1000] mb-6 text-[#1B3C53] uppercase tracking-tight">No Insights Available</h2>
      <p className="text-xl text-gray-500 mb-12 max-w-xl leading-relaxed font-medium">
        Your strategic recommendations are calculated based on your risk profile and current holdings. Trigger a fresh calculation to see your AI-optimized allocation.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
        <button 
          onClick={onGenerate}
          disabled={loading}
          className="bg-[#1B3C53] hover:bg-[#234C6A] text-white font-black py-5 px-10 rounded-2xl transition-all shadow-xl hover:shadow-2xl active:scale-95 uppercase tracking-widest text-sm disabled:opacity-50"
        >
          {loading ? 'Initializing AI Engine...' : 'Generate AI Strategy'}
        </button>
        
        <a 
          href="/profile" 
          className="bg-gray-100 hover:bg-gray-200 text-[#1B3C53] font-black py-5 px-10 rounded-2xl transition-all uppercase tracking-widest text-sm"
        >
          Review Risk Profile
        </a>
      </div>
    </div>
  );
}
