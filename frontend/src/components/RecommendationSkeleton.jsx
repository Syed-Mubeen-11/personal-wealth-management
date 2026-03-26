import React from 'react';

export default function RecommendationSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((pulseId) => (
        <div 
          key={pulseId} 
          className="bg-white border rounded-lg p-6 shadow animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="flex gap-4 mb-4">
            <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
            <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="h-40 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  );
}
