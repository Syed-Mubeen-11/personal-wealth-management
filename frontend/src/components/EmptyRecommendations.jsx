import React from 'react';
import { Target } from 'lucide-react';

export default function EmptyRecommendations() {
  return (
    <div className="flex flex-col items-center justify-center bg-white border rounded-lg p-10 shadow mt-6 text-center">
      <div className="bg-blue-50 p-6 rounded-full mb-6">
        <Target size={48} className="text-[#234C6A]" />
      </div>
      <h2 className="text-2xl font-semibold mb-3 text-gray-800">No Recommendations Yet</h2>
      <p className="text-gray-500 mb-6 max-w-sm">
        Complete your risk profile and setup your financial goals to start receiving personalized allocation recommendations from AI.
      </p>
      <a 
        href="/profile" 
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
      >
        Complete Risk Profile
      </a>
    </div>
  );
}
